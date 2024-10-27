import { marked, Tokenizer, Tokens } from "marked";
import { markedSmartypants } from "marked-smartypants";
import markedKatex from "marked-katex-extension";

marked.use(markedSmartypants());
marked.use(markedKatex({ throwOnError: false }));

// Allow links to other [[Articles]] within the same notes-wiki-thing
class XTokenizer extends Tokenizer {
    link(src: string): Tokens.Link | undefined {
        const match = src.match(/^\[\[([^\]\n]+?)\]\]/);
		if (match) {
			const text = match[1].trim();
			return {
				type: 'link',
				raw: match[0],
				text,
				title: null,
				href: text.replace(" ", "_").toLowerCase(),
				tokens: [ {
					type: 'text',
					raw: text,
					text: text
				} ]
			};
		}
    }
}

marked.use({ tokenizer: new XTokenizer() });

export { marked };
