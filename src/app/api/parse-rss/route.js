// app/api/parse-rss/route.js

import { NextResponse } from "next/server";
import Parser from "rss-parser";

export async function POST(request) {
  const { rssUrl, podcastWebsite } = await request.json();

  if (!rssUrl) {
    return NextResponse.json({ error: "RSS URL is required" }, { status: 400 });
  }

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    // Extract podcast details
    const podcastTitle = feed.title || "N/A";
    const listenNotesUrl = feed.link || "N/A";
    const contactName = feed.itunes?.owner?.name || "N/A";
    const podcastDescription = feed.description || "N/A";

    // Extract the last 5 episodes
    const episodes = feed.items.slice(0, 5).map((item) => {
      const episodeTitle = item.title || "N/A";
      const episodeDate =
        new Date(item.pubDate).toLocaleDateString("en-US") || "N/A";
      const episodeDescription = item.contentSnippet || "N/A";
      return {
        episodeTitle,
        episodeDate,
        episodeDescription,
      };
    });

    // Generate the text output
    let textOutput = `Podcast Title: ${podcastTitle}\n`;
    textOutput += `Podcast Website: ${podcastWebsite || "N/A"}\n`; // Add the podcast website to the output
    textOutput += `Listennotes URL: ${listenNotesUrl}\n`;
    textOutput += `Contact Name: ${contactName}\n`;
    textOutput += `Podcast Description: ${podcastDescription}\n\n`;
    textOutput += `Last 5 Episodes:\n`;

    episodes.forEach((episode, index) => {
      textOutput += `Episode ${index + 1} Title: ${episode.episodeTitle}\n`;
      textOutput += `Episode Date: ${episode.episodeDate}\n`;
      textOutput += `Episode Description: ${episode.episodeDescription}\n\n`;
    });

    // Return a JSON response containing the text output and podcast title
    return NextResponse.json(
      {
        textOutput,
        podcastTitle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    return NextResponse.json(
      { error: "Failed to parse RSS feed" },
      { status: 500 }
    );
  }
}
