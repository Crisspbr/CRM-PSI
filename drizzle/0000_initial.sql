CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean DEFAULT false NOT NULL,
  "image" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "session" ("id" text PRIMARY KEY NOT NULL, "expiresAt" timestamp NOT NULL, "token" text NOT NULL UNIQUE, "createdAt" timestamp DEFAULT now() NOT NULL, "updatedAt" timestamp DEFAULT now() NOT NULL, "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade);
CREATE TABLE IF NOT EXISTS "account" ("id" text PRIMARY KEY NOT NULL, "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamp, "refreshTokenExpiresAt" timestamp, "scope" text, "password" text, "tokenId" text, "accessTokenTokenType" text, "refreshTokenTokenType" text, "idTokenTokenType" text, "federationId" text, "federationUser" text, "createdAt" timestamp DEFAULT now() NOT NULL, "updatedAt" timestamp DEFAULT now() NOT NULL, "passwordHash" text, "salt" text, "issuer" text);
CREATE TABLE IF NOT EXISTS "verification" ("id" text PRIMARY KEY NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" timestamp NOT NULL, "createdAt" timestamp DEFAULT now(), "updatedAt" timestamp DEFAULT now());
CREATE TABLE IF NOT EXISTS "leads" ("id" serial PRIMARY KEY, "userId" text NOT NULL, "name" text NOT NULL, "phone" text, "email" text, "source" text DEFAULT 'outro' NOT NULL, "status" text DEFAULT 'novo' NOT NULL, "concern" text, "notes" text, "createdAt" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "patients" ("id" serial PRIMARY KEY, "userId" text NOT NULL, "name" text NOT NULL, "phone" text, "email" text, "birthDate" text, "status" text DEFAULT 'ativo' NOT NULL, "sessionPriceCents" integer DEFAULT 0 NOT NULL, "frequency" text DEFAULT 'semanal' NOT NULL, "mainComplaint" text, "notes" text, "createdAt" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "records" ("id" serial PRIMARY KEY, "userId" text NOT NULL, "patientId" integer NOT NULL, "sessionDate" timestamp DEFAULT now() NOT NULL, "content" text NOT NULL, "createdAt" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "appointments" ("id" serial PRIMARY KEY, "userId" text NOT NULL, "patientId" integer, "title" text NOT NULL, "startsAt" timestamp NOT NULL, "durationMin" integer DEFAULT 50 NOT NULL, "type" text DEFAULT 'sessao' NOT NULL, "status" text DEFAULT 'agendada' NOT NULL, "modality" text DEFAULT 'presencial' NOT NULL, "notes" text, "createdAt" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "followups" ("id" serial PRIMARY KEY, "userId" text NOT NULL, "contactName" text NOT NULL, "channel" text DEFAULT 'whatsapp' NOT NULL, "relatedType" text DEFAULT 'lead' NOT NULL, "relatedId" integer, "dueDate" timestamp NOT NULL, "status" text DEFAULT 'pendente' NOT NULL, "note" text, "createdAt" timestamp DEFAULT now() NOT NULL);
CREATE INDEX IF NOT EXISTS "leads_user_idx" ON "leads" ("userId");
CREATE INDEX IF NOT EXISTS "patients_user_idx" ON "patients" ("userId");
CREATE INDEX IF NOT EXISTS "appointments_user_starts_idx" ON "appointments" ("userId", "startsAt");
CREATE INDEX IF NOT EXISTS "followups_user_due_idx" ON "followups" ("userId", "dueDate");