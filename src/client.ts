import { marked } from './markup.js';
import { Note, getMarkdownTitle } from './note.js';

import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, highlightSpecialChars } from "@codemirror/view";
import { defaultKeymap, history as cmhistory } from "@codemirror/commands";
import { closeBrackets, autocompletion } from '@codemirror/autocomplete';
import * as langMarkdown from '@codemirror/lang-markdown';
import { Prec } from '@codemirror/state';

let editor: EditorView;

const NOTE_BASE = location.origin;
const SRC_BASE = location.origin + "/src";

const cache: Record<string, string> = {};
const promises: Record<string, Promise<string>> = {};

const pathToURL = (path: string) => {
    path = SRC_BASE + path;
    return path.endsWith("/") ? path + "index.md" : path + ".md";
};

const getNote = (path: string) => {
    if (cache[path]) return Promise.resolve(cache[path]);
    if (promises[path] !== undefined) return promises[path];

    return promises[path] = fetch(pathToURL(path)).then(res => {
        if (!res.ok) {
            let createLink = res.status === 404 ? ` (<a href="#edit">create</a>)` : "";

            return `<h1>Error</h1><p>${res.status}: ${res.statusText}${createLink}</p>`;
        }
        return res.text();
    }).then(text => {
        cache[path] = text;
        return text;
    });
};

const goToNote = async (path: string) => {
    const container = document.getElementById("maincontainer")!;

    const content = await getNote(path);
    container.innerHTML = Note({ path, content });
    document.head.getElementsByTagName("title")[0].textContent = getMarkdownTitle(content);
};

const openEditor = async () => {
    const contents = await getNote(location.pathname);
    editor = new EditorView({
        doc: contents,
        extensions: [
            keymap.of(defaultKeymap),
            lineNumbers(),
            drawSelection(),
            highlightActiveLine(), highlightSpecialChars(),
            cmhistory(),
            closeBrackets(),
            autocompletion(),
            langMarkdown.markdown(),
            Prec.highest(keymap.of([{
                key: 'Mod-s',
                run: ({state}) => {
                    fetch(SRC_BASE + location.pathname, {
                        method: "PUT",
                        body: state.doc.toString()
                    });
                    return true;
                }
            }]))
        ],
        parent: document.getElementById("editcontainer")!
    });
    console.log(editor);
};

document.addEventListener("click", e => {
	if (!(e?.target instanceof HTMLAnchorElement)) return;

    if (e.target.getAttribute("href") === "#edit") {
        openEditor();
    } else if (e.target.href?.startsWith(NOTE_BASE) && !e.target.href?.match(/(?:[#?]|src\/)/)) {
		e.stopPropagation(); 
		e.preventDefault();
		history.pushState(null, "", e.target.href);
		goToNote(location.pathname);
		return false;
	}
});

window.addEventListener("popstate", () => {
	goToNote(location.pathname);
});

if (location.hash === "#edit") {
    openEditor();
}