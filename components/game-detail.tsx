"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BoxScoreResponse } from "@/lib/boxscore-types";
import { NBA_TEAM_COLORS } from "@/lib/nba-types";
import { getLocalTeamByTricode, getPlayersByTricode } from "@/lib/nba-local-data";
import { TeamLogo } from "@/components/team-logo";
import { PlayerStatsTable } from "@/components/player-stats-table";
import { TeamStatsComparison } from "@/components/team-stats-comparison";
import { SeasonTeamStatsComparison } from "@/components/season-team-stats-comparison";
import { SeasonPlayerStatsTable } from "@/components/season-player-stats-table";
import { PlayerProps } from "@/components/player-props";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Dices,
} from "lucide-react";

type StatsView = "game" | "season" | "props";
type Tab = "players" | "team-stats";

export function GameDetail({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [data, setData] = useState<BoxScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("players");
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");
  const [statsView, setStatsView] = useState<StatsView>("game");
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchBoxScore = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setIsRefreshing(true);
      try {
        const res = await fetch(`/api/boxscore/${gameId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
        setError(null);

        // Set default view ONLY on the first load, not on refetches
        if (!initialLoadDone) {
          const gameStatus = json.game?.gameStatus;
          if (gameStatus === 1) {
            setStatsView("season");
          }
          setInitialLoadDone(true);
        }
      } catch {
        setError("Unable to load game details.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [gameId, initialLoadDone]
  );

  useEffect(() => {
    fetchBoxScore();
    const interval = setInterval(() => fetchBoxScore(), 30000);
    return () => clearInterval(interval);
  }, [fetchBoxScore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-secondary" />
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading game details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          {error || "Game not found"}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Scores
        </button>
      </div>
    );
  }

  const game = data.game;
  const isLive = game.gameStatus === 2;
  const isFinal = game.gameStatus === 3;
  const hasStarted = game.gameStatus >= 2;

  const awayColors = NBA_TEAM_COLORS[game.awayTeam.teamTricode] || {
    primary: "#666",
    secondary: "#999",
  };
  const homeColors = NBA_TEAM_COLORS[game.homeTeam.teamTricode] || {
    primary: "#666",
    secondary: "#999",
  };

  const awayWinning = game.awayTeam.score > game.homeTeam.score;
  const homeWinning = game.homeTeam.score > game.awayTeam.score;

  // Local JSON lookups for season stats (instant, no API call)
  const awayLocalStats = getLocalTeamByTricode(game.awayTeam.teamTricode);
  const homeLocalStats = getLocalTeamByTricode(game.homeTeam.teamTricode);
  const hasSeasonData = !!awayLocalStats && !!homeLocalStats;
  const awayPlayers = getPlayersByTricode(game.awayTeam.teamTricode);
  const homePlayers = getPlayersByTricode(game.homeTeam.teamTricode);

  const tabs: { key: Tab; label: string }[] = [
    { key: "players", label: "Player Stats" },
    { key: "team-stats", label: "Team Stats" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className={`mx-auto px-4 py-3 flex items-center justify-between transition-all ${statsView === "props" ? "max-w-7xl" : "max-w-5xl"}`}>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scores</span>
          </button>

          <div className="flex items-center gap-2">
            {isLive && (
              <div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--live)/0.12)] px-2.5 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live))] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(var(--live))]" />
                </span>
                <span className="text-[10px] font-bold text-[hsl(var(--live))] uppercase tracking-widest">
                  Live
                </span>
              </div>
            )}
            {isFinal && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary rounded-full px-2.5 py-1">
                Final
              </span>
            )}
            {!hasStarted && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 rounded-full px-2.5 py-1">
                Preview
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchBoxScore(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 py-6 transition-all ${statsView === "props" ? "max-w-7xl" : "max-w-5xl"}`}>
        {/* Scoreboard Hero */}
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden mb-6">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: `linear-gradient(135deg, ${awayColors.primary}, transparent 50%, ${homeColors.primary})`,
            }}
          />

          <div className="relative p-6 sm:p-8">
            {/* Arena info */}
            {game.arena?.arenaName && (
              <div className="flex items-center justify-center gap-1.5 mb-6 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{game.arena.arenaName}</span>
                {game.arena.arenaCity && (
                  <span className="text-muted-foreground/50">
                    &middot; {game.arena.arenaCity}, {game.arena.arenaState}
                  </span>
                )}
              </div>
            )}

            {/* Main scoreboard */}
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              {/* Away team */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo tricode={game.awayTeam.teamTricode} size={64} />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {game.awayTeam.teamCity}
                  </p>
                  <p
                    className={`text-sm sm:text-lg font-bold ${awayWinning && hasStarted ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {game.awayTeam.teamName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono uppercase">
                    Away
                  </p>
                </div>
                {hasStarted && (
                  <p
                    className={`text-4xl sm:text-6xl font-mono font-bold tabular-nums ${
                      awayWinning
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {game.awayTeam.score}
                  </p>
                )}
                {!hasStarted && awayLocalStats && (
                  <p className="text-xs font-mono text-muted-foreground">
                    {awayLocalStats.W}-{awayLocalStats.L}
                  </p>
                )}
              </div>

              {/* Center divider / status */}
              <div className="flex flex-col items-center gap-2">
                {hasStarted ? (
                  <>
                    <div className="text-xs font-mono text-muted-foreground/40 uppercase">
                      vs
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-secondary rounded-full px-3 py-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {game.gameStatusText?.trim() || "LIVE"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-mono font-bold text-primary">
                      VS
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(game.gameTimeUTC).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Home team */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <TeamLogo tricode={game.homeTeam.teamTricode} size={64} />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {game.homeTeam.teamCity}
                  </p>
                  <p
                    className={`text-sm sm:text-lg font-bold ${homeWinning && hasStarted ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {game.homeTeam.teamName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono uppercase">
                    Home
                  </p>
                </div>
                {hasStarted && (
                  <p
                    className={`text-4xl sm:text-6xl font-mono font-bold tabular-nums ${
                      homeWinning
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {game.homeTeam.score}
                  </p>
                )}
                {!hasStarted && homeLocalStats && (
                  <p className="text-xs font-mono text-muted-foreground">
                    {homeLocalStats.W}-{homeLocalStats.L}
                  </p>
                )}
              </div>
            </div>

            {/* Quarter scores */}
            {hasStarted &&
              game.homeTeam.periods &&
              game.homeTeam.periods.length > 0 && (
                <div className="mt-6 mx-auto max-w-md">
                  <div
                    className="grid gap-1 text-center"
                    style={{
                      gridTemplateColumns: `80px repeat(${Math.max(game.homeTeam.periods.length, 4)}, 1fr) 50px`,
                    }}
                  >
                    <div />
                    {Array.from({
                      length: Math.max(
                        game.homeTeam.periods.length,
                        4
                      ),
                    }).map((_, i) => (
                      <div
                        key={`qh-${i}`}
                        className={`text-[10px] font-mono uppercase tracking-wider py-1.5 ${
                          isLive && i + 1 === game.period
                            ? "text-primary font-bold"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {i < 4 ? `Q${i + 1}` : `OT${i - 3}`}
                      </div>
                    ))}
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold py-1.5">
                      Total
                    </div>

                    {/* Away row */}
                    <div className="text-xs font-bold text-foreground/80 text-left py-1.5">
                      {game.awayTeam.teamTricode}
                    </div>
                    {Array.from({
                      length: Math.max(
                        game.homeTeam.periods.length,
                        4
                      ),
                    }).map((_, i) => (
                      <div
                        key={`aq-${i}`}
                        className={`text-xs font-mono py-1.5 ${
                          isLive && i + 1 === game.period
                            ? "text-foreground font-bold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {game.awayTeam.periods[i]?.score ?? "-"}
                      </div>
                    ))}
                    <div className="text-xs font-mono font-bold text-foreground py-1.5">
                      {game.awayTeam.score}
                    </div>

                    {/* Home row */}
                    <div className="text-xs font-bold text-foreground/80 text-left py-1.5">
                      {game.homeTeam.teamTricode}
                    </div>
                    {Array.from({
                      length: Math.max(
                        game.homeTeam.periods.length,
                        4
                      ),
                    }).map((_, i) => (
                      <div
                        key={`hq-${i}`}
                        className={`text-xs font-mono py-1.5 ${
                          isLive && i + 1 === game.period
                            ? "text-foreground font-bold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {game.homeTeam.periods[i]?.score ?? "-"}
                      </div>
                    ))}
                    <div className="text-xs font-mono font-bold text-foreground py-1.5">
                      {game.homeTeam.score}
                    </div>
                  </div>
                </div>
              )}

            {/* Game info row */}
            <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
              {game.attendance > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Users className="h-3 w-3" />
                  <span>{game.attendance.toLocaleString()}</span>
                </div>
              )}
              {game.duration > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  <span>
                    {Math.floor(game.duration / 60)}h{" "}
                    {game.duration % 60}m
                  </span>
                </div>
              )}
              {game.officials &&
                game.officials.length > 0 && (
                  <div className="text-[10px] text-muted-foreground/60">
                    Refs:{" "}
                    {game.officials
                      .map((o) => o.nameI || o.name)
                      .join(", ")}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Game / Season Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5">
            <button
              type="button"
              onClick={() => setStatsView("game")}
              disabled={!hasStarted}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                statsView === "game"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } ${!hasStarted ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <Zap className="h-3 w-3" />
              Game Stats
            </button>
            <button
              type="button"
              onClick={() => setStatsView("season")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                statsView === "season"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              Season Stats
            </button>
            <button
              type="button"
              onClick={() => setStatsView("props")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                statsView === "props"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Dices className="h-3 w-3" />
              Player Props
            </button>
          </div>

          {/* Tabs - for game view (when started) and season view, hidden for props */}
          {((statsView === "game" && hasStarted) || statsView === "season") && statsView !== "props" && (
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====== GAME STATS VIEW ====== */}
        {statsView === "game" && hasStarted && (
          <>
            {activeTab === "players" && (
              <div className="space-y-6">
                {/* Mobile team selector */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTeam("away")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      activeTeam === "away"
                        ? "bg-secondary text-foreground ring-1 ring-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    <TeamLogo
                      tricode={game.awayTeam.teamTricode}
                      size={20}
                    />
                    {game.awayTeam.teamTricode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTeam("home")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      activeTeam === "home"
                        ? "bg-secondary text-foreground ring-1 ring-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    <TeamLogo
                      tricode={game.homeTeam.teamTricode}
                      size={20}
                    />
                    {game.homeTeam.teamTricode}
                  </button>
                </div>

                {/* Mobile: show one team */}
                <div className="sm:hidden">
                  {activeTeam === "away" ? (
                    <PlayerStatsTable
                      players={game.awayTeam.players || []}
                      teamTricode={game.awayTeam.teamTricode}
                      teamColor={awayColors.primary}
                    />
                  ) : (
                    <PlayerStatsTable
                      players={game.homeTeam.players || []}
                      teamTricode={game.homeTeam.teamTricode}
                      teamColor={homeColors.primary}
                    />
                  )}
                </div>

                {/* Desktop: show both */}
                <div className="hidden sm:block space-y-6">
                  <PlayerStatsTable
                    players={game.awayTeam.players || []}
                    teamTricode={game.awayTeam.teamTricode}
                    teamColor={awayColors.primary}
                  />
                  <PlayerStatsTable
                    players={game.homeTeam.players || []}
                    teamTricode={game.homeTeam.teamTricode}
                    teamColor={homeColors.primary}
                  />
                </div>
              </div>
            )}

            {activeTab === "team-stats" && (
              <TeamStatsComparison
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
                awayColor={awayColors.primary}
                homeColor={homeColors.primary}
              />
            )}
          </>
        )}

        {/* ====== GAME STATS for NOT STARTED ====== */}
        {statsView === "game" && !hasStarted && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-border bg-card">
            <Clock className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Game stats will appear once the game begins.
            </p>
            <button
              type="button"
              onClick={() => setStatsView("season")}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Season Stats
            </button>
          </div>
        )}

        {/* ====== SEASON STATS VIEW ====== */}
        {statsView === "season" && (
          <>
            {activeTab === "players" && (
              <div className="space-y-6">
                {/* Mobile team selector */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTeam("away")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      activeTeam === "away"
                        ? "bg-secondary text-foreground ring-1 ring-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    <TeamLogo
                      tricode={game.awayTeam.teamTricode}
                      size={20}
                    />
                    {game.awayTeam.teamTricode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTeam("home")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      activeTeam === "home"
                        ? "bg-secondary text-foreground ring-1 ring-border"
                        : "text-muted-foreground"
                    }`}
                  >
                    <TeamLogo
                      tricode={game.homeTeam.teamTricode}
                      size={20}
                    />
                    {game.homeTeam.teamTricode}
                  </button>
                </div>

                {/* Mobile: show one team */}
                <div className="sm:hidden">
                  {activeTeam === "away" ? (
                    <SeasonPlayerStatsTable
                      players={awayPlayers}
                      teamTricode={game.awayTeam.teamTricode}
                      teamColor={awayColors.primary}
                    />
                  ) : (
                    <SeasonPlayerStatsTable
                      players={homePlayers}
                      teamTricode={game.homeTeam.teamTricode}
                      teamColor={homeColors.primary}
                    />
                  )}
                </div>

                {/* Desktop: show both */}
                <div className="hidden sm:block space-y-6">
                  <SeasonPlayerStatsTable
                    players={awayPlayers}
                    teamTricode={game.awayTeam.teamTricode}
                    teamColor={awayColors.primary}
                  />
                  <SeasonPlayerStatsTable
                    players={homePlayers}
                    teamTricode={game.homeTeam.teamTricode}
                    teamColor={homeColors.primary}
                  />
                </div>
              </div>
            )}

            {activeTab === "team-stats" && (
              <>
                {hasSeasonData ? (
                  <SeasonTeamStatsComparison
                    awayStats={awayLocalStats}
                    homeStats={homeLocalStats}
                    awayTricode={game.awayTeam.teamTricode}
                    homeTricode={game.homeTeam.teamTricode}
                    awayColor={awayColors.primary}
                    homeColor={homeColors.primary}
                    awayFatigued={awayLocalStats.A_JOUE_HIER}
                    homeFatigued={homeLocalStats.A_JOUE_HIER}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-border bg-card">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Season stats are not available for this matchup.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ====== PLAYER PROPS VIEW ====== */}
        {statsView === "props" && (
          <PlayerProps
            awayPlayers={awayPlayers}
            homePlayers={homePlayers}
            awayTricode={game.awayTeam.teamTricode}
            homeTricode={game.homeTeam.teamTricode}
            awayColor={awayColors.primary}
            homeColor={homeColors.primary}
          />
        )}

        {/* Auto-refresh notice for live */}
        {isLive && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live))] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(var(--live))]" />
            </span>
            <span>Auto-refreshing every 30 seconds</span>
          </div>
        )}
      </main>
    </div>
  );
}
