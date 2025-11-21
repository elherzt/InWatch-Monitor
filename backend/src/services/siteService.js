import { CustomResponse, TypeOfResponse } from "../common/CustomReponse";
import { sitesDTO } from "../dtos/sitesDTO";


export async function getAll(db) {
    try{
        const { results } = await db.prepare("SELECT * FROM sites").all();
        return CustomResponse(TypeOfResponse.OK, "Sites retrieved successfully", results.map(sitesDTO));
    } catch (error) {
        console.error("Error in getAll service:", error);  // to do - save in persistent log
        return CustomResponse(TypeOfResponse.Exception, error.message, null);
    }
}

export async function getById(db, siteId) {
    const response = CustomResponse(TypeOfResponse.OK, "Site retrieved successfully", null);
    try{
        const { results } = await db.prepare("SELECT * FROM sites WHERE id = ?")
            .bind(siteId)
            .all(); 
        if (results.length === 0) {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = "Site not found :(";
        }
        else{
            response.data = sitesDTO(results[0]);
        }
    } catch (error) {
        console.error("Error in getById service:", error);  
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }
    return response;
}

export async function create(db, site) {
    const response = CustomResponse(TypeOfResponse.OK, "Site created successfully", null);
    try{
        const result = await db.prepare("INSERT INTO sites (check_url, displayname) VALUES (?, ?)")  
            .bind(site.check_url, site.displayname)
            .run();   
        
        if (result.meta.changes === 0) {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = "Site creation failed";
            return response;
        }

        const new_site = await getById(db, result.meta.last_row_id);

        if (new_site.typeOfResponse !== TypeOfResponse.OK) {
            return new_site;
        }

        response.data = new_site.data;
        
    } catch (error) {
        console.error("Error in create service:", error);  // to do - save in persistent log
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }

    return response;
}

export async function update(db, site) {
    try{
        const existingSiteResponse = await getById(db, site.id);   // it could be deleted, just for double check
        if (existingSiteResponse.typeOfResponse !== TypeOfResponse.OK) {
            return existingSiteResponse;
        }

        // to do validate displayname and check_url
        const result = await db.prepare("UPDATE sites SET check_url = ?, displayname = ? WHERE id = ?")
            .bind(site.check_url, site.displayname, site.id)
            .run();
        if (result.meta.changes === 0) {
            return CustomResponse(TypeOfResponse.Error, "Site update failed", null);
        }
        const updated_site = await getById(db, site.id);

        if (updated_site.typeOfResponse !== TypeOfResponse.OK) {
            return updated_site;
        }

        return CustomResponse(TypeOfResponse.OK, "Site updated successfully", updated_site.data);
    } catch (error) {
        console.error("Error in update service:", error);  // to do - save in persistent log
        return CustomResponse(TypeOfResponse.Exception, error.message, null);
    }
}

export async function deleteSite(db, siteId) { //delete is a reserved word
    const response = CustomResponse(TypeOfResponse.OK, "Site deleted successfully", null);
    try{
        const existingSiteResponse = await getById(db, siteId);
        if (existingSiteResponse.typeOfResponse !== TypeOfResponse.OK) {
            console.log(existingSiteResponse);
            return existingSiteResponse;
        }
        const result = await db.prepare("DELETE FROM sites WHERE id = ?")
            .bind(siteId)
        .run();
        if (result.meta.changes === 0) {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = "Site deletion failed";
        }
    } catch (error) {
        console.error("Error in deleteSite service:", error);
        response.typeOfResponse = TypeOfResponse.Exception;
        response.message = error.message;
    }
    return response;
}