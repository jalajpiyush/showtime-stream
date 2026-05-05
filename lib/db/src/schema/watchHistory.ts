import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { showsTable } from "./shows";

export const watchHistoryTable = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  showId: integer("show_id").notNull().references(() => showsTable.id, { onDelete: "cascade" }),
  progressSeconds: integer("progress_seconds").notNull().default(0),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWatchHistorySchema = createInsertSchema(watchHistoryTable).omit({ id: true, watchedAt: true });
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistoryTable.$inferSelect;
