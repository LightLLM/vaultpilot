"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
