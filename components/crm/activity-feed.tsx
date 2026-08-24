import {
  Phone,
  Mail,
  CalendarDays,
  CircleDollarSign,
  StickyNote,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { activities, type Activity } from "@/lib/crm-data"

const iconMap: Record<Activity["type"], LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
  deal: CircleDollarSign,
  note: StickyNote,
}

const toneMap: Record<Activity["type"], string> = {
  call: "bg-chart-2/12 text-chart-2",
  email: "bg-chart-1/12 text-chart-1",
  meeting: "bg-chart-4/15 text-chart-4",
  deal: "bg-chart-3/15 text-chart-3",
  note: "bg-muted text-muted-foreground",
}

export function ActivityFeed() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
        <CardDescription>Últimas ações da equipe</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ol className="relative flex flex-col gap-5">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type]
            const isLast = index === activities.length - 1
            return (
              <li key={activity.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${toneMap[activity.type]}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  {!isLast && (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-1">
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.detail}
                  </p>
                  <span className="text-xs text-muted-foreground/70">
                    {activity.time}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
