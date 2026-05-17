import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/layout/LessonPlayer";
import { allLessons, getLesson } from "@/lessons";

export function generateStaticParams() {
  return Object.keys(allLessons).map((id) => ({ id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getLesson(id)) notFound();
  return <LessonPlayer lessonId={id} />;
}
