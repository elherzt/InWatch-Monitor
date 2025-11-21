import {env} from "cloudflare:workers"
import { httpServerHandler } from "cloudflare:node"
import express from "express"
import sitesRouter from "./routers/sitesRouter.js";
import monitorRouter from "./routers/monitorRouter.js";

const app = express();

// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.env = env;
  next();
});

app.use("/sites", sitesRouter);
app.use("/monitor", monitorRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Express.js running on Cloudflare Workers!" });
});


app.listen(3000);

export default httpServerHandler({ port: 3000 });
