import { NextRequest, NextResponse } from "next/server";

const NBA_LIVE_URL =
  "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";
const NBA_SCHEDULE_URL =
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
};

export const dynamic = "force-dynamic";

function getTodayET(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === getTodayET();
}

// Transform scheduleLeagueV2 game entry to match the live scoreboard game shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformScheduleGame(g: any) {
  return {
    gameId: g.gameId,
    gameCode: g.gameCode,
    gameStatus: g.gameStatus,
    gameStatusText: g.gameStatusText || "",
    period: 0,
    gameClock: "",
    gameTimeUTC: g.gameDateTimeUTC || g.gameDateUTC || "",
    gameEt: g.gameDateTimeEst || "",
    regulationPeriods: 4,
    homeTeam: {
      teamId: g.homeTeam?.teamId ?? 0,
      teamName: g.homeTeam?.teamName ?? "",
      teamCity: g.homeTeam?.teamCity ?? "",
      teamTricode: g.homeTeam?.teamTricode ?? "",
      wins: g.homeTeam?.wins ?? 0,
      losses: g.homeTeam?.losses ?? 0,
      score: g.homeTeam?.score ?? 0,
      periods: [],
    },
    awayTeam: {
      teamId: g.awayTeam?.teamId ?? 0,
      teamName: g.awayTeam?.teamName ?? "",
      teamCity: g.awayTeam?.teamCity ?? "",
      teamTricode: g.awayTeam?.teamTricode ?? "",
      wins: g.awayTeam?.wins ?? 0,
      losses: g.awayTeam?.losses ?? 0,
      score: g.awayTeam?.score ?? 0,
      periods: [],
    },
    gameLeaders: {
      homeLeaders: {
        personId: 0,
        name: "",
        jerseyNum: "",
        position: "",
        teamTricode: g.homeTeam?.teamTricode ?? "",
        playerSlug: null,
        points: 0,
        rebounds: 0,
        assists: 0,
      },
      awayLeaders: {
        personId: 0,
        name: "",
        jerseyNum: "",
        position: "",
        teamTricode: g.awayTeam?.teamTricode ?? "",
        playerSlug: null,
        points: 0,
        rebounds: 0,
        assists: 0,
      },
    },
  };
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  try {
    // If no date or date is today, use the live endpoint
    if (!dateParam || isToday(dateParam)) {
      const response = await fetch(NBA_LIVE_URL, {
        headers: FETCH_HEADERS,
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`NBA API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // For other dates, use the schedule endpoint
    const response = await fetch(NBA_SCHEDULE_URL, {
      headers: FETCH_HEADERS,
      next: { revalidate: 3600 }, // Cache schedule for 1 hour
    });

    if (!response.ok) {
      throw new Error(
        `NBA Schedule API responded with status: ${response.status}`
      );
    }

    const scheduleData = await response.json();
    const gameDates =
      scheduleData?.leagueSchedule?.gameDates || [];

    // The schedule uses "MM/DD/YYYY 00:00:00" format for gameDate
    // We need to match against our "YYYY-MM-DD" format
    const [year, month, day] = dateParam.split("-");
    const searchFormat = `${month}/${day}/${year} 00:00:00`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchingDate = gameDates.find((gd: any) => gd.gameDate === searchFormat);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const games = (matchingDate?.games || []).map((g: any) =>
      transformScheduleGame(g)
    );

    return NextResponse.json({
      scoreboard: {
        gameDate: dateParam,
        leagueId: "00",
        leagueName: "National Basketball Association",
        games,
      },
    });
  } catch (error) {
    console.error("Error fetching NBA scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
