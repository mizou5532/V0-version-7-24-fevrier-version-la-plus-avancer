"use client";

import Image from "next/image";
import { useState } from "react";

interface PlayerHeadshotProps {
  playerId: number;
  playerName: string;
  size?: number;
  teamColor?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlayerHeadshot({
  playerId,
  playerName,
  size = 40,
  teamColor,
}: PlayerHeadshotProps) {
  const [hasError, setHasError] = useState(false);

  const src = `https://cdn.nba.com/headshots/nba/latest/260x190/${playerId}.png`;

  if (hasError) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0 bg-secondary border border-border"
        style={{
          width: size,
          height: size,
          backgroundColor: teamColor ? teamColor + "20" : undefined,
        }}
      >
        <span
          className="font-bold font-mono"
          style={{
            fontSize: size * 0.32,
            color: teamColor || "hsl(var(--muted-foreground))",
          }}
        >
          {getInitials(playerName)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden shrink-0 bg-secondary border border-border"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={playerName}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
