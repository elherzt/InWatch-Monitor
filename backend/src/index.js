import {env} from "cloudflare:workers"
import { httpServerHandler } from "cloudflare:node"
import express from "express"
import sitesRouter from "./routers/sitesRouter.js";
import monitorRouter from "./routers/monitorRouter.js";
import reportsRouter from "./routers/reportsRoputer.js";
import * as healthCheckService  from "./services/healthCheckService.js";

const app = express();

const allowedOrigins =
  (env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);



// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.env = env;
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.length === 0) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

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
