export function Footer() {
  return (
    <div className="z-20 w-full border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="mx-4 flex h-14 items-center justify-between sm:mx-8">
        <p className="text-xs font-medium text-muted-foreground md:text-sm">
          &copy; {new Date().getFullYear()} Magnetix Infosystems Development Pvt Ltd. All rights reserved.
        </p>
        <p className="text-xs font-medium text-muted-foreground md:text-sm">
          Developed by Danish Shamshee
        </p>
      </div>
    </div>
  );
}
