import { CustomResponse, TypeOfResponse } from "../common/CustomReponse";
import { sitesDTO } from "../dtos/sitesDTO";


export async function getAll(db) {
    try{
        const { results } = await db.prepare("SELECT * FROM sites").all();
        return CustomResponse(TypeOfResponse.OK, "Sites retrieved successfully", results.map(sitesDTO));
    } catch (error) {
        console.error("Error in getAll service:", error);  // to do - save in persistent log
        return CustomResponse(TypeOfResponse.Error, error.message, null);
    }
}

export async function getById(db, siteId) {
    try{
        const { results } = await db.prepare("SELECT * FROM sites WHERE id = ?")
            .bind(siteId)
            .all(); 
        if (results.length === 0) {
            return CustomResponse(TypeOfResponse.Failed, "Site not found", null);
        }
        return CustomResponse(TypeOfResponse.OK, "Site retrieved successfully", sitesDTO(results[0])); 
    } catch (error) {
        console.error("Error in getById service:", error);  
        return CustomResponse(TypeOfResponse.Error, error.message, null);
    }
}

export async function create(db, site) {
    try{

        const result = await db.prepare("INSERT INTO sites (check_url, displayname) VALUES (?, ?)")  
            .bind(site.check_url, site.displayname)
            .run();   
        
        if (result.meta.changes === 0) {
            return CustomResponse(TypeOfResponse.Failed, "Site creation failed", null);
        }
        const new_site = await getById(db, result.meta.last_row_id);

        if (new_site.typeOfResponse !== TypeOfResponse.OK) {
            return new_site;
        }

        return CustomResponse(TypeOfResponse.OK, "Site created successfully", new_site.data);
    } catch (error) {
        console.error("Error in create service:", error);  // to do - save in persistent log
        return CustomResponse(TypeOfResponse.Error, error.message, null);
    }
    
}

export async function update(db, site) {
    try{
        const existingSiteResponse = await getById(db, site.id);   // it could be deleted, just for double check
        if (existingSiteResponse.typeOfResponse !== TypeOfResponse.OK) {
            return existingSiteResponse;
        }
        const result = await db.prepare("UPDATE sites SET check_url = ?, displayname = ? WHERE id = ?")
            .bind(site.check_url, site.displayname, site.id)
            .run();
        if (result.meta.changes === 0) {
            return CustomResponse(TypeOfResponse.Failed, "Site update failed", null);
        }
        const updated_site = await getById(db, site.id);

        if (updated_site.typeOfResponse !== TypeOfResponse.OK) {
            return updated_site;
        }

        return CustomResponse(TypeOfResponse.OK, "Site updated successfully", updated_site.data);
    } catch (error) {
        console.error("Error in update service:", error);  // to do - save in persistent log
        return CustomResponse(TypeOfResponse.Error, error.message, null);
    }
}

export async function deleteSite(db, siteId) { //delete is a reserved word
    try{
        const existingSiteResponse = await getById(db, siteId);
        if (existingSiteResponse.typeOfResponse !== TypeOfResponse.OK) {
            return existingSiteResponse;
        }
        const result = await db.prepare("DELETE FROM sites WHERE id = ?")
            .bind(siteId)
        .run();
        if (result.meta.changes === 0) {
            return CustomResponse(TypeOfResponse.Failed, "Site not found", null);
        }
        return CustomResponse(TypeOfResponse.OK, "Site deleted successfully", { id: siteId });
    } catch (error) {
        console.error("Error in deleteSite service:", error);
        return CustomResponse(TypeOfResponse.Error, error.message, null);
    }
}