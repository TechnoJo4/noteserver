import { marked } from './markup.js';
import { Note, getMarkdownTitle } from './note.js';

import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, highlightSpecialChars } from "@codemirror/view";
import { defaultKeymap, history as cmhistory } from "@codemirror/commands";
import { closeBrackets, autocompletion, acceptCompletion } from '@codemirror/autocomplete';
import * as langMarkdown from '@codemirror/lang-markdown';
import { Prec } from '@codemirror/state';

let editor: EditorView | undefined = undefined;

const NOTE_BASE = location.origin;
const SRC_BASE = location.origin + "/src";

const cache: Record<string, string> = {};
const promises: Record<string, Promise<string>> = {};

const getNote = (path: string) => {
    if (cache[path]) return Promise.resolve(cache[path]);
    if (promises[path] !== undefined) return promises[path];

    return promises[path] = fetch(SRC_BASE + path).then(res => {
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
    const container = document.getElementById("maincontent")!;

    const content = await getNote(path);
    container.innerHTML = Note({ path, content });
    document.head.getElementsByTagName("title")[0].textContent = getMarkdownTitle(content);
};

const openEditor = async () => {
    const contents = await getNote(location.pathname);
    editor = new EditorView({
        doc: contents,
        extensions: [
            EditorView.lineWrapping,
            keymap.of(defaultKeymap),
            lineNumbers(),
            drawSelection(),
            highlightActiveLine(), highlightSpecialChars(),
            cmhistory(),
            closeBrackets(),
            autocompletion(),
            langMarkdown.markdown(),
            keymap.of([{key: "Tab", run: acceptCompletion}]),
            Prec.highest(keymap.of([{
                key: 'Mod-s',
                run: ({state}) => {
                    const content = state.doc.toString();
                    document.getElementById("maincontent")!.innerHTML = Note({ path: location.pathname, content });

                    fetch(SRC_BASE + location.pathname, {
                        method: "PUT",
                        body: content,
                        redirect: "error"
                    }).then(res => {
                        if (!res.ok) alert(`Save error: ${res.status} ${res.statusText}`);
                    }).catch(err => {
                        window.open(location.origin+"/authelia", "_blank")?.focus();
                    });
                    return true;
                }
            }]))
        ],
        parent: document.getElementById("editcontainer")!
    });
};

document.addEventListener("click", e => {
	if (!(e?.target instanceof HTMLAnchorElement)) return;

    if (e.target.getAttribute("href") === "#edit") {
        if (editor === undefined) {
            openEditor();
        } else {
            editor.destroy();
            editor = undefined;
        }
    } else if (editor !== undefined) {
        //
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
