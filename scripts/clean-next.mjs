import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const nextDir = path.join(rootDir, ".next");

const OVERRIDE_ENV = "FORCE_CLEAN_NEXT";

const normalizeCommand = (value) => value.toLowerCase().replace(/["']/g, "").replace(/\s+/g, " ").trim();

const looksLikeNextServerCommand = (value) => {
	const command = normalizeCommand(value);

	return (
		/\bnext(?:\.cmd)?\s+dev\b/.test(command) ||
		/\bnext(?:\.cmd)?\s+start\b/.test(command) ||
		command.includes("npm run dev") ||
		command.includes("pnpm dev") ||
		command.includes("yarn dev") ||
		command.includes("npm run start") ||
		command.includes("pnpm start") ||
		command.includes("yarn start")
	);
};

const getWindowsProcessCommands = () => {
	const output = execFileSync(
		"powershell.exe",
		[
			"-NoProfile",
			"-Command",
			"Get-CimInstance Win32_Process | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress",
		],
		{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
	);

	const parsed = JSON.parse(output || "[]");
	const items = Array.isArray(parsed) ? parsed : [parsed];

	return items
		.filter((item) => item?.CommandLine)
		.map((item) => ({ pid: Number(item.ProcessId), command: String(item.CommandLine) }));
};

const getPosixProcessCommands = () => {
	const output = execFileSync("ps", ["-ax", "-o", "pid=,command="], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});

	return output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const match = line.match(/^(\d+)\s+(.*)$/);
			return match ? { pid: Number(match[1]), command: match[2] } : null;
		})
		.filter(Boolean);
};

const findRunningNextServerProcesses = () => {
	try {
		const processes = process.platform === "win32" ? getWindowsProcessCommands() : getPosixProcessCommands();

		return processes.filter((item) => item.pid !== process.pid && looksLikeNextServerCommand(item.command));
	} catch {
		return [];
	}
};

if (process.env[OVERRIDE_ENV] !== "1") {
	const serverProcesses = findRunningNextServerProcesses();

	if (serverProcesses.length > 0) {
		console.error(
			[
				"Refusing to delete .next because a Next dev/start server appears to be running.",
				`Stop \`npm run dev\` or \`npm run start\` first, or rerun with ${OVERRIDE_ENV}=1 if you intend to force a clean.`,
				`Detected process: ${serverProcesses[0].command}`,
			].join("\n"),
		);

		process.exit(1);
	}
}

rmSync(nextDir, { recursive: true, force: true });
