import { pgTable, text, timestamp, serial, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { showsTable } from "./shows";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  showId: integer("show_id").notNull().references(() => showsTable.id, { onDelete: "cascade" }),
  amountPaid: doublePrecision("amount_paid").notNull(),
  paymentRef: text("payment_ref").notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, purchasedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
