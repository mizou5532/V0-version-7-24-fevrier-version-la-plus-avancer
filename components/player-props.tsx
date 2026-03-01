"use client";

import { useState, useEffect, useMemo } from "react";
import type { NbaPlayerLocalStats } from "@/lib/nba-local-data";
import { TeamLogo } from "@/components/team-logo";
import { PlayerHeadshot } from "@/components/player-headshot";
import { X, Trash2, Calculator, ChevronDown, ChevronUp, Trophy, ArrowLeftRight } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

// ─── Types ───
interface PropLine {
  label: string;
  values: number[];
}

interface BetSelection {
  playerId: number;
  playerName: string;
  teamTricode: string;
  category: string; // "Points" | "Rebounds" | "Assists"
  line: number;
  odds: number;
}

// ─── Generate odds based on player stats ───
// Returns null if the line is too far from the player's average (no real odds available)
function generateOdds(
  playerAvg: number,
  line: number
): number | null {
  const diff = line - playerAvg;
  const ratio = diff / Math.max(playerAvg, 1);

  // If the line is way below the average (player almost guaranteed to hit it),
  // no bookmaker would offer this — return null (not available)
  if (ratio <= -0.35) return null;

  // If the line is way above the average (extremely unlikely),
  // also return null — no realistic odds
  if (ratio > 0.8) return null;

  // Realistic odds range for lines near the player's average
  if (ratio <= -0.2) return 1.30;
  if (ratio <= -0.1) return 1.50;
  if (ratio <= 0.0) return 1.75;
  if (ratio <= 0.1) return 2.00;
  if (ratio <= 0.2) return 2.25;
  if (ratio <= 0.35) return 2.75;
  if (ratio <= 0.5) return 3.40;
  if (ratio <= 0.65) return 4.00;
  return 5.00;
}

// ─── Fixed prop lines per category ───
const POINTS_LINES = [10, 15, 20, 25, 30];
const REBOUNDS_LINES = [2, 4, 6, 8, 10];
const ASSISTS_LINES = [2, 4, 6, 8, 10];

// ─── Bet Slip Content (shared between sidebar and drawer) ───
function BetSlipContent({
  selections,
  stake,
  onStakeChange,
  onRemove,
  onClear,
}: {
  selections: BetSelection[];
  stake: string;
  onStakeChange: (val: string) => void;
  onRemove: (sel: BetSelection) => void;
  onClear: () => void;
}) {
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const potentialWin = totalOdds * stakeNum;

  return (
    <div className="flex flex-col h-full">
      {selections.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <Calculator className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Selectionne des props pour commencer
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {selections.map((sel) => (
                <div
                  key={`${sel.playerId}-${sel.category}`}
                  className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border px-3 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {sel.playerName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {sel.category} +{sel.line} &middot;{" "}
                      <span className="text-primary font-bold">{sel.teamTricode}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary shrink-0">
                    {sel.odds.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(sel)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${sel.playerName} ${sel.category}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Calculator section */}
          <div className="mt-4 pt-4 border-t border-border">
            {/* Total odds */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Cote Totale</span>
              <span className="text-sm font-mono font-bold text-primary">
                {totalOdds.toFixed(2)}
              </span>
            </div>

            {/* Stake input */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Mise"
                value={stake}
                onChange={(e) => onStakeChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 pl-7 pr-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Quick stake buttons */}
            <div className="flex gap-1.5 mb-4">
              {[5, 10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onStakeChange(String(amount))}
                  className={`flex-1 rounded-md py-1.5 text-[10px] font-mono font-bold transition-all ${
                    stake === String(amount)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Potential win */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 mb-3">
              <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-1">
                Gain Potentiel
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                ${potentialWin.toFixed(2)}
              </p>
            </div>

            {/* Clear button */}
            <button
              type="button"
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Effacer tout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Player Prop Card ───
function PlayerPropCard({
  player,
  teamTricode,
  teamColor,
  selections,
  onSelect,
}: {
  player: NbaPlayerLocalStats;
  teamTricode: string;
  teamColor: string;
  selections: BetSelection[];
  onSelect: (sel: BetSelection) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const categories: { label: string; avg: number; lines: number[] }[] = [
    { label: "Points", avg: player.PTS, lines: POINTS_LINES },
    { label: "Rebonds", avg: player.REB, lines: REBOUNDS_LINES },
    { label: "Assists", avg: player.AST, lines: ASSISTS_LINES },
  ];

  const isSelected = (category: string, line: number) =>
    selections.some(
      (s) =>
        s.playerId === player.PLAYER_ID &&
        s.category === category &&
        s.line === line
    );

  const hasSelectionInCategory = (category: string) =>
    selections.some(
      (s) => s.playerId === player.PLAYER_ID && s.category === category
    );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all">
      {/* Player header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
      >
        <PlayerHeadshot
          playerId={player.PLAYER_ID}
          playerName={player.PLAYER_NAME}
          size={36}
          teamColor={teamColor}
        />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {player.PLAYER_NAME}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {player.PTS.toFixed(1)} PTS &middot; {player.REB.toFixed(1)} REB &middot;{" "}
            {player.AST.toFixed(1)} AST
          </p>
        </div>
        {hasSelectionInCategory("Points") ||
        hasSelectionInCategory("Rebonds") ||
        hasSelectionInCategory("Assists") ? (
          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
        ) : null}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Props grid */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              return (
                <div key={cat.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                    {cat.label}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {cat.lines.map((line) => {
                      const odds = generateOdds(cat.avg, line);
                      const available = odds !== null;
                      const active = available && isSelected(cat.label, line);
                      return (
                        <button
                          key={line}
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            if (!available) return;
                            onSelect({
                              playerId: player.PLAYER_ID,
                              playerName: player.PLAYER_NAME,
                              teamTricode,
                              category: cat.label,
                              line,
                              odds,
                            });
                          }}
                          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1.5 transition-all duration-200 ${
                            !available
                              ? "bg-secondary/10 border-border/50 opacity-40 cursor-not-allowed"
                              : active
                                ? "bg-primary/15 border-primary shadow-[0_0_12px_-4px_hsl(var(--primary)/0.4)] ring-1 ring-primary/50"
                                : "bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/60"
                          }`}
                        >
                          <span
                            className={`text-sm font-bold font-mono ${
                              !available
                                ? "text-muted-foreground/50"
                                : active
                                  ? "text-primary"
                                  : "text-foreground"
                            }`}
                          >
                            +{line}
                          </span>
                          {available ? (
                            <span
                              className={`text-[10px] font-mono ${
                                active
                                  ? "text-primary/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {odds.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground/40">
                              X
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Game Odds Types ───
interface GameOdds {
  home_tricode: string;
  away_tricode: string;
  tricode_odds: Record<string, number>;
  spread: {
    home: { point: number; odds: number };
    away: { point: number; odds: number };
  };
}

// ─── Game Odds Banner (Moneyline + Spread) ───
function GameOddsBanner({
  odds,
  awayTricode,
  homeTricode,
  awayColor,
  homeColor,
}: {
  odds: GameOdds | null;
  awayTricode: string;
  homeTricode: string;
  awayColor: string;
  homeColor: string;
}) {
  if (!odds) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 mb-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-secondary" />
          <div className="h-4 w-32 rounded bg-secondary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-lg bg-secondary" />
          <div className="h-20 rounded-lg bg-secondary" />
        </div>
      </div>
    );
  }

  const awayMoneyline = odds.tricode_odds[awayTricode] || 0;
  const homeMoneyline = odds.tricode_odds[homeTricode] || 0;
  const awayIsFav = awayMoneyline > 0 && awayMoneyline < homeMoneyline;
  const homeIsFav = homeMoneyline > 0 && homeMoneyline < awayMoneyline;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-5">
      {/* Header row */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TeamLogo tricode={awayTricode} size={22} />
            <span className="text-sm font-bold text-foreground">{awayTricode}</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">VS</span>
          <div className="flex items-center gap-2">
            <TeamLogo tricode={homeTricode} size={22} />
            <span className="text-sm font-bold text-foreground">{homeTricode}</span>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Cotes du match
        </span>
      </div>

      {/* Odds grid */}
      <div className="grid grid-cols-2 gap-px bg-border">
        {/* MONEYLINE */}
        <div className="bg-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Vainqueur (Moneyline)
            </span>
          </div>
          <div className="flex gap-2">
            {/* Away moneyline */}
            <div
              className={`flex-1 flex flex-col items-center gap-1 rounded-lg border py-3 px-2 transition-all ${
                awayIsFav
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border bg-secondary/20"
              }`}
            >
              <TeamLogo tricode={awayTricode} size={24} />
              <span className="text-xs font-bold text-foreground">{awayTricode}</span>
              <span
                className={`text-lg font-mono font-bold ${
                  awayIsFav ? "text-emerald-500" : "text-foreground"
                }`}
              >
                {awayMoneyline > 0 ? awayMoneyline.toFixed(2) : "--"}
              </span>
              {awayIsFav && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 rounded px-1.5 py-0.5">
                  Favori
                </span>
              )}
            </div>
            {/* Home moneyline */}
            <div
              className={`flex-1 flex flex-col items-center gap-1 rounded-lg border py-3 px-2 transition-all ${
                homeIsFav
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border bg-secondary/20"
              }`}
            >
              <TeamLogo tricode={homeTricode} size={24} />
              <span className="text-xs font-bold text-foreground">{homeTricode}</span>
              <span
                className={`text-lg font-mono font-bold ${
                  homeIsFav ? "text-emerald-500" : "text-foreground"
                }`}
              >
                {homeMoneyline > 0 ? homeMoneyline.toFixed(2) : "--"}
              </span>
              {homeIsFav && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 rounded px-1.5 py-0.5">
                  Favori
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SPREAD */}
        <div className="bg-card p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Spread (Handicap)
            </span>
          </div>
          <div className="flex gap-2">
            {/* Away spread */}
            <div className="flex-1 flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/20 py-3 px-2">
              <TeamLogo tricode={awayTricode} size={24} />
              <span className="text-xs font-bold text-foreground">{awayTricode}</span>
              <span
                className={`text-lg font-mono font-bold ${
                  odds.spread.away.point < 0 ? "text-emerald-500" : "text-rose-400"
                }`}
              >
                {odds.spread.away.point > 0 ? "+" : ""}
                {odds.spread.away.point}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {odds.spread.away.odds > 0 ? odds.spread.away.odds.toFixed(2) : "--"}
              </span>
            </div>
            {/* Home spread */}
            <div className="flex-1 flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/20 py-3 px-2">
              <TeamLogo tricode={homeTricode} size={24} />
              <span className="text-xs font-bold text-foreground">{homeTricode}</span>
              <span
                className={`text-lg font-mono font-bold ${
                  odds.spread.home.point < 0 ? "text-emerald-500" : "text-rose-400"
                }`}
              >
                {odds.spread.home.point > 0 ? "+" : ""}
                {odds.spread.home.point}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {odds.spread.home.odds > 0 ? odds.spread.home.odds.toFixed(2) : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Player Props Component ───
export function PlayerProps({
  awayPlayers,
  homePlayers,
  awayTricode,
  homeTricode,
  awayColor,
  homeColor,
}: {
  awayPlayers: NbaPlayerLocalStats[];
  homePlayers: NbaPlayerLocalStats[];
  awayTricode: string;
  homeTricode: string;
  awayColor: string;
  homeColor: string;
}) {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState("");
  const [activeTeam, setActiveTeam] = useState<"away" | "home">("away");
  const [gameOdds, setGameOdds] = useState<GameOdds | null>(null);

  // Fetch game odds (moneyline + spread) from the API
  useEffect(() => {
    fetch("/api/odds")
      .then((r) => r.json())
      .then((data) => {
        for (const g of data.games || []) {
          if (
            g.home_tricode === homeTricode &&
            g.away_tricode === awayTricode
          ) {
            setGameOdds(g);
            break;
          }
        }
      })
      .catch(() => {});
  }, [homeTricode, awayTricode]);

  // Top 8 players per team sorted by minutes
  const awayTop8 = useMemo(
    () => awayPlayers.filter((p) => p.MIN > 0).slice(0, 8),
    [awayPlayers]
  );
  const homeTop8 = useMemo(
    () => homePlayers.filter((p) => p.MIN > 0).slice(0, 8),
    [homePlayers]
  );

  function handleSelect(sel: BetSelection) {
    setSelections((prev) => {
      // If same player + same category exists, remove it first
      const filtered = prev.filter(
        (s) =>
          !(s.playerId === sel.playerId && s.category === sel.category)
      );
      // If the removed item was the exact same (toggle off), just return filtered
      const wasExact = prev.some(
        (s) =>
          s.playerId === sel.playerId &&
          s.category === sel.category &&
          s.line === sel.line
      );
      if (wasExact) return filtered;
      // Otherwise add the new selection
      return [...filtered, sel];
    });
  }

  function handleRemove(sel: BetSelection) {
    setSelections((prev) =>
      prev.filter(
        (s) =>
          !(s.playerId === sel.playerId && s.category === sel.category)
      )
    );
  }

  function handleClear() {
    setSelections([]);
    setStake("");
  }

  const currentPlayers = activeTeam === "away" ? awayTop8 : homeTop8;
  const currentTricode = activeTeam === "away" ? awayTricode : homeTricode;
  const currentColor = activeTeam === "away" ? awayColor : homeColor;

  return (
    <div className="flex gap-6 items-start">
      {/* Left: Player Props Grid */}
      <div className="flex-1 min-w-0">
        {/* Game Odds Banner (Moneyline + Spread) */}
        <GameOddsBanner
          odds={gameOdds}
          awayTricode={awayTricode}
          homeTricode={homeTricode}
          awayColor={awayColor}
          homeColor={homeColor}
        />

        {/* Team selector */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTeam("away")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
              activeTeam === "away"
                ? "bg-secondary text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TeamLogo tricode={awayTricode} size={20} />
            {awayTricode}
            <span className="text-[10px] text-muted-foreground font-mono">
              ({awayTop8.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTeam("home")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
              activeTeam === "home"
                ? "bg-secondary text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TeamLogo tricode={homeTricode} size={20} />
            {homeTricode}
            <span className="text-[10px] text-muted-foreground font-mono">
              ({homeTop8.length})
            </span>
          </button>
        </div>

        {/* Player cards */}
        <div className="flex flex-col gap-3">
          {currentPlayers.map((player) => (
            <PlayerPropCard
              key={player.PLAYER_ID}
              player={player}
              teamTricode={currentTricode}
              teamColor={currentColor}
              selections={selections}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Right: Bet Slip Sidebar (desktop only) */}
      <aside className="hidden lg:block w-[300px] shrink-0 sticky top-20">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Calculatrice de Pari
              </h3>
            </div>
            {selections.length > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                {selections.length}
              </span>
            )}
          </div>
          <BetSlipContent
            selections={selections}
            stake={stake}
            onStakeChange={setStake}
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </div>
      </aside>

      {/* Mobile: Floating bet slip button + Drawer */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="relative flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
            >
              <Calculator className="h-4 w-4" />
              Pari
              {selections.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[20px] rounded-full bg-foreground text-background text-[10px] font-bold px-1">
                  {selections.length}
                </span>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-primary" />
                Calculatrice de Pari
                {selections.length > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                    {selections.length}
                  </span>
                )}
              </DrawerTitle>
              <DrawerDescription>
                Selectionne des props puis entre ta mise
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">
              <BetSlipContent
                selections={selections}
                stake={stake}
                onStakeChange={setStake}
                onRemove={handleRemove}
                onClear={handleClear}
              />
            </div>
            <DrawerClose className="sr-only">Fermer</DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
