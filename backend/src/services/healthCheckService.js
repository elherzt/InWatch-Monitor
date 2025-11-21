import fetch from 'node-fetch';
import * as SitesService from './siteService.js';
import { CustomResponse, TypeOfResponse } from "../common/CustomReponse";

export async function doCheck(db) {
    const response = CustomResponse(TypeOfResponse.OK, "Health check performed", null);
    try{
        const sitesResponse = await SitesService.getAll(db);
        if (sitesResponse.typeOfResponse !== TypeOfResponse.OK) {
            return sitesResponse;
        }
        const sites = sitesResponse.data;

        
        for (const site of sites) {
            const healthResponse = await checkServiceHealth(site.check_url);
            if (healthResponse.typeOfResponse !== TypeOfResponse.Exception) {
                await saveCheck(db,site, healthResponse.data);
            }

            
        }
    response.message = "Health checks completed successfully";

    }
    catch (error) {
        console.error("Error in health check service:", error);  
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }
    return response;
}

export async function checkServiceHealth(url) {
    const response = CustomResponse(TypeOfResponse.OK, "Health check performed", {});
    try {
        const startTime = Date.now();
        // remove custom header if needed, I use it only to allow request in WAF
        const result = await fetch(url, { method: 'GET', timeout: 5000, headers: { 'X-EMP-Health-Check': 'true' } }); 
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;
        if (result.ok) {
        } else {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = `Unhealthy with status code: ${result.status}`;
        }
        response.data = { responseTime: responseTime, statusCode: result.status };
    } catch (error) {
        console.error(`Error checking health for ${url}:`, error);
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }
    console.log(`Health check for ${url}: ${response.data.statusCode}`);
    return response;
}


export async function saveCheck(db, site, checkResult) {
    const response = CustomResponse(TypeOfResponse.OK, "Check saved successfully", null);
    try{
        const result = await db.prepare("INSERT INTO check_history (site_id, status_code, response_time_ms, checked_at) VALUES (?, ?, ?, ?)")  
            .bind(site.id, checkResult.statusCode, checkResult.responseTime, new Date().toISOString())
            .run();
        if (result.meta.changes === 0) {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = "Check save failed";
        }
    }
    catch (error) {
        console.error("Error in save check service:", error);  
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }
    return response;

}