"use client";

import type { NbaPlayerLocalStats } from "@/lib/nba-local-data";
import { PlayerHeadshot } from "@/components/player-headshot";
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronDownIcon,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ───── Deep Dive options ─────
type DeepDiveKey =
  | "TOV"
  | "OREB"
  | "DREB"
  | "FG_PCT"
  | "FG3_PCT"
  | "FT_PCT";

const DEEP_DIVE_OPTIONS: { key: DeepDiveKey; label: string; short: string }[] =
  [
    { key: "TOV", label: "Turnovers", short: "TOV" },
    { key: "OREB", label: "Off. Rebounds", short: "OREB" },
    { key: "DREB", label: "Def. Rebounds", short: "DREB" },
    { key: "FG_PCT", label: "Field Goal %", short: "FG%" },
    { key: "FG3_PCT", label: "3-Point %", short: "3P%" },
    { key: "FT_PCT", label: "Free Throw %", short: "FT%" },
  ];

function getDeepDiveValue(player: NbaPlayerLocalStats, key: DeepDiveKey) {
  const val = player[key] as number;
  if (key === "FG_PCT" || key === "FG3_PCT" || key === "FT_PCT") {
    return (val * 100).toFixed(1) + "%";
  }
  return val.toFixed(1);
}

// ───── Sort logic ─────
type SortKey =
  | "name"
  | "gp"
  | "min"
  | "pts"
  | "ast"
  | "stl"
  | "blk"
  | "pf"
  | "reb"
  | "plusMinus"
  | "deepDive";

function getSortValue(
  player: NbaPlayerLocalStats,
  key: SortKey,
  deepDiveKey: DeepDiveKey
): number | string {
  switch (key) {
    case "name":
      return player.PLAYER_NAME;
    case "gp":
      return player.GP;
    case "min":
      return player.MIN;
    case "pts":
      return player.PTS;
    case "ast":
      return player.AST;
    case "stl":
      return player.STL;
    case "blk":
      return player.BLK;
    case "pf":
      return player.PF;
    case "reb":
      return player.REB;
    case "plusMinus":
      return player.PLUS_MINUS;
    case "deepDive":
      return player[deepDiveKey] as number;
    default:
      return 0;
  }
}

// ───── Column definitions ─────
interface Column {
  key: SortKey;
  label: string;
  group?: "offense" | "defense" | "impact";
  hideOnMobile?: boolean;
}

const COLUMNS: Column[] = [
  { key: "name", label: "Player" },
  { key: "gp", label: "GP", hideOnMobile: true },
  { key: "min", label: "MIN" },
  { key: "pts", label: "PTS", group: "offense" },
  { key: "ast", label: "AST", group: "offense" },
  { key: "stl", label: "STL", group: "defense", hideOnMobile: true },
  { key: "blk", label: "BLK", group: "defense", hideOnMobile: true },
  { key: "pf", label: "PF", group: "defense", hideOnMobile: true },
  { key: "reb", label: "REB", group: "impact" },
  { key: "plusMinus", label: "+/-", group: "impact" },
];

function isHealthConcern(player: NbaPlayerLocalStats): boolean {
  return player.GP < 15 || player.GP_L5 === 0;
}

// ───── Main component ─────
export function SeasonPlayerStatsTable({
  players,
  teamTricode,
  teamColor,
}: {
  players: NbaPlayerLocalStats[];
  teamTricode: string;
  teamColor: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("min");
  const [sortAsc, setSortAsc] = useState(false);
  const [deepDive, setDeepDive] = useState<DeepDiveKey>("TOV");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  const sorted = [...players].sort((a, b) => {
    const aVal = getSortValue(a, sortKey, deepDive);
    const bVal = getSortValue(b, sortKey, deepDive);
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const selectedDeepDive = DEEP_DIVE_OPTIONS.find((o) => o.key === deepDive)!;

  // Cell background classes per group
  function groupCellClass(group?: "offense" | "defense" | "impact") {
    switch (group) {
      case "offense":
        return "bg-blue-500/[0.04]";
      case "defense":
        return "bg-red-500/[0.04]";
      default:
        return "";
    }
  }

  function SortIcon({ colKey }: { colKey: SortKey }) {
    if (sortKey !== colKey) return null;
    return sortAsc ? (
      <ChevronUp className="h-3 w-3 shrink-0" />
    ) : (
      <ChevronDown className="h-3 w-3 shrink-0" />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Team header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div
          className="h-5 w-1 rounded-full"
          style={{ backgroundColor: teamColor }}
        />
        <h3 className="text-sm font-bold text-foreground">
          {teamTricode} Season Averages
        </h3>
        <span className="text-xs text-muted-foreground">Per Game</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          {/* ── Group labels ── */}
          <thead>
            <tr className="border-b border-border/40">
              {/* Player + General spacer */}
              <th colSpan={3} className="px-2 py-1" />
              <th
                colSpan={2}
                className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-400/70 text-center bg-blue-500/[0.04]"
              >
                Offense
              </th>
              <th
                colSpan={3}
                className="hidden sm:table-cell px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400/70 text-center bg-red-500/[0.04]"
              >
                Defense
              </th>
              <th
                colSpan={2}
                className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 text-center"
              >
                Impact
              </th>
              <th className="px-2 py-1" />
            </tr>

            {/* ── Column headers ── */}
            <tr className="border-b border-border bg-secondary/30">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors ${
                    col.key === "name"
                      ? "text-left pl-4 sticky left-0 bg-secondary/30 z-10"
                      : "text-center"
                  } ${col.hideOnMobile ? "hidden sm:table-cell" : ""} ${groupCellClass(col.group)}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div
                    className={`flex items-center gap-0.5 ${col.key !== "name" ? "justify-center" : ""}`}
                  >
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </div>
                </th>
              ))}

              {/* Deep Dive dropdown header */}
              <th className="px-2 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectedDeepDive.short}
                      <ChevronDownIcon className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    {DEEP_DIVE_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.key}
                        onClick={() => {
                          setDeepDive(opt.key);
                          setSortKey("deepDive");
                          setSortAsc(false);
                        }}
                        className={
                          deepDive === opt.key
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
                        }
                      >
                        <span className="text-xs">{opt.label}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                          {opt.short}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((player) => (
              <PlayerRow
                key={player.PLAYER_ID}
                player={player}
                teamColor={teamColor}
                deepDive={deepDive}
                groupCellClass={groupCellClass}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───── Player row ─────
function PlayerRow({
  player,
  teamColor,
  deepDive,
  groupCellClass,
}: {
  player: NbaPlayerLocalStats;
  teamColor: string;
  deepDive: DeepDiveKey;
  groupCellClass: (group?: "offense" | "defense" | "impact") => string;
}) {
  const hasHealthConcern = isHealthConcern(player);
  const isTopScorer = player.PTS >= 18;
  const plusMinus = player.PLUS_MINUS;

  return (
    <tr
      className={`border-b border-border/20 transition-colors hover:bg-secondary/20 ${
        hasHealthConcern && player.GP_L5 === 0 ? "opacity-50" : ""
      }`}
    >
      {/* Player name + height + headshot */}
      <td className="px-4 py-2.5 sticky left-0 bg-card z-10">
        <div className="flex items-center gap-2 min-w-[150px]">
          <PlayerHeadshot
            playerId={player.PLAYER_ID}
            playerName={player.PLAYER_NAME}
            size={32}
            teamColor={teamColor}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium leading-tight ${
                  isTopScorer ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {player.PLAYER_NAME}
              </span>
              {hasHealthConcern && (
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground/60">
              {player.PLAYER_HEIGHT || "N/A"}
            </span>
          </div>
        </div>
      </td>

      {/* GP */}
      <td className="px-2 py-2.5 text-center hidden sm:table-cell">
        <span className="text-xs font-mono text-foreground/70">
          {player.GP}
        </span>
      </td>

      {/* MIN */}
      <td className="px-2 py-2.5 text-center">
        <span className="text-xs font-mono text-foreground/70">
          {player.MIN.toFixed(1)}
        </span>
      </td>

      {/* PTS - offense */}
      <td
        className={`px-2 py-2.5 text-center ${groupCellClass("offense")}`}
      >
        <span
          className={`text-xs font-mono ${isTopScorer ? "font-bold" : "text-foreground/70"}`}
          style={isTopScorer ? { color: teamColor } : undefined}
        >
          {player.PTS.toFixed(1)}
        </span>
      </td>

      {/* AST - offense */}
      <td
        className={`px-2 py-2.5 text-center ${groupCellClass("offense")}`}
      >
        <span
          className={`text-xs font-mono ${player.AST >= 6 ? "font-bold" : "text-foreground/70"}`}
          style={player.AST >= 6 ? { color: teamColor } : undefined}
        >
          {player.AST.toFixed(1)}
        </span>
      </td>

      {/* STL - defense */}
      <td
        className={`px-2 py-2.5 text-center hidden sm:table-cell ${groupCellClass("defense")}`}
      >
        <span className="text-xs font-mono text-foreground/70">
          {player.STL.toFixed(1)}
        </span>
      </td>

      {/* BLK - defense */}
      <td
        className={`px-2 py-2.5 text-center hidden sm:table-cell ${groupCellClass("defense")}`}
      >
        <span className="text-xs font-mono text-foreground/70">
          {player.BLK.toFixed(1)}
        </span>
      </td>

      {/* PF - defense */}
      <td
        className={`px-2 py-2.5 text-center hidden sm:table-cell ${groupCellClass("defense")}`}
      >
        <span className="text-xs font-mono text-foreground/70">
          {player.PF.toFixed(1)}
        </span>
      </td>

      {/* REB - impact */}
      <td className="px-2 py-2.5 text-center">
        <span
          className={`text-xs font-mono ${player.REB >= 8 ? "font-bold" : "text-foreground/70"}`}
          style={player.REB >= 8 ? { color: teamColor } : undefined}
        >
          {player.REB.toFixed(1)}
        </span>
      </td>

      {/* +/- - impact */}
      <td className="px-2 py-2.5 text-center">
        <span
          className={`text-xs font-mono font-medium ${
            plusMinus > 10
              ? "text-emerald-400"
              : plusMinus < -10
                ? "text-red-400"
                : "text-foreground/70"
          }`}
        >
          {plusMinus > 0 ? "+" : ""}
          {plusMinus.toFixed(1)}
        </span>
      </td>

      {/* Deep Dive column */}
      <td className="px-2 py-2.5 text-center">
        <span className="text-xs font-mono text-foreground/70">
          {getDeepDiveValue(player, deepDive)}
        </span>
      </td>
    </tr>
  );
}
