"use client";

import type { BoxScoreTeam } from "@/lib/boxscore-types";

interface StatRow {
  label: string;
  awayValue: string | number;
  homeValue: string | number;
  awayRaw: number;
  homeRaw: number;
  higherIsBetter?: boolean;
}

function getTeamStats(away: BoxScoreTeam, home: BoxScoreTeam): StatRow[] {
  const a = away.statistics;
  const h = home.statistics;
  if (!a || !h) return [];

  return [
    {
      label: "Points",
      awayValue: a.points,
      homeValue: h.points,
      awayRaw: a.points,
      homeRaw: h.points,
      higherIsBetter: true,
    },
    {
      label: "FG",
      awayValue: `${a.fieldGoalsMade}-${a.fieldGoalsAttempted} (${(a.fieldGoalsPercentage * 100).toFixed(1)}%)`,
      homeValue: `${h.fieldGoalsMade}-${h.fieldGoalsAttempted} (${(h.fieldGoalsPercentage * 100).toFixed(1)}%)`,
      awayRaw: a.fieldGoalsPercentage,
      homeRaw: h.fieldGoalsPercentage,
      higherIsBetter: true,
    },
    {
      label: "3PT",
      awayValue: `${a.threePointersMade}-${a.threePointersAttempted} (${(a.threePointersPercentage * 100).toFixed(1)}%)`,
      homeValue: `${h.threePointersMade}-${h.threePointersAttempted} (${(h.threePointersPercentage * 100).toFixed(1)}%)`,
      awayRaw: a.threePointersPercentage,
      homeRaw: h.threePointersPercentage,
      higherIsBetter: true,
    },
    {
      label: "FT",
      awayValue: `${a.freeThrowsMade}-${a.freeThrowsAttempted} (${(a.freeThrowsPercentage * 100).toFixed(1)}%)`,
      homeValue: `${h.freeThrowsMade}-${h.freeThrowsAttempted} (${(h.freeThrowsPercentage * 100).toFixed(1)}%)`,
      awayRaw: a.freeThrowsPercentage,
      homeRaw: h.freeThrowsPercentage,
      higherIsBetter: true,
    },
    {
      label: "Rebounds",
      awayValue: a.reboundsTotal,
      homeValue: h.reboundsTotal,
      awayRaw: a.reboundsTotal,
      homeRaw: h.reboundsTotal,
      higherIsBetter: true,
    },
    {
      label: "Off Reb",
      awayValue: a.reboundsOffensive,
      homeValue: h.reboundsOffensive,
      awayRaw: a.reboundsOffensive,
      homeRaw: h.reboundsOffensive,
      higherIsBetter: true,
    },
    {
      label: "Def Reb",
      awayValue: a.reboundsDefensive,
      homeValue: h.reboundsDefensive,
      awayRaw: a.reboundsDefensive,
      homeRaw: h.reboundsDefensive,
      higherIsBetter: true,
    },
    {
      label: "Assists",
      awayValue: a.assists,
      homeValue: h.assists,
      awayRaw: a.assists,
      homeRaw: h.assists,
      higherIsBetter: true,
    },
    {
      label: "Steals",
      awayValue: a.steals,
      homeValue: h.steals,
      awayRaw: a.steals,
      homeRaw: h.steals,
      higherIsBetter: true,
    },
    {
      label: "Blocks",
      awayValue: a.blocks,
      homeValue: h.blocks,
      awayRaw: a.blocks,
      homeRaw: h.blocks,
      higherIsBetter: true,
    },
    {
      label: "Turnovers",
      awayValue: a.turnovers,
      homeValue: h.turnovers,
      awayRaw: a.turnovers,
      homeRaw: h.turnovers,
      higherIsBetter: false,
    },
    {
      label: "Fouls",
      awayValue: a.foulsPersonal,
      homeValue: h.foulsPersonal,
      awayRaw: a.foulsPersonal,
      homeRaw: h.foulsPersonal,
      higherIsBetter: false,
    },
    {
      label: "Fast Break Pts",
      awayValue: a.pointsFastBreak,
      homeValue: h.pointsFastBreak,
      awayRaw: a.pointsFastBreak,
      homeRaw: h.pointsFastBreak,
      higherIsBetter: true,
    },
    {
      label: "Pts in Paint",
      awayValue: a.pointsInThePaint,
      homeValue: h.pointsInThePaint,
      awayRaw: a.pointsInThePaint,
      homeRaw: h.pointsInThePaint,
      higherIsBetter: true,
    },
    {
      label: "2nd Chance Pts",
      awayValue: a.pointsSecondChance,
      homeValue: h.pointsSecondChance,
      awayRaw: a.pointsSecondChance,
      homeRaw: h.pointsSecondChance,
      higherIsBetter: true,
    },
    {
      label: "Pts off TO",
      awayValue: a.pointsFromTurnovers,
      homeValue: h.pointsFromTurnovers,
      awayRaw: a.pointsFromTurnovers,
      homeRaw: h.pointsFromTurnovers,
      higherIsBetter: true,
    },
    {
      label: "Bench Pts",
      awayValue: a.benchPoints,
      homeValue: h.benchPoints,
      awayRaw: a.benchPoints,
      homeRaw: h.benchPoints,
      higherIsBetter: true,
    },
    {
      label: "Biggest Lead",
      awayValue: a.biggestLead,
      homeValue: h.biggestLead,
      awayRaw: a.biggestLead,
      homeRaw: h.biggestLead,
      higherIsBetter: true,
    },
    {
      label: "Lead Changes",
      awayValue: a.leadChanges,
      homeValue: h.leadChanges,
      awayRaw: a.leadChanges,
      homeRaw: h.leadChanges,
    },
    {
      label: "Times Tied",
      awayValue: a.timesTied,
      homeValue: h.timesTied,
      awayRaw: a.timesTied,
      homeRaw: h.timesTied,
    },
  ];
}

export function TeamStatsComparison({
  awayTeam,
  homeTeam,
  awayColor,
  homeColor,
}: {
  awayTeam: BoxScoreTeam;
  homeTeam: BoxScoreTeam;
  awayColor: string;
  homeColor: string;
}) {
  const stats = getTeamStats(awayTeam, homeTeam);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: awayColor }} />
          <span className="text-xs font-bold text-foreground">{awayTeam.teamTricode}</span>
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Team Stats
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{homeTeam.teamTricode}</span>
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: homeColor }} />
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {stats.map((stat) => {
          const awayBetter =
            stat.higherIsBetter !== undefined
              ? stat.higherIsBetter
                ? stat.awayRaw > stat.homeRaw
                : stat.awayRaw < stat.homeRaw
              : false;
          const homeBetter =
            stat.higherIsBetter !== undefined
              ? stat.higherIsBetter
                ? stat.homeRaw > stat.awayRaw
                : stat.homeRaw < stat.awayRaw
              : false;
          const total = stat.awayRaw + stat.homeRaw;
          const awayPct = total > 0 ? (stat.awayRaw / total) * 100 : 50;
          const homePct = total > 0 ? (stat.homeRaw / total) * 100 : 50;

          return (
            <div key={stat.label} className="px-4 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-mono tabular-nums ${awayBetter ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  {stat.awayValue}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                  {stat.label}
                </span>
                <span
                  className={`text-xs font-mono tabular-nums ${homeBetter ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  {stat.homeValue}
                </span>
              </div>
              {/* Comparison bar */}
              {stat.higherIsBetter !== undefined && total > 0 && (
                <div className="flex h-1 rounded-full overflow-hidden gap-0.5">
                  <div
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: `${awayPct}%`,
                      backgroundColor: awayBetter ? awayColor : `${awayColor}44`,
                    }}
                  />
                  <div
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: `${homePct}%`,
                      backgroundColor: homeBetter ? homeColor : `${homeColor}44`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
