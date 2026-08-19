export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="mx-4 flex h-14 items-center justify-between sm:mx-8">
        <p className="text-xs font-medium text-muted-foreground md:text-sm">
          &copy; {new Date().getFullYear()} RFP Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
