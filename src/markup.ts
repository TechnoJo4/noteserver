import { marked, Tokenizer, Tokens } from "marked";
import { markedSmartypants } from "marked-smartypants";
import markedKatex from "marked-katex-extension";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

const highlighter = hljs.newInstance();

highlighter.unregisterLanguage("q");
highlighter.registerLanguage("k", function(hljs) {
	return {
		name: 'K',
		aliases: ["q", "kdb"],
		keywords: {
			$pattern: '(`?)[A-Za-z0-9_]+\b'
		},
		contains: [
			hljs.COMMENT(/[ \n]\/[^\n]/, /\n/),
			hljs.COMMENT(/^\/\n/, /\n\\$/),
			hljs.QUOTE_STRING_MODE,
			hljs.C_NUMBER_MODE,
			{
				scope: "meta",
				begin: /^\\[^\n]/,
				end: /$/,
			},
			{
				scope: "k_verb",
				begin: '[+\\-*%!&|<>=~,^#_$?@.:]:?',
			},
			{
				scope: "k_adverb",
				begin: '[\\\\/\']:?',
			},
			{
				scope: "k_symbol",
				begin: '`[a-zA-Z0-9]+',
			},
		]
	};
});

marked.use(markedSmartypants());
marked.use(markedKatex({ throwOnError: false }));
marked.use(markedHighlight({
	emptyLangClass: 'hljs',
	langPrefix: 'hljs language-',
	highlight(code, lang, info) {
		const language = highlighter.getLanguage(lang) ? lang : 'plaintext';
		return highlighter.highlight(code, { language }).value;
	}
}))

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
