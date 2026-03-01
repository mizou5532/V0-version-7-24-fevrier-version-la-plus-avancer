import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ODDS_API_KEY = "e5e2f519197fc127490f4472b11616e7";
const ODDS_API_URL = "https://api.the-odds-api.com/v4/sports/basketball_nba/odds";

// Map The Odds API team names to NBA tricodes
const TEAM_NAME_TO_TRICODE: Record<string, string> = {
  "Atlanta Hawks": "ATL",
  "Boston Celtics": "BOS",
  "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA",
  "Chicago Bulls": "CHI",
  "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL",
  "Denver Nuggets": "DEN",
  "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW",
  "Houston Rockets": "HOU",
  "Indiana Pacers": "IND",
  "Los Angeles Clippers": "LAC",
  "Los Angeles Lakers": "LAL",
  "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA",
  "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK",
  "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI",
  "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC",
  "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA",
  "Washington Wizards": "WAS",
};

interface OddsOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsBookmaker {
  key: string;
  title: string;
  markets: {
    key: string;
    outcomes: OddsOutcome[];
  }[];
}

interface OddsEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

function getTricode(teamName: string): string {
  return TEAM_NAME_TO_TRICODE[teamName] || teamName;
}

// Convert American odds to decimal odds
function americanToDecimal(american: number): number {
  if (american > 0) {
    return Number(((american / 100) + 1).toFixed(2));
  }
  return Number(((100 / Math.abs(american)) + 1).toFixed(2));
}

export async function GET() {
  try {
    const res = await fetch(
      `${ODDS_API_URL}?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads&oddsFormat=american`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      console.error(`Odds API responded with status: ${res.status}`);
      return NextResponse.json({ games: [] });
    }

    const events: OddsEvent[] = await res.json();

    // Filter to today's games (ET timezone)
    const todayET = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    const todayEvents = events.filter((event) => {
      const eventDate = new Date(event.commence_time).toLocaleDateString("en-CA", {
        timeZone: "America/New_York",
      });
      return eventDate === todayET;
    });

    const games = todayEvents.map((event) => {
      // Average odds across all bookmakers for more accurate line
      const h2hMarkets = event.bookmakers
        .map((b) => b.markets.find((m) => m.key === "h2h"))
        .filter(Boolean);

      let homeOddsAvg = 0;
      let awayOddsAvg = 0;
      let count = 0;

      for (const market of h2hMarkets) {
        if (!market) continue;
        const homeOutcome = market.outcomes.find((o) => o.name === event.home_team);
        const awayOutcome = market.outcomes.find((o) => o.name === event.away_team);
        if (homeOutcome && awayOutcome) {
          homeOddsAvg += americanToDecimal(homeOutcome.price);
          awayOddsAvg += americanToDecimal(awayOutcome.price);
          count++;
        }
      }

      if (count > 0) {
        homeOddsAvg = Number((homeOddsAvg / count).toFixed(2));
        awayOddsAvg = Number((awayOddsAvg / count).toFixed(2));
      }

      // ─── Spread data ───
      const spreadMarkets = event.bookmakers
        .map((b) => b.markets.find((m) => m.key === "spreads"))
        .filter(Boolean);

      let homeSpread = 0;
      let homeSpreadOdds = 0;
      let awaySpread = 0;
      let awaySpreadOdds = 0;
      let spreadCount = 0;

      for (const market of spreadMarkets) {
        if (!market) continue;
        const homeOut = market.outcomes.find((o) => o.name === event.home_team);
        const awayOut = market.outcomes.find((o) => o.name === event.away_team);
        if (homeOut && awayOut && homeOut.point !== undefined && awayOut.point !== undefined) {
          homeSpread += homeOut.point;
          homeSpreadOdds += americanToDecimal(homeOut.price);
          awaySpread += awayOut.point;
          awaySpreadOdds += americanToDecimal(awayOut.price);
          spreadCount++;
        }
      }

      if (spreadCount > 0) {
        homeSpread = Number((homeSpread / spreadCount).toFixed(1));
        homeSpreadOdds = Number((homeSpreadOdds / spreadCount).toFixed(2));
        awaySpread = Number((awaySpread / spreadCount).toFixed(1));
        awaySpreadOdds = Number((awaySpreadOdds / spreadCount).toFixed(2));
      }

      const homeTricode = getTricode(event.home_team);
      const awayTricode = getTricode(event.away_team);

      return {
        event_id: event.id,
        commence_time: event.commence_time,
        home_team: event.home_team,
        away_team: event.away_team,
        home_tricode: homeTricode,
        away_tricode: awayTricode,
        team_odds: {
          [event.home_team]: homeOddsAvg,
          [event.away_team]: awayOddsAvg,
        },
        tricode_odds: {
          [homeTricode]: homeOddsAvg,
          [awayTricode]: awayOddsAvg,
        },
        spread: {
          home: { point: homeSpread, odds: homeSpreadOdds },
          away: { point: awaySpread, odds: awaySpreadOdds },
        },
      };
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching odds:", error);
    return NextResponse.json({ games: [] });
  }
}
