import { Spinner } from "@/components/ui/spinner";
import { ContentLayout } from "@/components/content-layout";

export default function Loading() {
  return (
    <ContentLayout title="Loading...">
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3 rounded-xl border bg-card/50 p-8">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading, please wait...</p>
      </div>
    </ContentLayout>
  );
}