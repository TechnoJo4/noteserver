import { h } from "@lite-jsx/core";

export type FeedItem = {
    date: string,
    title: string,
    href: string,
    tags: string[],
    summary: string
};

function renderFeedItem(item: FeedItem): string {
    const url = "https://merkletr.ee"+item.href;
    return (<entry>
        <title>{item.title}</title>
        <content src={url} type="text/html" />
        <link href={url} />
        <id>{url}</id>
        <published>{item.date}</published>
        <updated>{item.date}</updated>
        <summary>{item.summary}</summary>
        {item.tags.map(tag => <category term={tag} />)}
    </entry>);
}

export function renderAtomFeed(feed: FeedItem[]): string {
    const dates = feed.map(item => item.date).sort();

    return '<?xml version="1.0" encoding="utf-8" ?>' + (<feed xmlns="http://www.w3.org/2005/Atom">
        <title type="text">merkletr.ee</title>
        <link href="https://merkletr.ee/feed.xml" rel="self" />
        <link href="https://merkletr.ee/" />
        <id>https://merkletr.ee/</id>
		<author>
			<name>rkletr</name>
			<email>me@rkletr.ee</email>
		</author>

        <updated>{dates[dates.length-1]}</updated>

        {feed.map(renderFeedItem)}
    </feed>);
}
