export type Trend = "up" | "down"

export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  trend: Trend
  hint: string
}

export const kpis: Kpi[] = [
  {
    id: "revenue",
    label: "Receita no mês",
    value: "R$ 842.500",
    delta: "+12,4%",
    trend: "up",
    hint: "vs. mês anterior",
  },
  {
    id: "deals",
    label: "Negócios fechados",
    value: "128",
    delta: "+8,2%",
    trend: "up",
    hint: "38 em negociação",
  },
  {
    id: "leads",
    label: "Novos leads",
    value: "1.204",
    delta: "+23,1%",
    trend: "up",
    hint: "vindos de 6 canais",
  },
  {
    id: "conversion",
    label: "Taxa de conversão",
    value: "18,9%",
    delta: "-1,6%",
    trend: "down",
    hint: "meta de 21%",
  },
]

export type RevenuePoint = {
  month: string
  receita: number
  meta: number
}

export const revenueSeries: RevenuePoint[] = [
  { month: "Jan", receita: 420, meta: 500 },
  { month: "Fev", receita: 510, meta: 520 },
  { month: "Mar", receita: 480, meta: 540 },
  { month: "Abr", receita: 620, meta: 560 },
  { month: "Mai", receita: 590, meta: 600 },
  { month: "Jun", receita: 710, meta: 640 },
  { month: "Jul", receita: 680, meta: 680 },
  { month: "Ago", receita: 842, meta: 720 },
]

export type PipelineStage = {
  stage: string
  valor: number
  negocios: number
}

export const pipeline: PipelineStage[] = [
  { stage: "Prospecção", valor: 1250, negocios: 86 },
  { stage: "Qualificação", valor: 940, negocios: 54 },
  { stage: "Proposta", valor: 620, negocios: 31 },
  { stage: "Negociação", valor: 410, negocios: 19 },
  { stage: "Fechamento", valor: 280, negocios: 12 },
]

export type LeadStatus = "quente" | "morno" | "frio" | "fechado"

export type Lead = {
  id: string
  name: string
  company: string
  email: string
  value: string
  stage: string
  status: LeadStatus
  owner: string
  ownerInitials: string
}

export const leads: Lead[] = [
  {
    id: "1",
    name: "Marina Alves",
    company: "TechNova Ltda.",
    email: "marina@technova.com",
    value: "R$ 48.000",
    stage: "Negociação",
    status: "quente",
    owner: "Rafael Souza",
    ownerInitials: "RS",
  },
  {
    id: "2",
    name: "Bruno Carvalho",
    company: "Meridian Group",
    email: "bruno@meridian.io",
    value: "R$ 22.500",
    stage: "Proposta",
    status: "morno",
    owner: "Julia Lima",
    ownerInitials: "JL",
  },
  {
    id: "3",
    name: "Camila Ferreira",
    company: "Aurora Digital",
    email: "camila@auroradigital.com",
    value: "R$ 91.200",
    stage: "Fechamento",
    status: "fechado",
    owner: "Rafael Souza",
    ownerInitials: "RS",
  },
  {
    id: "4",
    name: "Diego Martins",
    company: "Vértice Consultoria",
    email: "diego@vertice.com.br",
    value: "R$ 15.800",
    stage: "Qualificação",
    status: "morno",
    owner: "Pedro Nunes",
    ownerInitials: "PN",
  },
  {
    id: "5",
    name: "Larissa Gomes",
    company: "Onda Marketing",
    email: "larissa@onda.co",
    value: "R$ 7.400",
    stage: "Prospecção",
    status: "frio",
    owner: "Julia Lima",
    ownerInitials: "JL",
  },
  {
    id: "6",
    name: "Thiago Ramos",
    company: "Construtora Pilar",
    email: "thiago@pilar.eng.br",
    value: "R$ 63.000",
    stage: "Negociação",
    status: "quente",
    owner: "Pedro Nunes",
    ownerInitials: "PN",
  },
]

export type Activity = {
  id: string
  type: "call" | "email" | "meeting" | "deal" | "note"
  title: string
  detail: string
  time: string
  initials: string
}

export const activities: Activity[] = [
  {
    id: "a1",
    type: "deal",
    title: "Negócio fechado com Aurora Digital",
    detail: "R$ 91.200 · plano anual Enterprise",
    time: "há 12 min",
    initials: "RS",
  },
  {
    id: "a2",
    type: "call",
    title: "Ligação com Marina Alves",
    detail: "TechNova · alinhamento de proposta",
    time: "há 48 min",
    initials: "RS",
  },
  {
    id: "a3",
    type: "email",
    title: "Proposta enviada para Meridian Group",
    detail: "Aguardando retorno de Bruno Carvalho",
    time: "há 2 h",
    initials: "JL",
  },
  {
    id: "a4",
    type: "meeting",
    title: "Reunião agendada com Construtora Pilar",
    detail: "Amanhã, 14h · demonstração do produto",
    time: "há 3 h",
    initials: "PN",
  },
  {
    id: "a5",
    type: "note",
    title: "Nota adicionada em Vértice Consultoria",
    detail: "Cliente pediu revisão de escopo",
    time: "há 5 h",
    initials: "PN",
  },
]

export type Channel = {
  source: string
  leads: number
  share: number
}

export const channels: Channel[] = [
  { source: "Busca orgânica", leads: 412, share: 34 },
  { source: "Indicação", leads: 289, share: 24 },
  { source: "Anúncios pagos", leads: 241, share: 20 },
  { source: "Redes sociais", leads: 156, share: 13 },
  { source: "Eventos", leads: 106, share: 9 },
]
