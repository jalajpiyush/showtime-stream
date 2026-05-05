import { Router } from "express";
import { db, showsTable, ticketsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

function mapShow(s: typeof showsTable.$inferSelect, ticketCount = 0) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    thumbnailUrl: s.thumbnailUrl ?? null,
    videoUrl: s.videoUrl ?? null,
    price: s.price,
    category: s.category,
    showType: s.showType,
    genre: s.genre ?? null,
    language: s.language ?? null,
    releaseType: s.releaseType,
    duration: s.duration ?? null,
    startTime: s.startTime ?? null,
    isLive: s.isLive,
    isFeatured: s.isFeatured,
    ticketCount,
    createdAt: s.createdAt.toISOString(),
  };
}

// GET /api/shows - list all shows
router.get("/", async (req, res): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const showType = req.query.showType as string | undefined;

    let shows = await db.select().from(showsTable).orderBy(showsTable.createdAt);

    if (category && category !== "all") {
      shows = shows.filter((s) => s.category === category);
    }
    if (showType && showType !== "all") {
      shows = shows.filter((s) => s.showType === showType);
    }

    const ticketCounts = await db
      .select({ showId: ticketsTable.showId, cnt: count(ticketsTable.id) })
      .from(ticketsTable)
      .groupBy(ticketsTable.showId);

    const countMap = new Map(ticketCounts.map((t) => [t.showId, Number(t.cnt)]));

    res.json(shows.map((s) => mapShow(s, countMap.get(s.id) ?? 0)));
  } catch (err) {
    req.log.error({ err }, "Error listing shows");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/shows/featured
router.get("/featured", async (req, res): Promise<void> => {
  try {
    const shows = await db.select().from(showsTable).where(eq(showsTable.isFeatured, true));
    res.json(shows.map((s) => mapShow(s, 0)));
  } catch (err) {
    req.log.error({ err }, "Error fetching featured shows");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/shows/stats
router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  try {
    const allShows = await db.select().from(showsTable);
    res.json({
      totalShows: allShows.length,
      nowShowing: allShows.filter((s) => s.category === "now_showing").length,
      upcoming: allShows.filter((s) => s.category === "upcoming").length,
      liveNow: allShows.filter((s) => s.isLive && s.category === "now_showing").length,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching show stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/shows/:id
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [show] = await db.select().from(showsTable).where(eq(showsTable.id, id));
    if (!show) { res.status(404).json({ error: "Show not found" }); return; }

    const [ticketRow] = await db
      .select({ cnt: count(ticketsTable.id) })
      .from(ticketsTable)
      .where(eq(ticketsTable.showId, id));

    res.json(mapShow(show, Number(ticketRow?.cnt ?? 0)));
  } catch (err) {
    req.log.error({ err }, "Error fetching show");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/shows (admin)
router.post("/", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { title, description, thumbnailUrl, videoUrl, price, category, showType, genre, language, releaseType, duration, startTime, isLive, isFeatured } = req.body;

    if (!title || !description || price === undefined || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [show] = await db.insert(showsTable).values({
      title,
      description,
      thumbnailUrl: thumbnailUrl ?? null,
      videoUrl: videoUrl ?? null,
      price: Number(price),
      category: category ?? "now_showing",
      showType: showType ?? "movie",
      genre: genre ?? null,
      language: language ?? null,
      releaseType: releaseType ?? "online_only",
      duration: duration ? Number(duration) : null,
      startTime: startTime ?? null,
      isLive: isLive ?? false,
      isFeatured: isFeatured ?? false,
    }).returning();

    const [ticketRow] = await db.select({ cnt: count(ticketsTable.id) }).from(ticketsTable).where(eq(ticketsTable.showId, show.id));
    res.status(201).json(mapShow(show, Number(ticketRow?.cnt ?? 0)));
  } catch (err) {
    req.log.error({ err }, "Error creating show");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/shows/:id (admin)
router.patch("/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { title, description, thumbnailUrl, videoUrl, price, category, showType, genre, language, releaseType, duration, startTime, isLive, isFeatured } = req.body;

    const updates: Partial<typeof showsTable.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (showType !== undefined) updates.showType = showType;
    if (genre !== undefined) updates.genre = genre;
    if (language !== undefined) updates.language = language;
    if (releaseType !== undefined) updates.releaseType = releaseType;
    if (duration !== undefined) updates.duration = duration ? Number(duration) : null;
    if (startTime !== undefined) updates.startTime = startTime;
    if (isLive !== undefined) updates.isLive = isLive;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;

    const [show] = await db.update(showsTable).set(updates).where(eq(showsTable.id, id)).returning();
    if (!show) { res.status(404).json({ error: "Show not found" }); return; }

    const [ticketRow] = await db.select({ cnt: count(ticketsTable.id) }).from(ticketsTable).where(eq(ticketsTable.showId, id));
    res.json(mapShow(show, Number(ticketRow?.cnt ?? 0)));
  } catch (err) {
    req.log.error({ err }, "Error updating show");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/shows/:id (admin)
router.delete("/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    await db.delete(showsTable).where(eq(showsTable.id, id));
    res.json({ message: "Show deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting show");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
