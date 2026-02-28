"use client";

import type { BoxScorePlayer } from "@/lib/boxscore-types";
import { PlayerHeadshot } from "@/components/player-headshot";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortKey =
  | "name"
  | "minutes"
  | "points"
  | "rebounds"
  | "assists"
  | "steals"
  | "blocks"
  | "turnovers"
  | "fg"
  | "threeP"
  | "ft"
  | "plusMinus"
  | "fouls";

const columns: { key: SortKey; label: string; shortLabel: string }[] = [
  { key: "name", label: "Player", shortLabel: "Player" },
  { key: "minutes", label: "MIN", shortLabel: "MIN" },
  { key: "points", label: "PTS", shortLabel: "PTS" },
  { key: "rebounds", label: "REB", shortLabel: "REB" },
  { key: "assists", label: "AST", shortLabel: "AST" },
  { key: "steals", label: "STL", shortLabel: "STL" },
  { key: "blocks", label: "BLK", shortLabel: "BLK" },
  { key: "turnovers", label: "TO", shortLabel: "TO" },
  { key: "fg", label: "FG", shortLabel: "FG" },
  { key: "threeP", label: "3PT", shortLabel: "3PT" },
  { key: "ft", label: "FT", shortLabel: "FT" },
  { key: "fouls", label: "PF", shortLabel: "PF" },
  { key: "plusMinus", label: "+/-", shortLabel: "+/-" },
];

function parseMinutes(min: string): number {
  if (!min) return 0;
  const cleaned = min.replace("PT", "").replace("M", ":").replace("S", "");
  const parts = cleaned.split(":");
  return (Number.parseInt(parts[0] || "0") || 0) + (Number.parseInt(parts[1] || "0") || 0) / 60;
}

function formatMinutes(min: string): string {
  if (!min) return "0:00";
  const cleaned = min.replace("PT", "").replace("M", ":").replace("S", "");
  const parts = cleaned.split(":");
  const mins = parts[0] || "0";
  const secs = parts[1] ? parts[1].split(".")[0].padStart(2, "0") : "00";
  return `${mins}:${secs}`;
}

function getSortValue(player: BoxScorePlayer, key: SortKey): number | string {
  const s = player.statistics;
  switch (key) {
    case "name":
      return player.familyName || player.name || "";
    case "minutes":
      return parseMinutes(s?.minutes || "");
    case "points":
      return s?.points || 0;
    case "rebounds":
      return s?.reboundsTotal || 0;
    case "assists":
      return s?.assists || 0;
    case "steals":
      return s?.steals || 0;
    case "blocks":
      return s?.blocks || 0;
    case "turnovers":
      return s?.turnovers || 0;
    case "fg":
      return s?.fieldGoalsMade || 0;
    case "threeP":
      return s?.threePointersMade || 0;
    case "ft":
      return s?.freeThrowsMade || 0;
    case "fouls":
      return s?.foulsPersonal || 0;
    case "plusMinus":
      return s?.plusMinusPoints || 0;
    default:
      return 0;
  }
}

export function PlayerStatsTable({
  players,
  teamTricode,
  teamColor,
}: {
  players: BoxScorePlayer[];
  teamTricode: string;
  teamColor: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("minutes");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  const activePlayers = players.filter((p) => p.played === "1" || p.status === "ACTIVE");
  const inactivePlayers = players.filter((p) => p.played !== "1" && p.status !== "ACTIVE");

  const starters = activePlayers
    .filter((p) => p.starter === "1")
    .sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const bench = activePlayers
    .filter((p) => p.starter !== "1")
    .sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Team header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="h-5 w-1 rounded-full" style={{ backgroundColor: teamColor }} />
        <h3 className="text-sm font-bold text-foreground">{teamTricode} Players</h3>
        <span className="text-xs text-muted-foreground">
          {activePlayers.length} active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors ${
                    col.key === "name" ? "text-left pl-4 sticky left-0 bg-secondary/30 z-10" : "text-center"
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={`flex items-center gap-0.5 ${col.key !== "name" ? "justify-center" : ""}`}>
                    {col.shortLabel}
                    {sortKey === col.key && (
                      sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Starters */}
            {starters.length > 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/20"
                >
                  Starters
                </td>
              </tr>
            )}
            {starters.map((player) => (
              <PlayerRow key={player.personId} player={player} teamColor={teamColor} />
            ))}

            {/* Bench */}
            {bench.length > 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/20"
                >
                  Bench
                </td>
              </tr>
            )}
            {bench.map((player) => (
              <PlayerRow key={player.personId} player={player} teamColor={teamColor} />
            ))}

            {/* Inactive / DNP */}
            {inactivePlayers.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/20"
                  >
                    Inactive / DNP
                  </td>
                </tr>
                {inactivePlayers.map((player) => (
                  <tr key={player.personId} className="border-b border-border/30">
                    <td className="px-4 py-2 sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground/40 w-5 text-center">
                          {player.jerseyNum || "-"}
                        </span>
                        <span className="text-xs text-muted-foreground/50">
                          {player.nameI || player.name || `${player.firstName} ${player.familyName}`}
                        </span>
                      </div>
                    </td>
                    <td colSpan={columns.length - 1} className="px-2 py-2 text-xs text-muted-foreground/40 text-center">
                      {player.notPlayingReason || "DNP"}
                      {player.notPlayingDescription ? ` - ${player.notPlayingDescription}` : ""}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerRow({ player, teamColor }: { player: BoxScorePlayer; teamColor: string }) {
  const s = player.statistics;
  if (!s) return null;

  const isHighScorer = s.points >= 20;
  const isDoubleDouble =
    [s.points, s.reboundsTotal, s.assists, s.steals, s.blocks].filter((v) => v >= 10).length >= 2;

  return (
    <tr
      className={`border-b border-border/30 transition-colors hover:bg-secondary/20 ${
        isDoubleDouble ? "bg-primary/[0.03]" : ""
      }`}
    >
      <td className="px-4 py-2 sticky left-0 bg-card z-10">
        <div className="flex items-center gap-2">
          <PlayerHeadshot
            playerId={player.personId}
            playerName={player.nameI || player.name || `${player.firstName} ${player.familyName}`}
            size={32}
            teamColor={teamColor}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-medium ${isHighScorer ? "text-foreground" : "text-foreground/80"}`}
              >
                {player.nameI || player.name || `${player.firstName} ${player.familyName}`}
              </span>
              {player.oncourt === "1" && (
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: teamColor }}
                  title="On court"
                />
              )}
            </div>
            {player.position && (
              <span className="text-[9px] text-muted-foreground/50 uppercase">
                {player.position}
              </span>
            )}
          </div>
          {isDoubleDouble && (
            <span className="text-[8px] font-bold text-primary bg-primary/10 rounded px-1 py-0.5 uppercase tracking-wider">
              DD
            </span>
          )}
        </div>
      </td>
      <StatCell value={formatMinutes(s.minutes)} />
      <StatCell value={s.points} highlight={s.points >= 20} teamColor={teamColor} />
      <StatCell value={s.reboundsTotal} highlight={s.reboundsTotal >= 10} teamColor={teamColor} />
      <StatCell value={s.assists} highlight={s.assists >= 10} teamColor={teamColor} />
      <StatCell value={s.steals} highlight={s.steals >= 3} teamColor={teamColor} />
      <StatCell value={s.blocks} highlight={s.blocks >= 3} teamColor={teamColor} />
      <StatCell value={s.turnovers} negative={s.turnovers >= 4} />
      <StatCell value={`${s.fieldGoalsMade}-${s.fieldGoalsAttempted}`} sub={`${(s.fieldGoalsPercentage * 100).toFixed(0)}%`} />
      <StatCell value={`${s.threePointersMade}-${s.threePointersAttempted}`} sub={s.threePointersAttempted > 0 ? `${(s.threePointersPercentage * 100).toFixed(0)}%` : undefined} />
      <StatCell value={`${s.freeThrowsMade}-${s.freeThrowsAttempted}`} sub={s.freeThrowsAttempted > 0 ? `${(s.freeThrowsPercentage * 100).toFixed(0)}%` : undefined} />
      <StatCell value={s.foulsPersonal} negative={s.foulsPersonal >= 5} />
      <StatCell
        value={s.plusMinusPoints > 0 ? `+${s.plusMinusPoints}` : s.plusMinusPoints.toString()}
        positive={s.plusMinusPoints > 0}
        negative={s.plusMinusPoints < -10}
      />
    </tr>
  );
}

function StatCell({
  value,
  sub,
  highlight,
  positive,
  negative,
  teamColor,
}: {
  value: string | number;
  sub?: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
  teamColor?: string;
}) {
  return (
    <td className="px-2 py-2 text-center">
      <div className="flex flex-col items-center">
        <span
          className={`text-xs font-mono ${
            highlight
              ? "font-bold text-foreground"
              : positive
                ? "text-[hsl(var(--live))]"
                : negative
                  ? "text-destructive"
                  : "text-foreground/70"
          }`}
          style={highlight && teamColor ? { color: teamColor } : undefined}
        >
          {value}
        </span>
        {sub && (
          <span className="text-[9px] text-muted-foreground/50 font-mono">{sub}</span>
        )}
      </div>
    </td>
  );
}
