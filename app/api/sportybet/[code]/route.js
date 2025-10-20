export async function GET(request, { params }) {
  const { code } = params;

  try {
    const response = await fetch(
      `https://www.sportybet.com/api/ng/orders/share/${code}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: `SportyBet returned status ${response.status}` },
        { status: 400 }
      );
    }

    const data = await response.json();

    // If SportyBet returns the structure you shared
    const matches =
      data?.data?.outcomes?.map((match) => ({
        eventId: match.eventId,
        homeTeam: match.homeTeamName,
        awayTeam: match.awayTeamName,
        status: match.matchStatus,
        odds: match.markets?.[0]?.outcomes?.[0]?.odds || "N/A",
        marketDesc: match.markets?.[0]?.desc || "",
      })) || [];

    return Response.json({ matches });
  } catch (error) {
    console.error("Error fetching SportyBet data:", error);
    return Response.json({ error: "Failed to load booking" }, { status: 500 });
  }
}
