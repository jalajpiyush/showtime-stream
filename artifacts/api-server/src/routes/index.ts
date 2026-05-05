import { Router, type IRouter } from "express";
import healthRouter from "./health";
import showsRouter from "./shows";
import ticketsRouter from "./tickets";
import usersRouter from "./users";
import chatRouter from "./chat";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/shows", showsRouter);
router.use("/tickets", ticketsRouter);
router.use("/users", usersRouter);
router.use("/chat", chatRouter);
router.use("/admin", adminRouter);

export default router;
