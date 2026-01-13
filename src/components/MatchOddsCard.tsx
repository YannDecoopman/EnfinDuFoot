import type { MatchOdds } from '../types/odds';

interface MatchOddsCardProps {
  match: MatchOdds;
  onClose: () => void;
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

export function MatchOddsCard({ match, onClose }: MatchOddsCardProps) {
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
                  />
                </td>
                <td className="py-4 text-center">
                  <OddsValue
                    value={bo.odds.draw}
                    isBest={bo.odds.draw === match.bestOdds.draw.value}
                  />
                </td>
                <td className="py-4 text-center">
                  <OddsValue
                    value={bo.odds.away}
                    isBest={bo.odds.away === match.bestOdds.away.value}
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

function OddsValue({ value, isBest }: { value: number | null; isBest: boolean }) {
  if (value === null) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <span
      className={`font-mono text-lg ${
        isBest ? 'text-green-600 font-bold' : 'text-gray-700'
      }`}
    >
      {value.toFixed(2)}
      {isBest && <span className="ml-1 text-sm">★</span>}
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
