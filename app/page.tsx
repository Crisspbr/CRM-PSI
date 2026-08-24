"use client"

import Link from "next/link"
import { CalendarDays, Users, UserRoundPlus, ClipboardCheck, Trash2, RotateCcw, Target, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Handshake, HeartPulse, BarChart3, Bell } from "lucide-react"
import { useState, useEffect } from "react"

import { PageTitle, Status, Empty } from "@/components/crm/clinical-ui"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Line, LineChart, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts"

const formatCurrency = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`
const formatDate = (dateStr: unknown) => {
  if (dateStr == null || typeof dateStr !== 'string') {
    return "";
  }
  if (dateStr.trim() === "") {
    return "";
  }
  try {
    const datePart = dateStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return "";
    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(year, month - 1, day));
  } catch (e) {
    return "";
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString("pt-BR")}{entry.name === "receita" || entry.name === "meta" ? "k" : ""}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [kpis, setKpis] = useState<any>(null)
  const [patientStatus, setPatientStatus] = useState<any>(null)
  const [pipelineData, setPipelineData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [channelData, setChannelData] = useState<any[]>([])
  const [weeklyAppointments, setWeeklyAppointments] = useState<any[]>([])
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            setKpis(data.kpis)
            setPatientStatus(data.patientStatus)
            // Set actual data from API response (no more mock data)
            setPipelineData(data.pipelineData || [])
            setRevenueData(data.revenueData || [])
            setChannelData(data.channelData || [])
            setWeeklyAppointments(data.weeklyAppointments || [])
            setRecentPatients(data.recentPatients || [])
            // Set upcoming appointments from the dashboard data (next 5 appointments)
            setUpcomingAppointments(data.nextAppointments || [])
            setError(null)
          }
        } else {
          setError("Erro ao carregar dados do dashboard")
        }
      } catch (err) {
        console.error("API not available:", err)
        setError("API não disponível")
      }
    }
    fetchDashboardData()
    
    // Automatically clean past sessions when dashboard loads
    const cleanPastSessions = async () => {
      try {
        const res = await fetch("/api/agenda/clean-past", {
          method: "POST",
          credentials: "include"
        })
        if (!res.ok) {
          console.error("Erro ao limpar sessões passadas")
        } else {
          // Optionally reload or update state if needed
          // window.location.reload() // Uncomment if full reload is desired
        }
      } catch (error) {
        console.error("Erro ao limpar sessões passadas:", error)
      }
    }
    
    cleanPastSessions()
  }, [])

  // Show loading state or error
  if (!mounted) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return <div className="text-center py-12">{error}</div>
  }

  if (!user) {
    return <div className="text-center py-12">Autenticação necessária</div>
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header with user greeting and clean past button */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <PageTitle
            title={`Olá, ${user.name?.split(" ")[0]}`}
            description="Confira as métricas da sua clínica hoje."
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-hover bg-muted hover:bg-muted/50">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2">
                          {upcomingAppointments
                            .filter(appt => {
                              const apptTime = new Date(appt.startsAt);
                              const now = new Date();
                              const diffMs = apptTime - now;
                              return diffMs >= 0 && diffMs <= 60 * 60 * 1000;
                            })
                            .map((appt) => {
                              const apptTime = new Date(appt.startsAt);
                              const timeString = apptTime.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'America/Sao_Paulo',
                              });
                              return (
                                <DropdownMenuItem key={appt.id} className="flex items-center gap-3 text-sm">
                                  <div className="flex-shrink-0">
                                    <CalendarDays className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{timeString}</p>
                                    <p className="text-white">{appt.patientName} - {appt.title}</p>
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis && (
          <>
            <Card key="revenue" className="transition-all hover:shadow-lg border-l-4 border-l-[var(--chart-1)] relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Receita no mês</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{kpis.revenue.value}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`inline-flex items-center gap-1 text-sm font-medium ${kpis.revenue.trend === "up" ? "text-[oklch(0.65_0.15_160)]" : "text-red-600"}`}>
                        {kpis.revenue.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {kpis.revenue.delta}
                      </div>
                      <span className="text-xs text-muted-foreground">{kpis.revenue.hint}</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-primary text-white shrink-0">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card key="patients" className="transition-all hover:shadow-lg border-l-4 border-l-[var(--chart-1)] relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Pacientes ativos</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{kpis.activePatients.value}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="inline-flex items-center gap-1 text-sm font-medium text-[oklch(0.65_0.15_160)]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {kpis.activePatients.delta}
                      </div>
                      <span className="text-xs text-muted-foreground">{kpis.activePatients.hint}</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-[oklch(0.65_0.15_160)] text-white shrink-0">
                    <HeartPulse className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card key="sessions" className="transition-all hover:shadow-lg border-l-4 border-l-[var(--chart-1)] relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Sessões agendadas</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{kpis.scheduledSessions.value}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="inline-flex items-center gap-1 text-sm font-medium text-[oklch(0.65_0.15_160)]">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {kpis.scheduledSessions.delta}
                      </div>
                      <span className="text-xs text-muted-foreground">{kpis.scheduledSessions.hint}</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-[oklch(0.55_0.12_200)] text-white shrink-0">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card key="occupancy" className="transition-all hover:shadow-lg border-l-4 border-l-[var(--chart-1)] relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Taxa de ocupação</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{kpis.occupancyRate.value}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        {kpis.occupancyRate.delta}
                      </div>
                      <span className="text-xs text-muted-foreground">{kpis.occupancyRate.hint}</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 bg-[oklch(0.62_0.16_280)] text-white shrink-0">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Grid - 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        
        {/* Left Column - Charts */}
        <div className="space-y-6">
          
          {/* Revenue Chart */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-semibold text-muted-foreground">Receita vs. Meta</CardTitle>
              <CardDescription>Faturamento mensal em milhares de reais (R$)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ChartContainer config={chartConfigRevenue} className="h-[320px] w-full">
                <AreaChart data={revenueData} margin={{ left: 8, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(40, 85%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(40, 85%, 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillSessoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(200, 60%, 45%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(200, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                                      dataKey="month"
                                      tickLine={false}
                                      axisLine={false}
                                      tickMargin={8}
                                      tick={{ fontSize: 12, fill: "#fff" }}
                                    />
                                    <YAxis
                                      tickLine={false}
                                      axisLine={false}
                                      tickMargin={8}
                                      width={50}
                                      tickFormatter={(v) => `${v}k`}
                                      tick={{ fontSize: 12, fill: "#fff" }}
                                    />
                  <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="meta"
                    type="monotone"
                    fill="url(#fillMeta)"
                    stroke="hsl(160, 60%, 45%)"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="receita"
                    type="monotone"
                    fill="url(#fillReceita)"
                    stroke="hsl(40, 85%, 55%)"
                    strokeWidth={2.5}
                  />
                  <Area
                    dataKey="sessoes"
                    type="monotone"
                    fill="url(#fillSessoes)"
                    stroke="hsl(200, 60%, 45%)"
                    strokeWidth={2}
                    opacity={0.7}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pipeline & Weekly Charts Row */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Pipeline Chart */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-semibold text-muted-foreground">Pipeline de Pacientes</CardTitle>
                <CardDescription>Valor em aberto por etapa do funil</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ChartContainer config={chartConfigPipeline} className="h-[280px] w-full">
                  <BarChart
                    data={pipelineData}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={95}
                      tick={{ fontSize: 12, fill: "#fff" }}
                    />
                    <ChartTooltip
                                          cursor={false}
                                          content={<ChartTooltipContent
                                            formatter={(value: number, _name: string, item: any) => (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-foreground">
                                                  {formatCurrency(value)} mil
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                  {item.payload.pacientes} pacientes
                                                </span>
                                              </div>
                                            )}
                                          />}
                                        />
                    <Bar
                      dataKey="valor"
                      fill="#8884d8"
                      radius={[0, 6, 6, 0]}
                      barSize={26}
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Weekly Appointments */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-semibold text-muted-foreground">Agendamentos da Semana</CardTitle>
                <CardDescription>Visão semanal de sessões</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ChartContainer config={chartConfigWeekly} className="h-[280px] w-full">
                  <BarChart data={weeklyAppointments} margin={{ left: 8, right: 8, top: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 12, fill: "#fff" }}
                                      />
                                      <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={40}
                                        tick={{ fontSize: 12, fill: "#fff" }}
                                      />
                    <ChartTooltip cursor={false} content={<CustomTooltip />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="agendadas" fill="hsl(40, 70%, 55%)" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="realizadas" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="canceladas" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Patient Sources Pie Chart */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Origem dos Pacientes</CardTitle>
              <CardDescription>Distribuição por canal de aquisição</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ChartContainer config={{}} className="h-[280px] w-full">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="source"
                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<ChartTooltipContent
                      formatter={(value: number, _name: string, item: any) => (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{item.payload.source}</span>
                          <span className="text-muted-foreground text-sm">
                            {value} pacientes ({(value / channelData.reduce((a, b) => a + b.value, 0) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Patient Status & Recent Patients */}
        <div className="space-y-6">
          
          {/* Patient Status Cards */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status dos Pacientes</CardTitle>
              <CardDescription>Visão geral do fluxo de atendimento</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {patientStatus && (
                  <>
                    <div key="emTratamento" className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg p-2 bg-primary text-white">
                              <HeartPulse className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">Em tratamento</h3>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{patientStatus.emTratamento}</p>
                          <p className="text-xs text-muted-foreground mt-1">Pacientes ativos</p>
                          <Progress value={Math.min((patientStatus.emTratamento / Math.max(patientStatus.emTratamento + patientStatus.aguardandoRetorno + patientStatus.novosEsteMes + patientStatus.altaMedica, 1)) * 100)} className="mt-3 h-1.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div key="aguardandoRetorno" className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg p-2 bg-[oklch(0.72_0.18_85)] text-white">
                              <ClipboardCheck className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">Aguardando retorno</h3>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{patientStatus.aguardandoRetorno}</p>
                          <p className="text-xs text-muted-foreground mt-1">Contatos pendentes</p>
                          <Progress value={Math.min((patientStatus.aguardandoRetorno / Math.max(patientStatus.emTratamento + patientStatus.aguardandoRetorno + patientStatus.novosEsteMes + patientStatus.altaMedica, 1)) * 100)} className="mt-3 h-1.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div key="novosEsteMes" className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg p-2 bg-[oklch(0.65_0.15_160)] text-white">
                              <UserRoundPlus className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">Novos este mês</h3>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{patientStatus.novosEsteMes}</p>
                          <p className="text-xs text-muted-foreground mt-1">Primeira consulta</p>
                          <Progress value={Math.min((patientStatus.novosEsteMes / Math.max(patientStatus.emTratamento + patientStatus.aguardandoRetorno + patientStatus.novosEsteMes + patientStatus.altaMedica, 1)) * 100)} className="mt-3 h-1.5" />
                        </div>
                      </div>
                    </div>
                    
                    <div key="altaMedica" className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg p-2 bg-[oklch(0.55_0.12_200)] text-white">
                              <Handshake className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">Alta médica</h3>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{patientStatus.altaMedica}</p>
                          <p className="text-xs text-muted-foreground mt-1">Concluídos este mês</p>
                          <Progress value={Math.min((patientStatus.altaMedica / Math.max(patientStatus.emTratamento + patientStatus.aguardandoRetorno + patientStatus.novosEsteMes + patientStatus.altaMedica, 1)) * 100)} className="mt-3 h-1.5" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients Table */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pacientes Recentes</CardTitle>
                  <CardDescription>Últimos atendimentos e próximos agendados</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/pacientes">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Paciente</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Última visita</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Próxima visita</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Terapeuta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentPatients.map((patient) => (
                      <tr key={patient.name} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-sm text-foreground">{patient.name}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                          {formatDate(patient.lastVisit)}
                        </td>
                        <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                          {formatDate(patient.nextVisit)}
                        </td>
                        <td className="p-4">
                          <Status value={patient.status} />
                        </td>
                        <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                          {patient.therapist}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              <CardDescription>Acesse as funcionalidades mais usadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="h-auto py-4 flex-col items-start gap-2 text-left" asChild>
                  <Link href="/pacientes">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <UserRoundPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Novo Paciente</p>
                        <p className="text-xs text-muted-foreground">Cadastrar novo paciente</p>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col items-start gap-2 text-left" asChild>
                  <Link href="/agenda">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[oklch(0.65_0.15_160)/10] p-2 text-[oklch(0.65_0.15_160)]">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Agendar Sessão</p>
                        <p className="text-xs text-muted-foreground">Nova sessão na agenda</p>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col items-start gap-2 text-left" asChild>
                  <Link href="/leads">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[oklch(0.55_0.12_200)/10] p-2 text-[oklch(0.55_0.12_200)]">
                        <Handshake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Gerenciar Leads</p>
                        <p className="text-xs text-muted-foreground">Ver leads em captação</p>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col items-start gap-2 text-left" asChild>
                  <Link href="/relatorios">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-[oklch(0.72_0.18_85)/10] p-2 text-[oklch(0.72_0.18_85)]">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Relatórios</p>
                        <p className="text-xs text-muted-foreground">Exportar dados da clínica</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

// Chart configurations
const chartConfigRevenue = {
  receita: { label: "Receita (R$ mil)", color: "hsl(40, 85%, 55%)" },
  meta: { label: "Meta (R$ mil)", color: "hsl(160, 60%, 45%)" },
  sessoes: { label: "Sessões", color: "hsl(200, 60%, 45%)" },
} satisfies ChartConfig

const chartConfigPipeline = {
  valor: { label: "Valor (R$ mil)", color: "hsl(40, 70%, 55%)" },
} satisfies ChartConfig

const chartConfigWeekly = {
  agendadas: { label: "Agendadas", color: "hsl(40, 70%, 55%)" },
  realizadas: { label: "Realizadas", color: "hsl(160, 60%, 45%)" },
  canceladas: { label: "Canceladas", color: "hsl(0, 70%, 50%)" }
} satisfies ChartConfig