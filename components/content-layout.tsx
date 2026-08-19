import { Navbar } from "@/components/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div>
      <Navbar title={title} />
      <div className="container mx-auto px-4 pb-8 pt-6 sm:px-8">{children}</div>
    </div>
  );
}
