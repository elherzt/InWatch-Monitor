import { Router } from "express";
import * as reportsController from "../controllers/reportsController.js";

const reportsRouter = Router();

reportsRouter.get("/status", reportsController.getGlobalReport);

export default reportsRouter;