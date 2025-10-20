import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GNEWS_API_KEY environment variable" },
        { status: 500 }
      );
    }

    // 🏆 Major European & Global Football Topics
    const queries = [
      "Premier League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
      "Champions League",
      "Europa League",
      "UEFA",
      "World Cup",
      "Euro 2024",
      "FIFA",
    ];

    let allArticles = [];

    // 🔁 Fetch each topic and combine results
    for (const q of queries) {
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(
          q
        )}&lang=en&max=5&country=gb&apikey=${apiKey}`,
        { next: { revalidate: 1800 } } // 1800 seconds = 30 minutes
      );

      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length) {
          allArticles.push(
            ...data.articles.map((a) => ({
              title: a.title,
              description: a.description,
              url: a.url,
              urlToImage: a.image,
              publishedAt: a.publishedAt,
              source: a.source?.name || "GNews",
            }))
          );
        }
      }
    }

    // 🧹 Remove duplicates by title
    const seen = new Set();
    const uniqueArticles = allArticles.filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    // 🪞 Sort by most recent
    const sorted = uniqueArticles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    // ✂️ Limit to top 20
    return NextResponse.json({ articles: sorted.slice(0, 20) });
  } catch (error) {
    console.error("GNews fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
