import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
} from "drizzle-orm/pg-core"

// --- Tabelas obrigatórias do Better Auth -------------------------------------------
// Nomes das colunas em camelCase para corresponder aos padrões do Better Auth. Não renomeie.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  // Campos obrigatórios do Better Auth
  tokenId: text("tokenId"),
  accessTokenTokenType: text("accessTokenTokenType"),
  refreshTokenTokenType: text("refreshTokenTokenType"),
  idTokenTokenType: text("idTokenTokenType"),
  // Campos obrigatórios do Better Auth v1.1.0+
  federationId: text("federationId"),
  federationUser: text("federationUser"),
  // Campos obrigatórios do Better Auth v1.0.0+
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  // Campos obrigatórios do Better Auth v0.3.0+
  passwordHash: text("passwordHash"),
  // Campos obrigatórios do Better Auth v0.2.0+
  salt: text("salt"),
  // Campos obrigatórios do Better Auth v0.1.0+
  // O erro mencionava o campo "issuer" - adicionando baseado na mensagem de erro
  issuer: text("issuer"),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- Tabelas do app CRM --------------------------------------------------------
// Cada tabela carrega uma coluna simples `userId` para que todas as consultas sejam
// escopo por psicólogo autenticado. Sem chaves estrangeiras por design.

// Leads / captação: pessoas interessadas que ainda não são pacientes.
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  // Origem: indicacao, instagram, google, site, convenio, outro
  source: text("source").notNull().default("outro"),
  // Status do funil: novo, contatado, agendado, convertido, perdido
  status: text("status").notNull().default("novo"),
  // Motivo/queixa inicial relatada
  concern: text("concern"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Pacientes: cadastro clínico básico + prontuário via evoluções.
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  birthDate: text("birthDate"),
  // Status: ativo, alta, pausado, inativo
  status: text("status").notNull().default("ativo"),
  // Valor da sessão em centavos
  sessionPriceCents: integer("sessionPriceCents").notNull().default(0),
  // Frequência: semanal, quinzenal, mensal, sob_demanda
  frequency: text("frequency").notNull().default("semanal"),
  // Queixa principal / motivo do acompanhamento
  mainComplaint: text("mainComplaint"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Evoluções / anotações de prontuário de cada paciente.
export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  patientId: integer("patientId").notNull(),
  sessionDate: timestamp("sessionDate").notNull().defaultNow(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Agenda de sessões / consultas.
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  // Vinculado a um paciente OU a um nome livre (ex.: primeira consulta de lead)
  patientId: integer("patientId"),
  title: text("title").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  durationMin: integer("durationMin").notNull().default(50),
  // Tipo: primeira, retorno, sessao, avaliacao
  type: text("type").notNull().default("sessao"),
  // Status: agendada, concluida, cancelada, faltou
  status: text("status").notNull().default("agendada"),
  // Modalidade: online, presencial
  modality: text("modality").notNull().default("presencial"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Acompanhamento de contatos / follow-ups.
export const followups = pgTable("followups", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  contactName: text("contactName").notNull(),
  // Canal: whatsapp, ligacao, email, presencial
  channel: text("channel").notNull().default("whatsapp"),
  // A quem se relaciona: lead, paciente, outro
  relatedType: text("relatedType").notNull().default("lead"),
  relatedId: integer("relatedId"),
  dueDate: timestamp("dueDate").notNull(),
  // Status: pendente, concluido
  status: text("status").notNull().default("pendente"),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
