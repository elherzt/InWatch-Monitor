    import { verifyJwt } from "./jwtHandler.js";

    export async function requireAuth(req, res, next) {
        try {
            const header = req.headers.authorization || "";
            const token = header.startsWith("Bearer ") ? header.slice(7) : null;
            if (!token) return res.status(401).json({ error: "Token requerido" });

            req.user = await verifyJwt(token, req.env);
            next();
        } catch (err) {
            console.error("Auth error:", err);
            res.status(401).json({ error: "Token inválido o expirado" });
        }
    }