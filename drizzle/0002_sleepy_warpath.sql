CREATE TABLE "paredao_participantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"paredao_id" integer NOT NULL,
	"nome" text NOT NULL,
	"foto_url" text,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paredao_votos" (
	"id" serial PRIMARY KEY NOT NULL,
	"paredao_id" integer NOT NULL,
	"participante_id" integer NOT NULL,
	"voter_hash" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paredoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"encerra_em" timestamp with time zone NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paredao_participantes" ADD CONSTRAINT "paredao_participantes_paredao_fkey" FOREIGN KEY ("paredao_id") REFERENCES "public"."paredoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paredao_votos" ADD CONSTRAINT "paredao_votos_paredao_fkey" FOREIGN KEY ("paredao_id") REFERENCES "public"."paredoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paredao_votos" ADD CONSTRAINT "paredao_votos_participante_fkey" FOREIGN KEY ("participante_id") REFERENCES "public"."paredao_participantes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "paredao_votos_um_por_pessoa" ON "paredao_votos" USING btree ("paredao_id","voter_hash");