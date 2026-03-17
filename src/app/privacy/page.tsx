"use client";

import dynamic from "next/dynamic";

const Privacy = dynamic(() => import("@/legacy-pages/Privacy"), {
	ssr: false,
});

export default function PrivacyPage() {
	return <Privacy />;
}
