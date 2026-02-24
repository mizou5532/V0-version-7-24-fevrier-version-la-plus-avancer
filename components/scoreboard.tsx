"use client";

import { useEffect, useState, useCallback } from "react";
import type { NBAScoreboard, NBAGame } from "@/lib/nba-types";
import { GameCard } from "@/components/game-card";
import { RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type FilterType = "all" | "live" | "final" | "upcoming";

function getTodayET(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function formatDateLabel(dateStr: string): string {
  const today = getTodayET();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function Scoreboard() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayET);
  const [data, setData] = useState<NBAScoreboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isToday = selectedDate === getTodayET();

  const fetchScores = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setIsRefreshing(true);
      try {
        const url = isToday
          ? "/api/scores"
          : `/api/scores?date=${selectedDate}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
        setError(null);
        setLastUpdated(new Date());
      } catch {
        setError("Unable to load scores. Please try again.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate, isToday]
  );

  useEffect(() => {
    setLoading(true);
    setFilter("all");
    fetchScores();

    // Only auto-refresh for today's games
    if (isToday) {
      const interval = setInterval(() => fetchScores(), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchScores, isToday]);

  const goToPrev = () => setSelectedDate((d) => addDays(d, -1));
  const goToNext = () => setSelectedDate((d) => addDays(d, 1));
  const goToToday = () => setSelectedDate(getTodayET());

  const games = data?.scoreboard?.games || [];

  const liveGames = games.filter((g) => g.gameStatus === 2);
  const finalGames = games.filter((g) => g.gameStatus === 3);
  const upcomingGames = games.filter((g) => g.gameStatus === 1);

  const filteredGames =
    filter === "live"
      ? liveGames
      : filter === "final"
        ? finalGames
        : filter === "upcoming"
          ? upcomingGames
          : [...liveGames, ...games.filter((g) => g.gameStatus !== 2)];

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All Games", count: games.length },
    { key: "live", label: "Live", count: liveGames.length },
    { key: "final", label: "Final", count: finalGames.length },
    { key: "upcoming", label: "Upcoming", count: upcomingGames.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  NBA Scores
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  {error ? (
                    <WifiOff className="h-3 w-3 text-destructive" />
                  ) : (
                    <Wifi className="h-3 w-3 text-[hsl(var(--live))]" />
                  )}
                  <span>
                    {lastUpdated.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fetchScores(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                aria-label="Refresh scores"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={goToPrev}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={goToToday}
              className="flex items-center gap-2"
            >
              <span className="text-base font-semibold text-foreground">
                {formatDateLabel(selectedDate)}
              </span>
              {isToday && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live))] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(var(--live))]" />
                </span>
              )}
            </button>
            <span className="text-[11px] text-muted-foreground font-mono">
              {formatFullDate(selectedDate)}
            </span>
            {!isToday && (
              <button
                type="button"
                onClick={goToToday}
                className="text-[10px] text-primary hover:underline mt-0.5"
              >
                Back to Today
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {f.key === "live" && f.count > 0 && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
              )}
              {f.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  filter === f.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/50 text-muted-foreground"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-secondary" />
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading scores...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchScores();
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                No games scheduled
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isToday
                  ? "Check back later for upcoming NBA games"
                  : `No games on ${formatFullDate(selectedDate)}`}
              </p>
            </div>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && games.length > 0 && filteredGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm text-muted-foreground">
              No {filter} games right now
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-xs text-primary hover:underline"
            >
              View all games
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && filteredGames.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game: NBAGame) => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>
        )}

        {/* Live indicator */}
        {isToday && liveGames.length > 0 && !loading && (
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
