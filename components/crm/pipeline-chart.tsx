"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { pipeline } from "@/lib/crm-data"

const chartConfig = {
  valor: {
    label: "Valor (R$ mil)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function PipelineChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Pipeline de negócios</CardTitle>
        <CardDescription>
          Valor em aberto por etapa do funil
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={pipeline}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={92}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        R$ {Number(value).toLocaleString("pt-BR")} mil
                      </span>
                      <span className="text-muted-foreground">
                        {item.payload.negocios} negócios
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="valor"
              fill="var(--color-valor)"
              radius={[0, 6, 6, 0]}
              barSize={26}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
