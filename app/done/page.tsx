"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mascot } from "@/components/mascot/Mascot";

function DoneContent() {
  const params = useSearchParams();
  const stars = parseInt(params.get("stars") ?? "0", 10);
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-cream">
      <Mascot emotion="celebrating" />
      <div className="text-6xl">{"⭐".repeat(stars)}</div>
      <Link
        href="/"
        className="px-8 py-4 bg-yellow rounded-2xl border-4 border-ink/80 text-2xl font-bold"
      >
        Next →
      </Link>
    </div>
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-cream" />}>
      <DoneContent />
    </Suspense>
  );
}
