import { CustomResponse, TypeOfResponse } from "../common/CustomReponse.js";
import * as HealthCheckService from "./healthCheckService.js";

export async function globalReport(db) {
    const response = CustomResponse(TypeOfResponse.OK, "Global report generated successfully", null);

    try {
   
        const sitesResult = await db.prepare(`
            SELECT id AS site_id, displayname 
            FROM sites
        `).all();

        const sites = sitesResult.results;

        
        const latestChecksResult = await db.prepare(`
            SELECT ch.site_id, ch.status_code, ch.checked_at
            FROM check_history ch
            INNER JOIN (
                SELECT site_id, MAX(checked_at) AS max_checked
                FROM check_history
                GROUP BY site_id
            ) AS t
            ON ch.site_id = t.site_id AND ch.checked_at = t.max_checked
        `).all();

        const latestChecks = new Map();
        for (const row of latestChecksResult.results) {
            latestChecks.set(row.site_id, row);
        }

        
        const startTime = new Date(Date.now() - (parseInt(process.env.HOURS_REPORTING_CHECKS) || 2) * 60 * 60 * 1000);
        const startIso = startTime.toISOString();

        const allChecksResult = await db.prepare(`
            SELECT * 
            FROM check_history
            WHERE checked_at >= ?
            ORDER BY site_id, checked_at
        `)
        .bind(startIso)
        .all();

        const checksBySite = new Map();
        for (const row of allChecksResult.results) {
            if (!checksBySite.has(row.site_id)) {
                checksBySite.set(row.site_id, []);
            }
            checksBySite.get(row.site_id).push(row);
        }

        
        const arr_results = [];

        for (const site of sites) {
            const latest = latestChecks.get(site.site_id) || {
                status_code: null,
                checked_at: null
            };

            arr_results.push({
                site_id: site.site_id,
                displayname: site.displayname,
                latest_status_code: latest.status_code,
                latest_checked_at: latest.checked_at,
                checks: checksBySite.get(site.site_id) || []
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
