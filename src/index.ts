import { hasGroup, canEdit } from "./auth.js";
import { renderNotePage } from "./note.js";

import express from "express";
import fs from "fs";
import path from "path";
import { FeedItem, renderAtomFeed } from "./atom.js";

const reqFilePath = (req: express.Request) => {
    let normalized = path.normalize(req.path.toLowerCase());
    if (normalized.endsWith(path.sep) || normalized == "")
        normalized += "index";
    return path.join("./notes", normalized+".md");
};

const app = express();

const neededGroups = (file: string) => file.split(path.sep).filter(s => s[0] === "~").map(s => s.substring(1));

const footer = fs.readFileSync("footer.html", { encoding: "utf8" });

app.use("/src", (req, res, next) => {
    const file = reqFilePath(req);
    const fileGroups = neededGroups(file);
    for (let group of fileGroups)
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
        return;
    }

    if (req.method === "PUT") {
        if (fileGroups) {
            if (!hasGroup(req, "note_edit_all"))
                for (let group of fileGroups)
                    if (!hasGroup(req, group+"_edit"))
                        return void res.sendStatus(403);
        } else {
            if (!hasGroup(req, "note_edit_all"))
                return void res.sendStatus(403);
        }

        fs.mkdirSync(path.dirname(file), { recursive: true });
        const fsStream = fs.createWriteStream(file);

        req.pipe(fsStream);
        req.on('end', () => {
            fsStream.close();
            res.end();
        });
        return;
    }
    return next();
});

app.use("/dist", express.static("dist"));
app.use("/", express.static("public"));

app.get("/feed.xml", (req, res) => {
    const feed = fs.readFileSync("notes/feed.md", { encoding: "utf8" });
    let items: FeedItem[] = [];
    for (const match of feed.matchAll(/^## (\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ) - \[(.+?)\]\((.+?)\)(?:\n\(([^\n]+?)\))?\n\n(.+?)$/gm)) {
        items.push({
            date: match[1],
            title: match[2],
            href: match[3],
            tags: match[4] ? match[4].split(",") : [],
            summary: match[5]
        });
    }

    res.type("application/atom+xml").send(renderAtomFeed(items));
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

    const html = renderNotePage(req.path, markdown, footer);
    res.type("html").send("<!DOCTYPE html>" + html);
    next();
});

app.listen(8000, "", () => {
    console.log("Listening on :8000");
});
