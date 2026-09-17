import { relations } from "drizzle-orm/relations";
import { damasDcLeiloes, damasDcLances, damasDcCasaisAtivos, damasDcLeiloesMensagens, damasDesafios, damasComprovacoes } from "./schema";

export const damasDcLancesRelations = relations(damasDcLances, ({one}) => ({
	damasDcLeiloe: one(damasDcLeiloes, {
		fields: [damasDcLances.leilaoId],
		references: [damasDcLeiloes.id]
	}),
}));

export const damasDcLeiloesRelations = relations(damasDcLeiloes, ({many}) => ({
	damasDcLances: many(damasDcLances),
	damasDcCasaisAtivos: many(damasDcCasaisAtivos),
	damasDcLeiloesMensagens: many(damasDcLeiloesMensagens),
}));

export const damasDcCasaisAtivosRelations = relations(damasDcCasaisAtivos, ({one}) => ({
	damasDcLeiloe: one(damasDcLeiloes, {
		fields: [damasDcCasaisAtivos.leilaoId],
		references: [damasDcLeiloes.id]
	}),
}));

export const damasDcLeiloesMensagensRelations = relations(damasDcLeiloesMensagens, ({one}) => ({
	damasDcLeiloe: one(damasDcLeiloes, {
		fields: [damasDcLeiloesMensagens.leilaoId],
		references: [damasDcLeiloes.id]
	}),
}));

export const damasComprovacoesRelations = relations(damasComprovacoes, ({one}) => ({
	damasDesafio: one(damasDesafios, {
		fields: [damasComprovacoes.desafioId],
		references: [damasDesafios.id]
	}),
}));

export const damasDesafiosRelations = relations(damasDesafios, ({many}) => ({
	damasComprovacoes: many(damasComprovacoes),
}));