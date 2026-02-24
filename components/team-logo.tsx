"use client";

import { useState } from "react";
import { NBA_TEAM_COLORS } from "@/lib/nba-types";

export function TeamLogo({
  tricode,
  size = 40,
}: {
  tricode: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const colors = NBA_TEAM_COLORS[tricode] || { primary: "#555", secondary: "#888" };

  if (imgError) {
    return (
      <div
        className="flex items-center justify-center rounded-lg font-mono font-bold text-foreground shrink-0"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.3,
          background: `linear-gradient(135deg, ${colors.primary}33, ${colors.secondary}33)`,
          border: `1px solid ${colors.primary}44`,
        }}
      >
        {tricode}
      </div>
    );
  }

  return (
    <img
      src={`https://cdn.nba.com/logos/nba/${getTeamId(tricode)}/global/L/logo.svg`}
      alt={`${tricode} logo`}
      width={size}
      height={size}
      className="shrink-0 object-contain"
      onError={() => setImgError(true)}
    />
  );
}

export function getTeamId(tricode: string): number {
  const ids: Record<string, number> = {
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
  return ids[tricode] || 0;
}
