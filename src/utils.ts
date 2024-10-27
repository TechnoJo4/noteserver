export const entityEscapeHtmlChars = (str: string) => {
    const characters: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
    };
    return str.replace(/[&<>"']/g, (s) => characters[s]);
};

export const Fragment = (props: { children: string[] }) => props.children.join("");
