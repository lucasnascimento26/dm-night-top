CREATE TABLE "recados_anonimos" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"photo_url" text,
	"music_url" text,
	"numero_destinatario" varchar(20),
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"ip" text,
	"sinalizado" boolean DEFAULT false NOT NULL,
	"termos_detectados" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
