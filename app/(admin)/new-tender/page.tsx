import { ContentLayout } from "@/components/content-layout";
import { TenderForm } from "./_components/tender-form";

export default function NewTenderPage() {
  return (
    <ContentLayout title="New Tender">
      <div className="mx-auto max-w-5xl">
        <TenderForm />
      </div>
    </ContentLayout>
  );
}
