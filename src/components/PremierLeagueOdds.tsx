import { useState, useEffect } from 'react';
import type { MatchOdds, BookmakerKey } from '../types/odds';
import { TARGET_BOOKMAKERS } from '../types/odds';
import { fetchPremierLeagueOdds, processMatchOdds } from '../services/oddsApi';

interface PremierLeagueOddsProps {
  apiKey: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OddsCell({
  value,
  isBest,
  bestBookmaker,
}: {
  value: number | null;
  isBest: boolean;
  bestBookmaker?: string;
}) {
  if (value === null) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <span
      className={`font-mono ${isBest ? 'text-green-600 font-bold' : 'text-gray-700'}`}
      title={isBest ? `Best odds from ${bestBookmaker}` : undefined}
    >
      {value.toFixed(2)}
      {isBest && <span className="ml-1 text-xs">★</span>}
    </span>
  );
}

export function PremierLeagueOdds({ apiKey }: PremierLeagueOddsProps) {
  const [matches, setMatches] = useState<MatchOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOdds() {
      if (!apiKey) {
        setError('Please provide an API key');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const rawMatches = await fetchPremierLeagueOdds(apiKey);
        const processedMatches = processMatchOdds(rawMatches);
        setMatches(processedMatches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch odds');
      } finally {
        setLoading(false);
      }
    }

    loadOdds();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-4 text-gray-600">Loading Premier League odds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        No upcoming Premier League matches found.
      </div>
    );
  }

  const bookmakerKeys = Object.keys(TARGET_BOOKMAKERS) as BookmakerKey[];

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-purple-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold" rowSpan={2}>
              Match
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" rowSpan={2}>
              Date
            </th>
            {bookmakerKeys.map((key) => (
              <th
                key={key}
                className="px-2 py-2 text-center text-sm font-semibold border-l border-purple-600"
                colSpan={3}
              >
                {TARGET_BOOKMAKERS[key]}
              </th>
            ))}
            <th
              className="px-2 py-2 text-center text-sm font-semibold border-l border-purple-600 bg-green-700"
              colSpan={3}
            >
              Best Odds
            </th>
          </tr>
          <tr>
            {bookmakerKeys.map((key) => (
              <>
                <th
                  key={`${key}-1`}
                  className="px-2 py-1 text-center text-xs border-l border-purple-600"
                >
                  1
                </th>
                <th key={`${key}-x`} className="px-2 py-1 text-center text-xs">
                  X
                </th>
                <th key={`${key}-2`} className="px-2 py-1 text-center text-xs">
                  2
                </th>
              </>
            ))}
            <th className="px-2 py-1 text-center text-xs border-l border-purple-600 bg-green-700">
              1
            </th>
            <th className="px-2 py-1 text-center text-xs bg-green-700">X</th>
            <th className="px-2 py-1 text-center text-xs bg-green-700">2</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {matches.map((match) => (
            <tr key={match.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{match.homeTeam}</div>
                <div className="text-gray-500 text-sm">vs {match.awayTeam}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatDate(match.commenceTime)}
              </td>
              {match.bookmakerOdds.map((bo) => (
                <>
                  <td
                    key={`${match.id}-${bo.bookmakerKey}-home`}
                    className="px-2 py-3 text-center border-l border-gray-200"
                  >
                    <OddsCell
                      value={bo.odds.home}
                      isBest={
                        bo.odds.home !== null &&
                        bo.odds.home === match.bestOdds.home.value
                      }
                      bestBookmaker={bo.bookmaker}
                    />
                  </td>
                  <td
                    key={`${match.id}-${bo.bookmakerKey}-draw`}
                    className="px-2 py-3 text-center"
                  >
                    <OddsCell
                      value={bo.odds.draw}
                      isBest={
                        bo.odds.draw !== null &&
                        bo.odds.draw === match.bestOdds.draw.value
                      }
                      bestBookmaker={bo.bookmaker}
                    />
                  </td>
                  <td
                    key={`${match.id}-${bo.bookmakerKey}-away`}
                    className="px-2 py-3 text-center"
                  >
                    <OddsCell
                      value={bo.odds.away}
                      isBest={
                        bo.odds.away !== null &&
                        bo.odds.away === match.bestOdds.away.value
                      }
                      bestBookmaker={bo.bookmaker}
                    />
                  </td>
                </>
              ))}
              {/* Best Odds Column */}
              <td className="px-2 py-3 text-center border-l border-gray-200 bg-green-50">
                <div className="font-bold text-green-700">
                  {match.bestOdds.home.value?.toFixed(2) ?? '-'}
                </div>
                <div className="text-xs text-gray-500">{match.bestOdds.home.bookmaker}</div>
              </td>
              <td className="px-2 py-3 text-center bg-green-50">
                <div className="font-bold text-green-700">
                  {match.bestOdds.draw.value?.toFixed(2) ?? '-'}
                </div>
                <div className="text-xs text-gray-500">{match.bestOdds.draw.bookmaker}</div>
              </td>
              <td className="px-2 py-3 text-center bg-green-50">
                <div className="font-bold text-green-700">
                  {match.bestOdds.away.value?.toFixed(2) ?? '-'}
                </div>
                <div className="text-xs text-gray-500">{match.bestOdds.away.bookmaker}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <span className="text-green-600 font-bold">★</span> indicates the best available odds for
          each outcome
        </p>
        <p className="mt-1">
          1 = Home Win | X = Draw | 2 = Away Win
        </p>
      </div>
    </div>
  );
}
