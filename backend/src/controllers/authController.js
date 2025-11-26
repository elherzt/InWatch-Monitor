import {signJwt} from "../common/jwtHandler.js";
import { CustomResponse, TypeOfResponse } from "../common/CustomReponse.js";

export async function login(req, res) {
    const response = CustomResponse(TypeOfResponse.OK, "Login successful", null);
    try{
        const credentials= req.body;
        if (credentials.password === req.env.ADMIN_PWD) {
            const token = await signJwt({ role: "admin" }, req.env);
            response.data = token;
        } else {
            response.typeOfResponse = TypeOfResponse.Error;
            response.message = "Contraseña incorrecta";
        }   
    } catch (error) {
        response.typeOfResponse = TypeOfResponse.Error;
        response.message = "Error interno del servidor: " + error.message;
    }
    return res.json(response);
}