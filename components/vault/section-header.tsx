import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 space-y-2", className)}>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
