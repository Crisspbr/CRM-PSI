import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { channels } from "@/lib/crm-data"

export function ChannelsCard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Origem dos leads</CardTitle>
        <CardDescription>Distribuição por canal de aquisição</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        {channels.map((channel) => (
          <div key={channel.source} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {channel.source}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {channel.leads} · {channel.share}%
              </span>
            </div>
            <Progress value={channel.share * 2.9} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
