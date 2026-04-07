import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Icon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
