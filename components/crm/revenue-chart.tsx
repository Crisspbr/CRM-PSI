"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { revenueSeries } from "@/lib/crm-data"

const chartConfig = {
  receita: {
    label: "Receita",
    color: "var(--chart-1)",
  },
  meta: {
    label: "Meta",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Receita vs. meta</CardTitle>
        <CardDescription>
          Faturamento mensal em milhares de reais (R$)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={revenueSeries} margin={{ left: 4, right: 4, top: 8 }}>
            <defs>
              <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-receita)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-receita)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-meta)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-meta)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              tickFormatter={(v) => `${v}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="meta"
              type="monotone"
              fill="url(#fillMeta)"
              stroke="var(--color-meta)"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            <Area
              dataKey="receita"
              type="monotone"
              fill="url(#fillReceita)"
              stroke="var(--color-receita)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
