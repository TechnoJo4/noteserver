import { hasGroup, canEdit } from "./auth.js";
import { renderNotePage, renderAtomFeed } from "./note.js";

import express from "express";
import fs from "fs";
import path from "path";

const reqFilePath = (req: express.Request) => {
    let normalized = path.normalize(req.path.toLowerCase());
    if (normalized.endsWith(path.sep) || normalized == "")
        normalized += "index";
    return path.join("./notes", normalized+".md");
};

const app = express();

const neededGroups = (file: string) => file.split(path.sep).filter(s => s[0] === "~");

app.use("/src", (req, res, next) => {
    const file = reqFilePath(req);
    for (let group of neededGroups(file))
        if (!hasGroup(req, group))
            return void res.sendStatus(403);

    if (req.method === "GET") {
        if (!fs.existsSync(file)) return void res.sendStatus(404);
        const fsStream = fs.createReadStream(file);

        fsStream.pipe(res);
        fsStream.on('end', () => {
            fsStream.close();
            res.end();
        });
    }

    if (req.method === "PUT") {
        if (!canEdit(req)) return void res.sendStatus(403);

        fs.mkdirSync(path.dirname(file), { recursive: true });
        const fsStream = fs.createWriteStream(file);

        req.pipe(fsStream);
        req.on('end', () => {
            fsStream.close();
            res.end();
        });
    }
    return next();
});

app.use("/dist", express.static("dist"));
app.use("/", express.static("public"));

app.get("/:tag.xml", (req, res) => {
    let tag: string | undefined = req.params.tag;
    if (tag == "" || tag == "feed")
        tag = undefined;

    res.type("application/atom+xml").send('<?xml version="1.0" encoding="utf-8" ?>' + renderAtomFeed(tag));
});

app.use("/", (req, res, next) => {
    if (req.method !== "GET") return next();

    const path = reqFilePath(req);
    for (let group of neededGroups(path))
        if (!hasGroup(req, group))
            return void res.sendStatus(403);

    const markdown = fs.existsSync(path)
        ? fs.readFileSync(path, { encoding: "utf8" })
        : `# Not Found\n[Edit](#edit) to create?`;

    const html = renderNotePage(req.path, markdown);
    res.type("html").send("<!DOCTYPE html>" + html);
    next();
});

app.listen(8000, "", () => {
    console.log("Listening on :8000");
});
