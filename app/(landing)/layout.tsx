import { ModeToggle } from "@/components/mode-toggle";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Floating theme toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ModeToggle />
      </div>
      {children}
    </div>
  );
}
