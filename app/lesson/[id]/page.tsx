import { LessonPlayer } from "@/components/layout/LessonPlayer";
import { allLessons } from "@/lessons";

export function generateStaticParams() {
  return Object.keys(allLessons).map((id) => ({ id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonPlayer lessonId={id} />;
}
