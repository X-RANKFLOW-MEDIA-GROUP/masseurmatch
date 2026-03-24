"use client";
import dynamic from "next/dynamic";

const MasseurProfile = dynamic(() => import("@/components/MasseurProfile"), { ssr: false });

export default MasseurProfile;
