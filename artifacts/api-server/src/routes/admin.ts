import { Router } from "express";
import { db, usersTable, ticketsTable, showsTable } from "@workspace/db";
import { eq, count, sum, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

// GET /api/admin/users
router.get("/users", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    const ticketCounts = await db
      .select({ userId: ticketsTable.userId, cnt: count(ticketsTable.id) })
      .from(ticketsTable)
      .groupBy(ticketsTable.userId);

    const countMap = new Map(ticketCounts.map((t) => [t.userId, Number(t.cnt)]));

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName ?? null,
      isAdmin: u.isAdmin,
      ticketCount: countMap.get(u.id) ?? 0,
      createdAt: u.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/purchases
router.get("/purchases", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const tickets = await db
      .select()
      .from(ticketsTable)
      .orderBy(desc(ticketsTable.purchasedAt));

    const result = await Promise.all(
      tickets.map(async (t) => {
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, t.userId));
        const [show] = await db
          .select()
          .from(showsTable)
          .where(eq(showsTable.id, t.showId));

        return {
          id: t.id,
          userId: t.userId,
          userEmail: user?.email ?? "unknown",
          showTitle: show?.title ?? "unknown",
          amountPaid: t.amountPaid,
          paymentRef: t.paymentRef,
          purchasedAt: t.purchasedAt.toISOString(),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing purchases");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/dashboard
router.get("/dashboard", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const [userCount] = await db.select({ cnt: count(usersTable.id) }).from(usersTable);
    const [showCount] = await db.select({ cnt: count(showsTable.id) }).from(showsTable);
    const [ticketCount] = await db.select({ cnt: count(ticketsTable.id) }).from(ticketsTable);
    const [revenue] = await db.select({ total: sum(ticketsTable.amountPaid) }).from(ticketsTable);

    const recentTickets = await db
      .select()
      .from(ticketsTable)
      .orderBy(desc(ticketsTable.purchasedAt))
      .limit(5);

    const recentPurchases = await Promise.all(
      recentTickets.map(async (t) => {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, t.userId));
        const [show] = await db.select().from(showsTable).where(eq(showsTable.id, t.showId));
        return {
          id: t.id,
          userId: t.userId,
          userEmail: user?.email ?? "unknown",
          showTitle: show?.title ?? "unknown",
          amountPaid: t.amountPaid,
          paymentRef: t.paymentRef,
          purchasedAt: t.purchasedAt.toISOString(),
        };
      }),
    );

    res.json({
      totalUsers: Number(userCount?.cnt ?? 0),
      totalRevenue: Number(revenue?.total ?? 0),
      totalTickets: Number(ticketCount?.cnt ?? 0),
      totalShows: Number(showCount?.cnt ?? 0),
      recentPurchases,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching admin dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
