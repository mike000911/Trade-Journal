import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const journals = sqliteTable("journals", { userId: text("user_id").primaryKey(), revision: integer("revision").notNull(), state: text("state_json").notNull(), updatedAt: text("updated_at").notNull() });
