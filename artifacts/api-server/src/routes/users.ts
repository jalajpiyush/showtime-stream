import { Router } from "express";
import { db, usersTable, watchHistoryTable, showsTable, ticketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ensureUser, type AuthRequest } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

// GET /api/users/me
router.get("/me", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarUrl ?? null,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/me
router.patch("/me", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const { displayName, avatarUrl } = req.body;

    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName ?? null,
      avatarUrl: user.avatarUrl ?? null,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/watch-history
router.get("/watch-history", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const history = await db
      .select()
      .from(watchHistoryTable)
      .where(eq(watchHistoryTable.userId, userId))
      .orderBy(desc(watchHistoryTable.watchedAt));

    const result = await Promise.all(
      history.map(async (h) => {
        const [show] = await db
          .select()
          .from(showsTable)
          .where(eq(showsTable.id, h.showId));

        return {
          id: h.id,
          showId: h.showId,
          show: show
            ? {
                id: show.id,
                title: show.title,
                description: show.description,
                thumbnailUrl: show.thumbnailUrl ?? null,
                videoUrl: show.videoUrl ?? null,
                price: show.price,
                category: show.category,
                showType: show.showType,
                genre: show.genre ?? null,
                language: show.language ?? null,
                releaseType: show.releaseType,
                duration: show.duration ?? null,
                startTime: show.startTime ?? null,
                isLive: show.isLive,
                isFeatured: show.isFeatured,
                ticketCount: 0,
                createdAt: show.createdAt.toISOString(),
              }
            : null,
          progressSeconds: h.progressSeconds,
          watchedAt: h.watchedAt.toISOString(),
        };
      }),
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching watch history");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/watch-history
router.post("/watch-history", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const { progressSeconds, showId: showIdRaw } = req.body;
    const showId = parseInt(String(showIdRaw));

    if (isNaN(showId)) {
      res.status(400).json({ error: "Invalid showId" });
      return;
    }

    // Upsert watch history
    const existing = await db
      .select()
      .from(watchHistoryTable)
      .where(eq(watchHistoryTable.userId, userId));

    const found = existing.find((h) => h.showId === showId);

    let entry;
    if (found) {
      [entry] = await db
        .update(watchHistoryTable)
        .set({
          progressSeconds: Number(progressSeconds) || 0,
          watchedAt: new Date(),
        })
        .where(eq(watchHistoryTable.id, found.id))
        .returning();
    } else {
      [entry] = await db
        .insert(watchHistoryTable)
        .values({
          userId,
          showId,
          progressSeconds: Number(progressSeconds) || 0,
        })
        .returning();
    }

    const [show] = await db
      .select()
      .from(showsTable)
      .where(eq(showsTable.id, showId));

    res.json({
      id: entry.id,
      showId: entry.showId,
      show: show
        ? {
            id: show.id,
            title: show.title,
            description: show.description,
            thumbnailUrl: show.thumbnailUrl ?? null,
            videoUrl: show.videoUrl ?? null,
            price: show.price,
            category: show.category,
            showType: show.showType,
            genre: show.genre ?? null,
            language: show.language ?? null,
            releaseType: show.releaseType,
            duration: show.duration ?? null,
            startTime: show.startTime ?? null,
            isLive: show.isLive,
            isFeatured: show.isFeatured,
            ticketCount: 0,
            createdAt: show.createdAt.toISOString(),
          }
        : null,
      progressSeconds: entry.progressSeconds,
      watchedAt: entry.watchedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error recording watch history");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
