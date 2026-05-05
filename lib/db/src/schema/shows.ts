import { pgTable, text, boolean, timestamp, serial, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const showsTable = pgTable("shows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  price: doublePrecision("price").notNull().default(0),
  category: text("category").notNull().default("now_showing"), // now_showing | upcoming
  showType: text("show_type").notNull().default("movie"), // movie | concert | live_event
  genre: text("genre"),
  language: text("language"), // Hindi | English | Kannada | Punjabi | etc.
  releaseType: text("release_type").notNull().default("online_only"), // theatre_only | online_only | hybrid
  duration: integer("duration"), // in minutes
  startTime: text("start_time"), // ISO string
  isLive: boolean("is_live").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShowSchema = createInsertSchema(showsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShow = z.infer<typeof insertShowSchema>;
export type Show = typeof showsTable.$inferSelect;
