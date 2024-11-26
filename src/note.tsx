import { h } from "@lite-jsx/core";
import { marked } from "./markup.js";
import { entityEscapeHtmlChars } from "./utils.js";
import { Fragment } from "./utils.js";

export function getMarkdownTitle(markdown: string) {
    const titleMatch = markdown.match(/^# (.+)\n/);

    return titleMatch ? titleMatch[1] : "notes";
};

export function Note(props: { path: string, content: string }) {
    const rendered = marked(props.content);

    return (<>
        <div style="float: right;">
            <a href="#edit">edit</a>
        </div>
        {rendered}
        <hr />
        <a href="/">Home</a>&emsp;<a href="https://technojo4.com/">About</a>&emsp;<a href="/contact">Contact</a>
    </>);
}

export function renderNotePage(path: string, markdown: string): string {
    return (<html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link href="/style.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous" />
            <link href="/feed.xml" type="application/atom+xml" rel="alternate" title="Sitewide Atom feed" />
            <title>{entityEscapeHtmlChars(getMarkdownTitle(markdown))}</title>
        </head>
        <body>
            <div id="editcontainer"></div>
            <div id="maincontainer">
                <Note path={path} content={markdown} />
            </div>
            <script src="/dist/client.js" type="module"></script>
        </body>
    </html>);
}
