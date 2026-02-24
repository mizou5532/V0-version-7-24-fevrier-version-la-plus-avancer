import type { NbaTeamLocalStats } from "./nba-local-data";

export interface SeasonTeamData {
  teamId: number;
  teamTricode: string;
  teamName: string;
  teamCity: string;
  stats: NbaTeamLocalStats;
}
