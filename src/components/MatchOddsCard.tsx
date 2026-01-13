import { useState, useEffect } from 'react';
import type { MatchOdds } from '../types/odds';

interface MatchOddsCardProps {
  match: MatchOdds;
  onClose: () => void;
  lastUpdate: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function MatchOddsCard({
  match,
  onClose,
  lastUpdate,
  isRefreshing,
  onRefresh,
}: MatchOddsCardProps) {
  const [prevOdds, setPrevOdds] = useState<Map<string, number>>(new Map());
  const [changedOdds, setChangedOdds] = useState<Set<string>>(new Set());

  // Détecter les changements de cotes
  useEffect(() => {
    const newChanges = new Set<string>();
    const newPrevOdds = new Map<string, number>();

    match.bookmakerOdds.forEach((bo) => {
      const homeKey = `${bo.bookmakerKey}-home`;
      const drawKey = `${bo.bookmakerKey}-draw`;
      const awayKey = `${bo.bookmakerKey}-away`;

      if (bo.odds.home !== null) {
        const prevHome = prevOdds.get(homeKey);
        if (prevHome !== undefined && prevHome !== bo.odds.home) {
          newChanges.add(homeKey);
        }
        newPrevOdds.set(homeKey, bo.odds.home);
      }

      if (bo.odds.draw !== null) {
        const prevDraw = prevOdds.get(drawKey);
        if (prevDraw !== undefined && prevDraw !== bo.odds.draw) {
          newChanges.add(drawKey);
        }
        newPrevOdds.set(drawKey, bo.odds.draw);
      }

      if (bo.odds.away !== null) {
        const prevAway = prevOdds.get(awayKey);
        if (prevAway !== undefined && prevAway !== bo.odds.away) {
          newChanges.add(awayKey);
        }
        newPrevOdds.set(awayKey, bo.odds.away);
      }
    });

    setPrevOdds(newPrevOdds);
    setChangedOdds(newChanges);

    // Effacer les highlights après 3 secondes
    if (newChanges.size > 0) {
      const timeout = setTimeout(() => {
        setChangedOdds(new Set());
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [match]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-purple-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {match.homeTeam} vs {match.awayTeam}
            </h2>
            <p className="text-purple-200 mt-1">{formatDate(match.commenceTime)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-600">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-purple-200">
              Live • Refresh auto 30s
            </span>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-purple-300">
                Màj: {formatTime(lastUpdate)}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? 'Chargement...' : 'Rafraîchir'}
            </button>
          </div>
        </div>
      </div>

      {/* Odds Table */}
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-gray-600 font-semibold">Bookmaker</th>
              <th className="text-center py-3 text-gray-600 font-semibold">1 (Dom)</th>
              <th className="text-center py-3 text-gray-600 font-semibold">X (Nul)</th>
              <th className="text-center py-3 text-gray-600 font-semibold">2 (Ext)</th>
            </tr>
          </thead>
          <tbody>
            {match.bookmakerOdds.map((bo) => (
              <tr key={bo.bookmakerKey} className="border-b border-gray-100">
                <td className="py-4 font-medium text-gray-900">{bo.bookmaker}</td>
                <td className="py-4 text-center">
                  <OddsValue
                    value={bo.odds.home}
                    isBest={bo.odds.home === match.bestOdds.home.value}
                    hasChanged={changedOdds.has(`${bo.bookmakerKey}-home`)}
                  />
                </td>
                <td className="py-4 text-center">
                  <OddsValue
                    value={bo.odds.draw}
                    isBest={bo.odds.draw === match.bestOdds.draw.value}
                    hasChanged={changedOdds.has(`${bo.bookmakerKey}-draw`)}
                  />
                </td>
                <td className="py-4 text-center">
                  <OddsValue
                    value={bo.odds.away}
                    isBest={bo.odds.away === match.bestOdds.away.value}
                    hasChanged={changedOdds.has(`${bo.bookmakerKey}-away`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Best Odds Summary */}
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h3 className="text-green-800 font-semibold mb-3">Meilleures cotes</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <BestOddsItem
              label="Victoire Dom"
              value={match.bestOdds.home.value}
              bookmaker={match.bestOdds.home.bookmaker}
            />
            <BestOddsItem
              label="Match Nul"
              value={match.bestOdds.draw.value}
              bookmaker={match.bestOdds.draw.bookmaker}
            />
            <BestOddsItem
              label="Victoire Ext"
              value={match.bestOdds.away.value}
              bookmaker={match.bestOdds.away.bookmaker}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OddsValue({
  value,
  isBest,
  hasChanged,
}: {
  value: number | null;
  isBest: boolean;
  hasChanged: boolean;
}) {
  if (value === null) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <span
      className={`font-mono text-lg transition-all duration-300 ${
        hasChanged
          ? 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded animate-pulse'
          : isBest
          ? 'text-green-600 font-bold'
          : 'text-gray-700'
      }`}
    >
      {value.toFixed(2)}
      {isBest && !hasChanged && <span className="ml-1 text-sm">★</span>}
    </span>
  );
}

function BestOddsItem({
  label,
  value,
  bookmaker,
}: {
  label: string;
  value: number | null;
  bookmaker: string;
}) {
  return (
    <div>
      <div className="text-sm text-green-700">{label}</div>
      <div className="text-2xl font-bold text-green-800">
        {value?.toFixed(2) ?? '-'}
      </div>
      <div className="text-xs text-green-600">{bookmaker}</div>
    </div>
  );
}
