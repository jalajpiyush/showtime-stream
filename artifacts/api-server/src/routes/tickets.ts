import { Router } from "express";
import { db, ticketsTable, showsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, ensureUser, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

// GET /api/tickets — my tickets
router.get("/", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.userId, userId));

    const result = await Promise.all(
      tickets.map(async (t) => {
        const [show] = await db
          .select()
          .from(showsTable)
          .where(eq(showsTable.id, t.showId));

        return {
          id: t.id,
          userId: t.userId,
          showId: t.showId,
          show: show
            ? {
                id: show.id,
                title: show.title,
                description: show.description,
                thumbnailUrl: show.thumbnailUrl ?? null,
                videoUrl: show.videoUrl ?? null,
                price: show.price,
                category: show.category,
                genre: show.genre ?? null,
                duration: show.duration ?? null,
                startTime: show.startTime ?? null,
                isLive: show.isLive,
                isFeatured: show.isFeatured,
                ticketCount: 0,
                createdAt: show.createdAt.toISOString(),
              }
            : null,
          amountPaid: t.amountPaid,
          paymentRef: t.paymentRef,
          purchasedAt: t.purchasedAt.toISOString(),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing tickets");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tickets/purchase
router.post("/purchase", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const { showId, paymentMethodToken } = req.body;

    if (!showId) {
      res.status(400).json({ error: "showId is required" });
      return;
    }

    // Check show exists
    const [show] = await db
      .select()
      .from(showsTable)
      .where(eq(showsTable.id, Number(showId)));

    if (!show) {
      res.status(404).json({ error: "Show not found" });
      return;
    }

    // Check if already purchased
    const existing = await db
      .select()
      .from(ticketsTable)
      .where(and(eq(ticketsTable.userId, userId), eq(ticketsTable.showId, Number(showId))));

    if (existing.length > 0) {
      res.status(400).json({ error: "You already have a ticket for this show" });
      return;
    }

    // Mock payment — always succeeds
    const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const [ticket] = await db
      .insert(ticketsTable)
      .values({
        userId,
        showId: Number(showId),
        amountPaid: show.price,
        paymentRef,
      })
      .returning();

    res.status(201).json({
      id: ticket.id,
      userId: ticket.userId,
      showId: ticket.showId,
      show: {
        id: show.id,
        title: show.title,
        description: show.description,
        thumbnailUrl: show.thumbnailUrl ?? null,
        videoUrl: show.videoUrl ?? null,
        price: show.price,
        category: show.category,
        genre: show.genre ?? null,
        duration: show.duration ?? null,
        startTime: show.startTime ?? null,
        isLive: show.isLive,
        isFeatured: show.isFeatured,
        ticketCount: 0,
        createdAt: show.createdAt.toISOString(),
      },
      amountPaid: ticket.amountPaid,
      paymentRef: ticket.paymentRef,
      purchasedAt: ticket.purchasedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error purchasing ticket");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/tickets/check/:showId
router.get("/check/:showId", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const showId = parseInt(req.params.showId as string);

    if (isNaN(showId)) {
      res.status(400).json({ error: "Invalid showId" });
      return;
    }

    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(and(eq(ticketsTable.userId, userId), eq(ticketsTable.showId, showId)));

    if (!ticket) {
      res.json({ hasAccess: false });
      return;
    }

    const [show] = await db
      .select()
      .from(showsTable)
      .where(eq(showsTable.id, showId));

    res.json({
      hasAccess: true,
      ticket: {
        id: ticket.id,
        userId: ticket.userId,
        showId: ticket.showId,
        show: show
          ? {
              id: show.id,
              title: show.title,
              description: show.description,
              thumbnailUrl: show.thumbnailUrl ?? null,
              videoUrl: show.videoUrl ?? null,
              price: show.price,
              category: show.category,
              genre: show.genre ?? null,
              duration: show.duration ?? null,
              startTime: show.startTime ?? null,
              isLive: show.isLive,
              isFeatured: show.isFeatured,
              ticketCount: 0,
              createdAt: show.createdAt.toISOString(),
            }
          : null,
        amountPaid: ticket.amountPaid,
        paymentRef: ticket.paymentRef,
        purchasedAt: ticket.purchasedAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error checking ticket access");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
