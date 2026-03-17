"use client";

import dynamic from "next/dynamic";

const TherapistAgreement = dynamic(() => import("@/legacy-pages/legal/TherapistAgreement"), {
	ssr: false,
});

export default function TherapistAgreementPage() {
	return <TherapistAgreement />;
}
