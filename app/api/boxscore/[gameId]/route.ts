import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
};

const emptyTeamStats = {
  assists: 0, assistsTurnoverRatio: 0, benchPoints: 0, biggestLead: 0,
  biggestLeadScore: "", biggestScoringRun: 0, biggestScoringRunScore: "",
  blocks: 0, blocksReceived: 0, fastBreakPointsAttempted: 0,
  fastBreakPointsMade: 0, fastBreakPointsPercentage: 0,
  fieldGoalsAttempted: 0, fieldGoalsMade: 0, fieldGoalsPercentage: 0,
  foulsOffensive: 0, foulsDrawn: 0, foulsPersonal: 0, foulsTeam: 0,
  foulsTechnical: 0, foulsTeamTechnical: 0, freeThrowsAttempted: 0,
  freeThrowsMade: 0, freeThrowsPercentage: 0, leadChanges: 0,
  minutes: "PT00M00.00S", minutesCalculated: "PT00M00.00S",
  points: 0, pointsAgainst: 0, pointsFastBreak: 0, pointsFromTurnovers: 0,
  pointsInThePaint: 0, pointsInThePaintAttempted: 0, pointsInThePaintMade: 0,
  pointsInThePaintPercentage: 0, pointsSecondChance: 0,
  reboundsDefensive: 0, reboundsOffensive: 0, reboundsPersonal: 0,
  reboundsTeam: 0, reboundsTeamDefensive: 0, reboundsTeamOffensive: 0,
  reboundsTotal: 0, secondChancePointsAttempted: 0,
  secondChancePointsMade: 0, secondChancePointsPercentage: 0, steals: 0,
  threePointersAttempted: 0, threePointersMade: 0, threePointersPercentage: 0,
  timeLeading: "PT00M00.00S", timesTied: 0, trueShootingAttempts: 0,
  trueShootingPercentage: 0, turnovers: 0, turnoversTeam: 0,
  turnoversTotal: 0, twoPointersAttempted: 0, twoPointersMade: 0,
  twoPointersPercentage: 0,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFallbackResponse(game: any, gameId: string) {
  const makeTeam = (t: any) => ({
    teamId: t.teamId ?? 0,
    teamName: t.teamName ?? "",
    teamCity: t.teamCity ?? "",
    teamTricode: t.teamTricode ?? "",
    score: t.score ?? 0,
    inBonus: "0",
    timeoutsRemaining: 0,
    periods: [],
    players: [],
    statistics: emptyTeamStats,
  });

  return {
    game: {
      gameId,
      gameCode: game.gameCode ?? "",
      gameStatus: game.gameStatus ?? 1,
      gameStatusText: game.gameStatusText ?? "",
      period: game.period ?? 0,
      gameClock: game.gameClock ?? "",
      gameTimeUTC: game.gameTimeUTC ?? "",
      gameEt: game.gameEt ?? "",
      duration: 0,
      attendance: 0,
      sellout: "0",
      arena: {
        arenaId: 0,
        arenaName: game.arena?.arenaName ?? "",
        arenaCity: game.arena?.arenaCity ?? "",
        arenaState: game.arena?.arenaState ?? "",
        arenaCountry: "",
        arenaTimezone: "",
      },
      officials: [],
      homeTeam: makeTeam(game.homeTeam),
      awayTeam: makeTeam(game.awayTeam),
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  const url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`;

  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`NBA API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Boxscore not available (game hasn't started yet) — fall back to scoreboard
    try {
      const scoreboardRes = await fetch(
        "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json",
        { headers: FETCH_HEADERS, next: { revalidate: 0 } }
      );

      if (scoreboardRes.ok) {
        const scoreboard = await scoreboardRes.json();
        const game = scoreboard?.scoreboard?.games?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (g: any) => g.gameId === gameId
        );

        if (game) {
          return NextResponse.json(buildFallbackResponse(game, gameId));
        }
      }
    } catch {
      // scoreboard also failed
    }

    return NextResponse.json(
      { error: "Failed to fetch box score" },
      { status: 500 }
    );
  }
}
