import { ContentLayout } from "@/components/content-layout";
import { AiExtractForm } from "./_components/ai-extract-form";

export default function AiExtractPage() {
  return (
    <ContentLayout title="AI Extract">
      <div className="mx-auto max-w-5xl">
        <AiExtractForm />
      </div>
    </ContentLayout>
  );
}
