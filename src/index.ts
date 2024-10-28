import { isAuthenticated } from "./auth.js";
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

app.use("/src", (req, res, next) => {
    if (req.method !== "PUT") return next();
    if (!isAuthenticated(req)) return void res.sendStatus(403);

    const file = reqFilePath(req);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const fsStream = fs.createWriteStream(file);

    req.pipe(fsStream);
    req.on('end', () => {
        fsStream.close();
        res.end();
    });
});

app.use("/src", express.static("notes"));
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
    console.log(path);
    
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
