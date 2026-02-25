"use client";

import Link from "next/link";
import type { NBAGame } from "@/lib/nba-types";
import { NBA_TEAM_COLORS } from "@/lib/nba-types";
import { getLocalTeamByTricode } from "@/lib/nba-local-data";
import { TeamLogo } from "@/components/team-logo";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

function getGameStatusInfo(game: NBAGame) {
  if (game.gameStatus === 1) {
    return { label: "UPCOMING", variant: "upcoming" as const };
  }
  if (game.gameStatus === 2) {
    return { label: "LIVE", variant: "live" as const };
  }
  return { label: "FINAL", variant: "final" as const };
}

function formatGameTime(game: NBAGame) {
  if (game.gameStatus === 1) {
    const date = new Date(game.gameTimeUTC);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (game.gameStatus === 2) {
    const clock = game.gameClock?.replace("PT", "").replace("M", ":").replace("S", "") || "";
    if (clock && clock !== "0:00" && clock !== ":") {
      const parts = clock.split(":");
      const mins = parts[0] || "0";
      const secs = parts[1] ? parts[1].split(".")[0].padStart(2, "0") : "00";
      return `Q${game.period} ${mins}:${secs}`;
    }
    if (game.period >= 1 && game.period <= 4) {
      return game.gameStatusText?.trim() || `Q${game.period}`;
    }
    return game.gameStatusText?.trim() || "LIVE";
  }
  return game.gameStatusText?.trim() || "FINAL";
}

export function GameCard({ game, odds }: { game: NBAGame; odds?: { home: number; away: number } }) {
  const status = getGameStatusInfo(game);
  const isLive = game.gameStatus === 2;
  const isFinal = game.gameStatus === 3;
  const timeDisplay = formatGameTime(game);

  const awayColors = NBA_TEAM_COLORS[game.awayTeam.teamTricode] || {
    primary: "#666",
    secondary: "#999",
  };
  const homeColors = NBA_TEAM_COLORS[game.homeTeam.teamTricode] || {
    primary: "#666",
    secondary: "#999",
  };

  return (
    <Link
      href={`/game/${game.gameId}`}
      className={`group relative block overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        isLive
          ? "border-live/30 bg-card shadow-[0_0_30px_-10px_hsl(var(--live)/0.15)]"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      {/* Subtle team color accent at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{
          background: `linear-gradient(90deg, ${homeColors.primary}, ${homeColors.secondary})`,
        }}
      />

      <div className="p-5">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live))] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--live))]" />
              </span>
            )}
            <Badge
              className={`text-[10px] font-bold tracking-widest uppercase border-0 px-2.5 py-0.5 ${
                isLive
                  ? "bg-[hsl(var(--live)/0.15)] text-[hsl(var(--live))]"
                  : isFinal
                    ? "bg-secondary text-muted-foreground"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground tracking-wide">
              {timeDisplay}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-3">
          <TeamRow
            team={game.awayTeam}
            isWinning={
              game.gameStatus !== 1 &&
              game.awayTeam.score > game.homeTeam.score
            }
            isLive={isLive}
            isFinal={isFinal}
            isUpcoming={game.gameStatus === 1}
            leader={game.gameLeaders?.awayLeaders}
            isB2B={getLocalTeamByTricode(game.awayTeam.teamTricode)?.A_JOUE_HIER ?? false}
            teamColor={awayColors.primary}
            odds={odds?.away}
            isFavorite={odds ? odds.away < odds.home : undefined}
          />

          <div className="h-px bg-border/50" />

          <TeamRow
            team={game.homeTeam}
            isWinning={
              game.gameStatus !== 1 &&
              game.homeTeam.score > game.awayTeam.score
            }
            isLive={isLive}
            isFinal={isFinal}
            isUpcoming={game.gameStatus === 1}
            leader={game.gameLeaders?.homeLeaders}
            isHome
            isB2B={getLocalTeamByTricode(game.homeTeam.teamTricode)?.A_JOUE_HIER ?? false}
            teamColor={homeColors.primary}
            odds={odds?.home}
            isFavorite={odds ? odds.home < odds.away : undefined}
          />
        </div>

        {/* Quarter scores for live/final games */}
        {game.gameStatus !== 1 &&
          game.homeTeam.periods &&
          game.homeTeam.periods.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="grid gap-1" style={{ gridTemplateColumns: `1fr repeat(${Math.max(game.homeTeam.periods.length, 4)}, 28px) 40px` }}>
                <div />
                {Array.from({ length: Math.max(game.homeTeam.periods.length, 4) }).map((_, i) => (
                  <div
                    key={`header-${game.gameId}-${i}`}
                    className="text-[10px] text-muted-foreground text-center font-mono"
                  >
                    {i < 4 ? `Q${i + 1}` : `OT${i - 3}`}
                  </div>
                ))}
                <div className="text-[10px] text-muted-foreground text-center font-mono font-bold">
                  {"T"}
                </div>

                {/* Away scores */}
                <div className="text-[11px] text-muted-foreground font-mono">
                  {game.awayTeam.teamTricode}
                </div>
                {Array.from({ length: Math.max(game.homeTeam.periods.length, 4) }).map((_, i) => (
                  <div
                    key={`away-${game.gameId}-${i}`}
                    className="text-[11px] text-center font-mono text-muted-foreground"
                  >
                    {game.awayTeam.periods[i]?.score ?? "-"}
                  </div>
                ))}
                <div className="text-[11px] text-center font-mono font-bold text-foreground">
                  {game.awayTeam.score || "-"}
                </div>

                {/* Home scores */}
                <div className="text-[11px] text-muted-foreground font-mono">
                  {game.homeTeam.teamTricode}
                </div>
                {Array.from({ length: Math.max(game.homeTeam.periods.length, 4) }).map((_, i) => (
                  <div
                    key={`home-${game.gameId}-${i}`}
                    className="text-[11px] text-center font-mono text-muted-foreground"
                  >
                    {game.homeTeam.periods[i]?.score ?? "-"}
                  </div>
                ))}
                <div className="text-[11px] text-center font-mono font-bold text-foreground">
                  {game.homeTeam.score || "-"}
                </div>
              </div>
            </div>
          )}
      </div>
    </Link>
  );
}

function TeamRow({
  team,
  isWinning,
  isLive,
  isFinal,
  isUpcoming,
  leader,
  isHome,
  isB2B,
  teamColor,
  odds,
  isFavorite,
}: {
  team: NBAGame["homeTeam"];
  isWinning: boolean;
  isLive: boolean;
  isFinal: boolean;
  isUpcoming: boolean;
  leader?: NBAGame["gameLeaders"]["homeLeaders"];
  isHome?: boolean;
  isB2B?: boolean;
  teamColor: string;
  odds?: number;
  isFavorite?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg px-3 py-2 flex items-center gap-3">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${teamColor}20 0%, ${teamColor}08 60%, transparent 100%)`,
        }}
      />
      <TeamLogo tricode={team.teamTricode} size={36} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold truncate ${
              isWinning ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {team.teamCity} {team.teamName}
          </span>
          {isHome && (
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-mono">
              {"HOME"}
            </span>
          )}
          {isB2B && (
            <span
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold tracking-wide bg-amber-500/15 text-amber-500 border border-amber-500/20"
              title="Back-to-Back: played yesterday"
            >
              B2B
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-mono">
            {team.wins}-{team.losses}
          </span>
          {leader && leader.name && (isLive || isFinal) && (
            <span className="text-[10px] text-muted-foreground/70 truncate">
              {leader.name}: {leader.points}p {leader.rebounds}r {leader.assists}a
            </span>
          )}
        </div>
      </div>

      {isUpcoming && odds != null ? (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-mono font-bold border ${
            isFavorite
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border-red-500/20"
          }`}
        >
          {odds.toFixed(2)}
        </span>
      ) : (
        <div
          className={`text-right font-mono text-2xl font-bold tabular-nums ${
            isWinning
              ? isLive
                ? "text-[hsl(var(--live))]"
                : "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {team.score > 0 ? team.score : "-"}
        </div>
      )}
    </div>
  );
}
