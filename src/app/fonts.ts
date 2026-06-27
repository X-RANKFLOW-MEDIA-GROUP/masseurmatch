import localFont from "next/font/local";

// Self-hosted Satoshi variable font (woff2/woff in public/fonts/).
// Exposes the --font-satoshi CSS variable consumed by index.css + tailwind.
export const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../../public/fonts/Satoshi-Variable.woff", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export default { satoshi };
