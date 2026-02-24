// Test player stats endpoint and parse the response

const TEAM_ID = 1610612738; // Boston Celtics

const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

// Test team stats
console.log("=== TEAM STATS ===");
try {
  const teamUrl = `https://stats.nba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2025-26&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=${TEAM_ID}&TwoWay=0&VsConference=&VsDivision=`;
  const res = await fetch(teamUrl, { headers, signal: AbortSignal.timeout(15000) });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Result sets:", data.resultSets?.length);
  if (data.resultSets?.[0]) {
    console.log("Headers:", JSON.stringify(data.resultSets[0].headers));
    console.log("Row count:", data.resultSets[0].rowSet?.length);
    if (data.resultSets[0].rowSet?.[0]) {
      console.log("First row (first 10):", JSON.stringify(data.resultSets[0].rowSet[0].slice(0, 10)));
    }
  }
} catch (err) {
  console.log("Team stats error:", err.message);
}

// Test player stats
console.log("\n=== PLAYER STATS ===");
try {
  const playerUrl = `https://stats.nba.com/stats/leaguedashplayerstats?Conference=&DateFrom=&DateTo=&Division=&DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2025-26&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=${TEAM_ID}&TwoWay=0&VsConference=&VsDivision=&Weight=`;
  const res = await fetch(playerUrl, { headers, signal: AbortSignal.timeout(15000) });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Result sets:", data.resultSets?.length);
  if (data.resultSets?.[0]) {
    console.log("Headers:", JSON.stringify(data.resultSets[0].headers));
    console.log("Row count:", data.resultSets[0].rowSet?.length);
    if (data.resultSets[0].rowSet?.[0]) {
      console.log("First row (first 15):", JSON.stringify(data.resultSets[0].rowSet[0].slice(0, 15)));
    }
  }
} catch (err) {
  console.log("Player stats error:", err.message);
}
