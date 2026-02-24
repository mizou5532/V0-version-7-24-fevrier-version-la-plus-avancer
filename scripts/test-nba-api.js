// Test which NBA API endpoints work from this environment

const endpoints = [
  {
    name: "CDN Scoreboard",
    url: "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json",
    headers: {},
  },
  {
    name: "Stats NBA Team Stats",
    url: "https://stats.nba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&Height=&ISTRound=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2025-26&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&TwoWay=0&VsConference=&VsDivision=",
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://www.nba.com/",
      Origin: "https://www.nba.com",
      "x-nba-stats-origin": "stats",
      "x-nba-stats-token": "true",
    },
  },
  {
    name: "S3 Prod Scoreboard",
    url: "https://nba-prod-us-east-1-mediaops-stats.s3.amazonaws.com/NBA/liveData/scoreboard/todaysScoreboard_00.json",
    headers: {},
  },
];

for (const ep of endpoints) {
  try {
    console.log(`\nTesting: ${ep.name}`);
    const res = await fetch(ep.url, {
      headers: ep.headers,
      signal: AbortSignal.timeout(10000),
    });
    console.log(`  Status: ${res.status}`);
    console.log(`  OK: ${res.ok}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`  Body length: ${text.length}`);
      console.log(`  First 200 chars: ${text.slice(0, 200)}`);
    } else {
      const text = await res.text();
      console.log(`  Error body: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
}
