
import * as siteService from "../services/siteService.js";

export async function get(req, res) {
   try{
      const sitesResponse = await siteService.getAll(req.env.monitor_status_db);

      res.json(sitesResponse);
   }
   catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
}

export async function create(req, res) {
    try{
        const site = req.body;
        console.log("Creating site:", site);
        const createResponse = await siteService.create(req.env.monitor_status_db, site);
        res.json(createResponse);
    } catch (error) {
        console.error("Error creating site:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function update(req, res) {
    try{
        const site = req.body;
        console.log("Updating site:", site);
        const updateResponse = await siteService.update(req.env.monitor_status_db, site);
        res.json(updateResponse);
    } catch (error) {
        console.error("Error updating site:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function remove(req, res) {
    try{
        const site = req.body;
        console.log("Deleting site with ID:", site.id);
        const deleteResponse = await siteService.deleteSite(req.env.monitor_status_db, site.id);
        res.json(deleteResponse);
    } catch (error) {
        console.error("Error deleting site:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}