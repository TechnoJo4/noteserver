import { Request } from "express";

export function hasGroup(req: Request, group: string): boolean {
    let groups = req.headers["remote-groups"];
    if (!groups) return false;
    if (groups instanceof String) {
        groups = groups.split(",");
    }

    return groups.indexOf(group) !== -1;
}

export const canEdit = (req: Request) => hasGroup(req, "note-edit");
