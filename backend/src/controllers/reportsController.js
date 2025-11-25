import * as reportService from '../services/reportService.js';

export async function getGlobalReport(req, res) {
    try {
        const reportResponse = await reportService.globalReport(req.env.monitor_status_db);
        res.json(reportResponse);
    } catch (error) {
        console.error("Error generating global report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }   

}
