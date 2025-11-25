import { CustomResponse, TypeOfResponse } from "../common/CustomReponse.js";
import * as HealthCheckService from "./healthCheckService.js";

export async function globalReport(db) {
    const response = CustomResponse(TypeOfResponse.OK, "Global report generated successfully", null);
    try{
        // get sites and their latest check results, from sites and check_history tables
        const { results } = await db.prepare(`
            SELECT s.id as site_id, s.displayname, ch.status_code, ch.checked_at
            FROM sites s
            LEFT JOIN check_history ch ON s.id = ch.site_id
            WHERE ch.checked_at = (
                SELECT MAX(checked_at)
                FROM check_history
                WHERE site_id = s.id
            ) OR ch.checked_at IS NULL
        `).all();

        const arr_results = [];

        const startTime = new Date(Date.now() - (parseInt(process.env.HOURS_REPORTING_CHECKS) || 2) * 60 * 60 * 1000);

        for (const row of results) {
            const checksResponse = await HealthCheckService.getLatestChecks(db, row.site_id, startTime);
            arr_results.push({
                site_id: row.site_id,
                displayname: row.displayname,
                latest_status_code: row.status_code,
                latest_checked_at: row.checked_at,
                checks: checksResponse.data
            });
        }
        response.data = arr_results;
    } catch (error) {
        console.error("Error in globalReport service:", error);  
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }   
    return response;
}