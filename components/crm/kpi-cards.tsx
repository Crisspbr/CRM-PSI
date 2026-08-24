import { TrendingUp, TrendingDown } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { kpis } from "@/lib/crm-data"

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const isUp = kpi.trend === "up"
        const TrendIcon = isUp ? TrendingUp : TrendingDown
        return (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {kpi.value}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    isUp
                      ? "bg-chart-3/15 text-chart-3"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <TrendIcon className="size-3" />
                  {kpi.delta}
                </span>
                <span className="text-muted-foreground">{kpi.hint}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
