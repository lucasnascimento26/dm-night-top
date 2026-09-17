-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"username" varchar(100),
	"pontos" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsapp_id" varchar(50) NOT NULL,
	"motivo" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blacklist_whatsapp_id_key" UNIQUE("whatsapp_id")
);
--> statement-breakpoint
CREATE TABLE "convites_pendentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"convidado" text NOT NULL,
	"remetente" text NOT NULL,
	"nome_remetente" text NOT NULL,
	"grupo" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"etapa" text DEFAULT 'aguardando_remetente' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damas_desafios" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" varchar(50) NOT NULL,
	"casal_id1" varchar(20) NOT NULL,
	"casal_id2" varchar(20) NOT NULL,
	"descricao" text NOT NULL,
	"admin_id" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pendente',
	"criado_em" timestamp DEFAULT now(),
	"concluido_em" timestamp,
	"concluido_por" varchar(50) DEFAULT NULL,
	"confirmado_por_casal_1" varchar(20),
	"confirmado_por_casal_2" varchar(20),
	CONSTRAINT "unique_desafio" UNIQUE("grupo_id","casal_id1","casal_id2","criado_em")
);
--> statement-breakpoint
CREATE TABLE "confissoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'pendente',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "infracoes_mensagens" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"grupo_id" text NOT NULL,
	"tipo_conteudo" text DEFAULT 'desconhecido',
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mensagens_grupo" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"nome" text NOT NULL,
	"foto_url" text,
	"quantidade" integer DEFAULT 0,
	"dias_inativo" integer DEFAULT 0,
	"ultimo_ativo" date,
	"data" date DEFAULT CURRENT_DATE NOT NULL,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "mensagens_grupo_grupo_id_usuario_id_data_key" UNIQUE("grupo_id","usuario_id","data"),
	CONSTRAINT "mensagens_grupo_grupo_usuario_unique" UNIQUE("grupo_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "antiflood_avisos" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"grupo_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "uq_antiflood_avisos" UNIQUE("grupo_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "contatos_salvos" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"nome" text,
	"foto_url" text,
	"salvo_por" text,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "contatos_salvos_numero_key" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "damas_dc_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message_id" text NOT NULL,
	"tipo" text NOT NULL,
	"dc_ganho" numeric(12, 2) DEFAULT '1' NOT NULL,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "damas_dc_messages_grupo_id_message_id_key" UNIQUE("grupo_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "damas_dc_wallets" (
	"user_id" text PRIMARY KEY NOT NULL,
	"saldo" numeric(12, 2) DEFAULT '0' NOT NULL,
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "damas_dc_lances" (
	"id" serial PRIMARY KEY NOT NULL,
	"leilao_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"valor" numeric NOT NULL,
	"aceito" boolean NOT NULL,
	"motivo_recusa" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damas_dc_casais_ativos" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" varchar(100) NOT NULL,
	"membro1_id" varchar(50) NOT NULL,
	"membro2_id" varchar(50) NOT NULL,
	"leilao_id" integer,
	"valor_dc" numeric NOT NULL,
	"status" varchar(20) DEFAULT 'ativo',
	"formado_em" timestamp DEFAULT now(),
	"encerrado_em" timestamp,
	"encerrado_por" varchar(50) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "damas_dc_leiloes" (
	"id" serial PRIMARY KEY NOT NULL,
	"grupo_id" text NOT NULL,
	"admin_id" text NOT NULL,
	"foto_message_id" text NOT NULL,
	"foto_path" text NOT NULL,
	"anuncio_message_id" text,
	"valor_inicial" numeric NOT NULL,
	"valor_atual" numeric NOT NULL,
	"lider_id" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"abre_em" timestamp with time zone,
	"fecha_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"fechado_em" timestamp,
	"ultimo_lance_message_id" text,
	"codigo" varchar(30),
	"leiloado_id" varchar(50),
	"arrematado_em" timestamp,
	"valor_maximo" numeric DEFAULT '1000' NOT NULL,
	"leiloado_nome" text,
	"lider_nome" text
);
--> statement-breakpoint
CREATE TABLE "damas_dc_leiloes_mensagens" (
	"message_id" varchar(64) PRIMARY KEY NOT NULL,
	"leilao_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damas_comprovacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"desafio_id" integer NOT NULL,
	"message_id" varchar(50) NOT NULL,
	"enviado_por" varchar(20) NOT NULL,
	"tipo_midia" varchar(20),
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dias_fechados" (
	"grupo_id" text NOT NULL,
	"data" date NOT NULL,
	CONSTRAINT "dias_fechados_pkey" PRIMARY KEY("grupo_id","data")
);
--> statement-breakpoint
CREATE TABLE "advertencias" (
	"user_id" text NOT NULL,
	"group_id" text NOT NULL,
	"count" integer DEFAULT 0,
	CONSTRAINT "advertencias_pkey" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
ALTER TABLE "damas_dc_lances" ADD CONSTRAINT "damas_dc_lances_leilao_id_fkey" FOREIGN KEY ("leilao_id") REFERENCES "public"."damas_dc_leiloes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damas_dc_casais_ativos" ADD CONSTRAINT "damas_dc_casais_ativos_leilao_id_fkey" FOREIGN KEY ("leilao_id") REFERENCES "public"."damas_dc_leiloes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damas_dc_leiloes_mensagens" ADD CONSTRAINT "damas_dc_leiloes_mensagens_leilao_id_fkey" FOREIGN KEY ("leilao_id") REFERENCES "public"."damas_dc_leiloes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damas_comprovacoes" ADD CONSTRAINT "damas_comprovacoes_desafio_id_fkey" FOREIGN KEY ("desafio_id") REFERENCES "public"."damas_desafios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_desafio_admin" ON "damas_desafios" USING btree ("admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_desafio_casal" ON "damas_desafios" USING btree ("casal_id1" text_ops,"casal_id2" text_ops);--> statement-breakpoint
CREATE INDEX "idx_desafio_grupo" ON "damas_desafios" USING btree ("grupo_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_desafio_pendente" ON "damas_desafios" USING btree ("grupo_id" text_ops,"status" text_ops) WHERE ((status)::text = 'pendente'::text);--> statement-breakpoint
CREATE INDEX "idx_desafio_usuario" ON "damas_desafios" USING btree ("grupo_id" text_ops,"casal_id1" text_ops,"casal_id2" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_desafios_casal" ON "damas_desafios" USING btree ("casal_id1" text_ops,"casal_id2" text_ops);--> statement-breakpoint
CREATE INDEX "idx_desafios_grupo" ON "damas_desafios" USING btree ("grupo_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_infracoes_numero_grupo" ON "infracoes_mensagens" USING btree ("numero" text_ops,"grupo_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_mg_grupo" ON "mensagens_grupo" USING btree ("grupo_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_antiflood_expires" ON "antiflood_avisos" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_antiflood_grupo_usuario" ON "antiflood_avisos" USING btree ("grupo_id" text_ops,"usuario_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_casais_grupo_status" ON "damas_dc_casais_ativos" USING btree ("grupo_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_casais_leilao" ON "damas_dc_casais_ativos" USING btree ("leilao_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_casais_membro1" ON "damas_dc_casais_ativos" USING btree ("grupo_id" text_ops,"membro1_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_casais_membro2" ON "damas_dc_casais_ativos" USING btree ("grupo_id" text_ops,"membro2_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "damas_dc_leiloes_codigo_aberto_idx" ON "damas_dc_leiloes" USING btree ("grupo_id" text_ops,"codigo" text_ops) WHERE (status = 'aberto'::text);--> statement-breakpoint
CREATE INDEX "idx_leiloes_anuncio" ON "damas_dc_leiloes" USING btree ("anuncio_message_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_leiloes_grupo_status_ativo" ON "damas_dc_leiloes" USING btree ("grupo_id" text_ops,"status" text_ops) WHERE (status = ANY (ARRAY['aberto'::text, 'arrematado'::text]));--> statement-breakpoint
CREATE INDEX "idx_leiloes_leiloado" ON "damas_dc_leiloes" USING btree ("grupo_id" text_ops,"leiloado_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_leiloes_status" ON "damas_dc_leiloes" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "damas_dc_leiloes_mensagens_leilao_idx" ON "damas_dc_leiloes_mensagens" USING btree ("leilao_id" int4_ops);
*/