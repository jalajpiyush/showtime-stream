import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: string;
  clerkUserId?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.clerkUserId = clerkUserId;
  req.userId = clerkUserId;
  next();
};

export const ensureUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.clerkUserId = clerkUserId;
  req.userId = clerkUserId;

  // Upsert user record
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, clerkUserId))
    .limit(1);

  if (existing.length === 0) {
    // Try to get email from Clerk claims
    const claims = auth?.sessionClaims as Record<string, unknown> | undefined;
    const email =
      (claims?.email as string) ||
      `${clerkUserId}@cinelive.app`;

    await db.insert(usersTable).values({
      id: clerkUserId,
      email,
      isAdmin: false,
    });
  }

  next();
};
