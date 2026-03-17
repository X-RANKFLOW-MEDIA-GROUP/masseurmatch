"use client";

import dynamic from "next/dynamic";

const Terms = dynamic(() => import("@/legacy-pages/Terms"), {
	ssr: false,
});

export default function TermsPage() {
	return <Terms />;
}
