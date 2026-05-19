import Link from "next/link";

export default function LessonNotFound() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-8 bg-cream">
      <img
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/mascots/cat-idle.svg`}
        alt="Cat mascot"
        className="w-40 h-40"
      />
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-ink">Lesson not found</h1>
        <p className="text-xl text-ink/70">
          That lesson doesn&apos;t exist yet.
        </p>
      </div>
      <Link
        href="/"
        className="px-8 py-4 bg-yellow border-4 border-ink/80 rounded-2xl text-2xl font-bold text-ink hover:scale-105 transition-transform"
      >
        ← Back home
      </Link>
    </div>
  );
}
