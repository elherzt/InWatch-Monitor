import { Router } from "express";
import * as sitesController from "../controllers/sitesController.js";
const sitesRouter = Router();


sitesRouter.get("/", sitesController.get);
sitesRouter.post("/", sitesController.create);
sitesRouter.put("/", sitesController.update);
sitesRouter.delete("/", sitesController.remove);
export default sitesRouter;