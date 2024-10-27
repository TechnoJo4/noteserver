import { Request } from "express";

export function isAuthenticated(req: Request): boolean {
    let groups = req.headers["remote-groups"];
    if (!groups) return false;
    if (groups instanceof String) {
        groups = groups.split(",");
    }

    return groups.indexOf("note-edit") !== -1;
}
