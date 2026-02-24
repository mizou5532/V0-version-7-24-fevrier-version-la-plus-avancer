"use client";

import type { NbaTeamLocalStats } from "@/lib/nba-local-data";
import { AlertTriangle } from "lucide-react";

interface StatRow {
  label: string;
  awayValue: string;
  homeValue: string;
  awayRaw: number;
  homeRaw: number;
  higherIsBetter: boolean;
}

function buildSeasonStats(
  away: NbaTeamLocalStats,
  home: NbaTeamLocalStats
): StatRow[] {
  return [
    {
      label: "POINTS",
      awayValue: away.PTS.toFixed(1),
      homeValue: home.PTS.toFixed(1),
      awayRaw: away.PTS,
      homeRaw: home.PTS,
      higherIsBetter: true,
    },
    {
      label: "FG",
      awayValue: `${away.FGM.toFixed(1)}-${away.FGA.toFixed(1)} (${(away.FG_PCT * 100).toFixed(1)}%)`,
      homeValue: `${home.FGM.toFixed(1)}-${home.FGA.toFixed(1)} (${(home.FG_PCT * 100).toFixed(1)}%)`,
      awayRaw: away.FG_PCT,
      homeRaw: home.FG_PCT,
      higherIsBetter: true,
    },
    {
      label: "3PT",
      awayValue: `${away.FG3M.toFixed(1)}-${away.FG3A.toFixed(1)} (${(away.FG3_PCT * 100).toFixed(1)}%)`,
      homeValue: `${home.FG3M.toFixed(1)}-${home.FG3A.toFixed(1)} (${(home.FG3_PCT * 100).toFixed(1)}%)`,
      awayRaw: away.FG3_PCT,
      homeRaw: home.FG3_PCT,
      higherIsBetter: true,
    },
    {
      label: "FT",
      awayValue: `${away.FTM.toFixed(1)}-${away.FTA.toFixed(1)} (${(away.FT_PCT * 100).toFixed(1)}%)`,
      homeValue: `${home.FTM.toFixed(1)}-${home.FTA.toFixed(1)} (${(home.FT_PCT * 100).toFixed(1)}%)`,
      awayRaw: away.FT_PCT,
      homeRaw: home.FT_PCT,
      higherIsBetter: true,
    },
    {
      label: "REBOUNDS",
      awayValue: away.REB.toFixed(1),
      homeValue: home.REB.toFixed(1),
      awayRaw: away.REB,
      homeRaw: home.REB,
      higherIsBetter: true,
    },
    {
      label: "OFF REB",
      awayValue: away.OREB.toFixed(1),
      homeValue: home.OREB.toFixed(1),
      awayRaw: away.OREB,
      homeRaw: home.OREB,
      higherIsBetter: true,
    },
    {
      label: "DEF REB",
      awayValue: away.DREB.toFixed(1),
      homeValue: home.DREB.toFixed(1),
      awayRaw: away.DREB,
      homeRaw: home.DREB,
      higherIsBetter: true,
    },
    {
      label: "ASSISTS",
      awayValue: away.AST.toFixed(1),
      homeValue: home.AST.toFixed(1),
      awayRaw: away.AST,
      homeRaw: home.AST,
      higherIsBetter: true,
    },
    {
      label: "STEALS",
      awayValue: away.STL.toFixed(1),
      homeValue: home.STL.toFixed(1),
      awayRaw: away.STL,
      homeRaw: home.STL,
      higherIsBetter: true,
    },
    {
      label: "BLOCKS",
      awayValue: away.BLK.toFixed(1),
      homeValue: home.BLK.toFixed(1),
      awayRaw: away.BLK,
      homeRaw: home.BLK,
      higherIsBetter: true,
    },
    {
      label: "TURNOVERS",
      awayValue: away.TOV.toFixed(1),
      homeValue: home.TOV.toFixed(1),
      awayRaw: away.TOV,
      homeRaw: home.TOV,
      higherIsBetter: false,
    },
    {
      label: "FOULS",
      awayValue: away.PF.toFixed(1),
      homeValue: home.PF.toFixed(1),
      awayRaw: away.PF,
      homeRaw: home.PF,
      higherIsBetter: false,
    },
    {
      label: "+/-",
      awayValue: `${away.PLUS_MINUS > 0 ? "+" : ""}${away.PLUS_MINUS.toFixed(1)}`,
      homeValue: `${home.PLUS_MINUS > 0 ? "+" : ""}${home.PLUS_MINUS.toFixed(1)}`,
      awayRaw: away.PLUS_MINUS,
      homeRaw: home.PLUS_MINUS,
      higherIsBetter: true,
    },
  ];
}

export function SeasonTeamStatsComparison({
  awayStats,
  homeStats,
  awayTricode,
  homeTricode,
  awayColor,
  homeColor,
  awayFatigued,
  homeFatigued,
}: {
  awayStats: NbaTeamLocalStats;
  homeStats: NbaTeamLocalStats;
  awayTricode: string;
  homeTricode: string;
  awayColor: string;
  homeColor: string;
  awayFatigued: boolean;
  homeFatigued: boolean;
}) {
  const stats = buildSeasonStats(awayStats, homeStats);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: awayColor }}
          />
          <span className="text-xs font-bold text-foreground">{awayTricode}</span>
          {awayFatigued && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400" title="Played yesterday - potential fatigue">
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Fatigue</span>
            </span>
          )}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Team Stats
        </h3>
        <div className="flex items-center gap-2">
          {homeFatigued && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400" title="Played yesterday - potential fatigue">
              <span className="hidden sm:inline">Fatigue</span>
              <AlertTriangle className="h-3 w-3" />
            </span>
          )}
          <span className="text-xs font-bold text-foreground">{homeTricode}</span>
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: homeColor }}
          />
        </div>
      </div>

      {/* Stats rows */}
      <div className="divide-y divide-border/30">
        {stats.map((stat) => {
          const awayBetter = stat.higherIsBetter
            ? stat.awayRaw > stat.homeRaw
            : stat.awayRaw < stat.homeRaw;
          const homeBetter = stat.higherIsBetter
            ? stat.homeRaw > stat.awayRaw
            : stat.homeRaw < stat.awayRaw;
          const tied = stat.awayRaw === stat.homeRaw;

          // Proportional bar widths
          const total = Math.abs(stat.awayRaw) + Math.abs(stat.homeRaw);
          const awayPct = total > 0 ? (Math.abs(stat.awayRaw) / total) * 100 : 50;
          const homePct = total > 0 ? (Math.abs(stat.homeRaw) / total) * 100 : 50;

          return (
            <div key={stat.label} className="px-4 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono tabular-nums ${
                    awayBetter && !tied ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {stat.awayValue}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                  {stat.label}
                </span>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    homeBetter && !tied ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {stat.homeValue}
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                <div
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: `${awayPct}%`,
                    backgroundColor: awayBetter && !tied ? awayColor : `${awayColor}33`,
                  }}
                />
                <div
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: `${homePct}%`,
                    backgroundColor: homeBetter && !tied ? homeColor : `${homeColor}33`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
