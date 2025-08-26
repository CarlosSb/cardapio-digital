import { CardsSkeleton, TextSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <TextSkeleton className="md:w-1/2 w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardsSkeleton />
      </div>
    </main>
  );
}
