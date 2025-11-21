import * as healthCheckService from "../services/healthCheckService.js";

export async function doHealthCheck(req, res) {
    try {
        const healthCheckResponse = await healthCheckService.doCheck(req.env.monitor_status_db);
        res.json(healthCheckResponse);
    } catch (error) {
        console.error("Error performing health check:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}