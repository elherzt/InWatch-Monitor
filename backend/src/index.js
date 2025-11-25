import {env} from "cloudflare:workers"
import { httpServerHandler } from "cloudflare:node"
import express from "express"
import sitesRouter from "./routers/sitesRouter.js";
import monitorRouter from "./routers/monitorRouter.js";
import reportsRouter from "./routers/reportsRoputer.js";
import * as healthCheckService  from "./services/healthCheckService.js";

const app = express();

// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.env = env;
  next();
});


// Routers
app.use("/sites", sitesRouter);
app.use("/monitor", monitorRouter);
app.use("/reports", reportsRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Monitor service is alive on Cloudflare Workers" });
});


app.listen(3000);

const worker = httpServerHandler({ port: 3000 });

async function scheduled(controller, env, ctx) {
   console.log("cron triggered");
    await healthCheckService.doCheck(env.monitor_status_db);
    console.log("cron processed");
}

export default { ...worker, scheduled };
