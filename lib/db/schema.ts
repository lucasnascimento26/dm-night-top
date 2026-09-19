import { pgTable, unique, serial, varchar, integer, timestamp, text, index, date, bigserial, numeric, foreignKey, boolean, uniqueIndex, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const usuarios = pgTable("usuarios", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
	username: varchar({ length: 100 }),
	pontos: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("usuarios_user_id_key").on(table.userId),
]);

export const blacklist = pgTable("blacklist", {
	id: serial().primaryKey().notNull(),
	whatsappId: varchar("whatsapp_id", { length: 50 }).notNull(),
	motivo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("blacklist_whatsapp_id_key").on(table.whatsappId),
]);

export const convitesPendentes = pgTable("convites_pendentes", {
	id: serial().primaryKey().notNull(),
	convidado: text().notNull(),
	remetente: text().notNull(),
	nomeRemetente: text("nome_remetente").notNull(),
	grupo: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	etapa: text().default('aguardando_remetente').notNull(),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const damasDesafios = pgTable("damas_desafios", {
	id: serial().primaryKey().notNull(),
	grupoId: varchar("grupo_id", { length: 50 }).notNull(),
	casalId1: varchar("casal_id1", { length: 20 }).notNull(),
	casalId2: varchar("casal_id2", { length: 20 }).notNull(),
	descricao: text().notNull(),
	adminId: varchar("admin_id", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pendente'),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	concluidoEm: timestamp("concluido_em", { mode: 'string' }),
	concluidoPor: varchar("concluido_por", { length: 50 }).default(sql`NULL`),
	confirmadoPorCasal1: varchar("confirmado_por_casal_1", { length: 20 }),
	confirmadoPorCasal2: varchar("confirmado_por_casal_2", { length: 20 }),
}, (table) => [
	index("idx_desafio_admin").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("idx_desafio_casal").using("btree", table.casalId1.asc().nullsLast().op("text_ops"), table.casalId2.asc().nullsLast().op("text_ops")),
	index("idx_desafio_grupo").using("btree", table.grupoId.asc().nullsLast().op("text_ops")),
	index("idx_desafio_pendente").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")).where(sql`((status)::text = 'pendente'::text)`),
	index("idx_desafio_usuario").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.casalId1.asc().nullsLast().op("text_ops"), table.casalId2.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_desafios_casal").using("btree", table.casalId1.asc().nullsLast().op("text_ops"), table.casalId2.asc().nullsLast().op("text_ops")),
	index("idx_desafios_grupo").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	unique("unique_desafio").on(table.grupoId, table.casalId1, table.casalId2, table.criadoEm),
]);

export const confissoes = pgTable("confissoes", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	content: text().notNull(),
	status: varchar({ length: 20 }).default('pendente'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const infracoesMensagens = pgTable("infracoes_mensagens", {
	id: serial().primaryKey().notNull(),
	numero: text().notNull(),
	grupoId: text("grupo_id").notNull(),
	tipoConteudo: text("tipo_conteudo").default('desconhecido'),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_infracoes_numero_grupo").using("btree", table.numero.asc().nullsLast().op("text_ops"), table.grupoId.asc().nullsLast().op("text_ops")),
]);

export const mensagensGrupo = pgTable("mensagens_grupo", {
	id: serial().primaryKey().notNull(),
	grupoId: text("grupo_id").notNull(),
	usuarioId: text("usuario_id").notNull(),
	nome: text().notNull(),
	fotoUrl: text("foto_url"),
	quantidade: integer().default(0),
	diasInativo: integer("dias_inativo").default(0),
	ultimoAtivo: date("ultimo_ativo"),
	data: date().default(sql`CURRENT_DATE`).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_mg_grupo").using("btree", table.grupoId.asc().nullsLast().op("text_ops")),
	unique("mensagens_grupo_grupo_id_usuario_id_data_key").on(table.grupoId, table.usuarioId, table.data),
	unique("mensagens_grupo_grupo_usuario_unique").on(table.grupoId, table.usuarioId),
]);

export const antifloodAvisos = pgTable("antiflood_avisos", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	grupoId: text("grupo_id").notNull(),
	usuarioId: text("usuario_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("idx_antiflood_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_antiflood_grupo_usuario").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.usuarioId.asc().nullsLast().op("text_ops")),
	unique("uq_antiflood_avisos").on(table.grupoId, table.usuarioId),
]);

export const contatosSalvos = pgTable("contatos_salvos", {
	id: serial().primaryKey().notNull(),
	numero: text().notNull(),
	nome: text(),
	fotoUrl: text("foto_url"),
	salvoPor: text("salvo_por"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("contatos_salvos_numero_key").on(table.numero),
]);

export const damasDcMessages = pgTable("damas_dc_messages", {
	id: serial().primaryKey().notNull(),
	grupoId: text("grupo_id").notNull(),
	userId: text("user_id").notNull(),
	messageId: text("message_id").notNull(),
	tipo: text().notNull(),
	dcGanho: numeric("dc_ganho", { precision: 12, scale:  2 }).default('1').notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("damas_dc_messages_grupo_id_message_id_key").on(table.grupoId, table.messageId),
]);

export const damasDcWallets = pgTable("damas_dc_wallets", {
	userId: text("user_id").primaryKey().notNull(),
	saldo: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
});

export const damasDcLances = pgTable("damas_dc_lances", {
	id: serial().primaryKey().notNull(),
	leilaoId: integer("leilao_id").notNull(),
	userId: text("user_id").notNull(),
	valor: numeric().notNull(),
	aceito: boolean().notNull(),
	motivoRecusa: text("motivo_recusa"),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.leilaoId],
			foreignColumns: [damasDcLeiloes.id],
			name: "damas_dc_lances_leilao_id_fkey"
		}),
]);

export const damasDcCasaisAtivos = pgTable("damas_dc_casais_ativos", {
	id: serial().primaryKey().notNull(),
	grupoId: varchar("grupo_id", { length: 100 }).notNull(),
	membro1Id: varchar("membro1_id", { length: 50 }).notNull(),
	membro2Id: varchar("membro2_id", { length: 50 }).notNull(),
	leilaoId: integer("leilao_id"),
	valorDc: numeric("valor_dc").notNull(),
	status: varchar({ length: 20 }).default('ativo'),
	formadoEm: timestamp("formado_em", { mode: 'string' }).defaultNow(),
	encerradoEm: timestamp("encerrado_em", { mode: 'string' }),
	encerradoPor: varchar("encerrado_por", { length: 50 }).default(sql`NULL`),
}, (table) => [
	index("idx_casais_grupo_status").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_casais_leilao").using("btree", table.leilaoId.asc().nullsLast().op("int4_ops")),
	index("idx_casais_membro1").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.membro1Id.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("idx_casais_membro2").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.membro2Id.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.leilaoId],
			foreignColumns: [damasDcLeiloes.id],
			name: "damas_dc_casais_ativos_leilao_id_fkey"
		}).onDelete("set null"),
]);

export const damasDcLeiloes = pgTable("damas_dc_leiloes", {
	id: serial().primaryKey().notNull(),
	grupoId: text("grupo_id").notNull(),
	adminId: text("admin_id").notNull(),
	fotoMessageId: text("foto_message_id").notNull(),
	fotoPath: text("foto_path").notNull(),
	anuncioMessageId: text("anuncio_message_id"),
	valorInicial: numeric("valor_inicial").notNull(),
	valorAtual: numeric("valor_atual").notNull(),
	liderId: text("lider_id"),
	status: text().default('pendente').notNull(),
	abreEm: timestamp("abre_em", { withTimezone: true, mode: 'string' }),
	fechaEm: timestamp("fecha_em", { withTimezone: true, mode: 'string' }),
	criadoEm: timestamp("criado_em", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	fechadoEm: timestamp("fechado_em", { mode: 'string' }),
	ultimoLanceMessageId: text("ultimo_lance_message_id"),
	codigo: varchar({ length: 30 }),
	leiloadoId: varchar("leiloado_id", { length: 50 }),
	arrematadoEm: timestamp("arrematado_em", { mode: 'string' }),
	valorMaximo: numeric("valor_maximo").default('1000').notNull(),
	leiloadoNome: text("leiloado_nome"),
	liderNome: text("lider_nome"),
}, (table) => [
	uniqueIndex("damas_dc_leiloes_codigo_aberto_idx").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.codigo.asc().nullsLast().op("text_ops")).where(sql`(status = 'aberto'::text)`),
	index("idx_leiloes_anuncio").using("btree", table.anuncioMessageId.asc().nullsLast().op("text_ops")),
	index("idx_leiloes_grupo_status_ativo").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")).where(sql`(status = ANY (ARRAY['aberto'::text, 'arrematado'::text]))`),
	index("idx_leiloes_leiloado").using("btree", table.grupoId.asc().nullsLast().op("text_ops"), table.leiloadoId.asc().nullsLast().op("text_ops")),
	index("idx_leiloes_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const damasDcLeiloesMensagens = pgTable("damas_dc_leiloes_mensagens", {
	messageId: varchar("message_id", { length: 64 }).primaryKey().notNull(),
	leilaoId: integer("leilao_id").notNull(),
}, (table) => [
	index("damas_dc_leiloes_mensagens_leilao_idx").using("btree", table.leilaoId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.leilaoId],
			foreignColumns: [damasDcLeiloes.id],
			name: "damas_dc_leiloes_mensagens_leilao_id_fkey"
		}),
]);

export const damasComprovacoes = pgTable("damas_comprovacoes", {
	id: serial().primaryKey().notNull(),
	desafioId: integer("desafio_id").notNull(),
	messageId: varchar("message_id", { length: 50 }).notNull(),
	enviadoPor: varchar("enviado_por", { length: 20 }).notNull(),
	tipoMidia: varchar("tipo_midia", { length: 20 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.desafioId],
			foreignColumns: [damasDesafios.id],
			name: "damas_comprovacoes_desafio_id_fkey"
		}).onDelete("cascade"),
]);

export const diasFechados = pgTable("dias_fechados", {
	grupoId: text("grupo_id").notNull(),
	data: date().notNull(),
}, (table) => [
	primaryKey({ columns: [table.grupoId, table.data], name: "dias_fechados_pkey"}),
]);

export const advertencias = pgTable("advertencias", {
	userId: text("user_id").notNull(),
	groupId: text("group_id").notNull(),
	count: integer().default(0),
}, (table) => [
	primaryKey({ columns: [table.userId, table.groupId], name: "advertencias_pkey"}),
]);

/* -------------------------------------------------------------------- */
/*  Tabela nova — recadinhos anônimos do site                            */
/* -------------------------------------------------------------------- */

export const recadosAnonimos = pgTable("recados_anonimos", {
	id: serial("id").primaryKey().notNull(),
	content: text("content").notNull(),
	photoUrl: text("photo_url"),
	musicUrl: text("music_url"),
	photoBase64: text("photo_base64"),
	musicBase64: text("music_base64"),
	numeroDestinatario: varchar("numero_destinatario", { length: 20 }),
	status: varchar("status", { length: 20 }).default('pendente').notNull(),
	ip: text("ip"),
	sinalizado: boolean("sinalizado").default(false).notNull(),
	termosDetectados: text("termos_detectados"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export type RecadoAnonimo = typeof recadosAnonimos.$inferSelect;
export type NewRecadoAnonimo = typeof recadosAnonimos.$inferInsert;