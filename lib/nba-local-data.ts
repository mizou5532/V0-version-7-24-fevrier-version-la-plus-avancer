import nbaData from "./nba-data.json";

export interface NbaPlayerLocalStats {
  PLAYER_ID: number;
  PLAYER_NAME: string;
  TEAM_ABBREVIATION: string;
  PLAYER_HEIGHT: string;
  AGE_x: number;
  GP: number;
  MIN: number;
  PTS: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  PF: number;
  TOV: number;
  OREB: number;
  DREB: number;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  PLUS_MINUS: number;
  // L5 stats
  GP_L5: number;
  MIN_L5: number;
  PTS_L5: number;
  REB_L5: number;
  AST_L5: number;
  STL_L5: number;
  BLK_L5: number;
  TOV_L5: number;
  OREB_L5: number;
  DREB_L5: number;
  FG_PCT_L5: number;
  FG3_PCT_L5: number;
  FT_PCT_L5: number;
  PLUS_MINUS_L5: number;
}

export interface NbaTeamLocalStats {
  TEAM_ID: number;
  TEAM_NAME: string;
  GP: number;
  W: number;
  L: number;
  W_PCT: number;
  MIN: number;
  PTS: number;
  FGM: number;
  FGA: number;
  FG_PCT: number;
  FG3M: number;
  FG3A: number;
  FG3_PCT: number;
  FTM: number;
  FTA: number;
  FT_PCT: number;
  OREB: number;
  DREB: number;
  REB: number;
  AST: number;
  TOV: number;
  STL: number;
  BLK: number;
  PF: number;
  PLUS_MINUS: number;
  A_JOUE_HIER: boolean;
}

interface NbaLocalData {
  meta: { last_updated: string; season: string };
  teams: NbaTeamLocalStats[];
  players: NbaPlayerLocalStats[];
}

const data = nbaData as NbaLocalData;

const teamsByIdMap = new Map<number, NbaTeamLocalStats>();
for (const team of data.teams) {
  teamsByIdMap.set(team.TEAM_ID, team);
}

// Tricode to team ID mapping
const tricodeToId: Record<string, number> = {
  ATL: 1610612737,
  BOS: 1610612738,
  BKN: 1610612751,
  CHA: 1610612766,
  CHI: 1610612741,
  CLE: 1610612739,
  DAL: 1610612742,
  DEN: 1610612743,
  DET: 1610612765,
  GSW: 1610612744,
  HOU: 1610612745,
  IND: 1610612754,
  LAC: 1610612746,
  LAL: 1610612747,
  MEM: 1610612763,
  MIA: 1610612748,
  MIL: 1610612749,
  MIN: 1610612750,
  NOP: 1610612740,
  NYK: 1610612752,
  OKC: 1610612760,
  ORL: 1610612753,
  PHI: 1610612755,
  PHX: 1610612756,
  POR: 1610612757,
  SAC: 1610612758,
  SAS: 1610612759,
  TOR: 1610612761,
  UTA: 1610612762,
  WAS: 1610612764,
};

export function getLocalTeamById(teamId: number): NbaTeamLocalStats | undefined {
  return teamsByIdMap.get(teamId);
}

export function getLocalTeamByTricode(tricode: string): NbaTeamLocalStats | undefined {
  const id = tricodeToId[tricode];
  if (!id) return undefined;
  return teamsByIdMap.get(id);
}

export function getPlayersByTricode(tricode: string): NbaPlayerLocalStats[] {
  return data.players
    .filter((p) => p.TEAM_ABBREVIATION === tricode)
    .sort((a, b) => b.MIN - a.MIN);
}

export function getLocalDataMeta() {
  return data.meta;
}
