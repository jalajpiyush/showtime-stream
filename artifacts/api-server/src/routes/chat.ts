import { Router } from "express";
import { db, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ensureUser, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

// GET /api/chat/:showId
router.get("/:showId", async (req, res): Promise<void> => {
  try {
    const showId = parseInt(req.params.showId);
    if (isNaN(showId)) {
      res.status(400).json({ error: "Invalid showId" });
      return;
    }

    const limit = parseInt((req.query.limit as string) || "50");

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.showId, showId))
      .orderBy(desc(chatMessagesTable.sentAt))
      .limit(limit);

    const result = messages.reverse().map((m) => ({
      id: m.id,
      showId: m.showId,
      userId: m.userId,
      displayName: m.displayName,
      message: m.message,
      sentAt: m.sentAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching chat messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/chat/:showId
router.post("/:showId", ensureUser, async (req: AuthRequest, res): Promise<void> => {
  try {
    const userId = req.userId!;
    const showId = parseInt(req.params.showId);

    if (isNaN(showId)) {
      res.status(400).json({ error: "Invalid showId" });
      return;
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Get user display name
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Anonymous";

    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        showId,
        userId,
        displayName,
        message: message.trim().slice(0, 500),
      })
      .returning();

    res.status(201).json({
      id: msg.id,
      showId: msg.showId,
      userId: msg.userId,
      displayName: msg.displayName,
      message: msg.message,
      sentAt: msg.sentAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error sending chat message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
