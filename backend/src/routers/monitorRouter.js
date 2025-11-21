import { Router } from "express";
import * as monitorController from "../controllers/monitorController.js";
const monitorRouter = Router();

monitorRouter.post("/doHealthCheck", monitorController.doHealthCheck);

export default monitorRouter;