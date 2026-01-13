import { useState, useEffect, useCallback } from 'react';
import type { MatchOdds } from './types/odds';
import { fetchPremierLeagueOdds, processMatchOdds } from './services/oddsApi';
import { MatchSearch } from './components/MatchSearch';
import { MatchOddsCard } from './components/MatchOddsCard';

const ENV_API_KEY = import.meta.env.VITE_ODDS_API_KEY || '';
const REFRESH_INTERVAL = 30000; // 30 secondes

function App() {
  const [apiKey, setApiKey] = useState(ENV_API_KEY);
  const [isKeySubmitted, setIsKeySubmitted] = useState(!!ENV_API_KEY);
  const [matches, setMatches] = useState<MatchOdds[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchOdds | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMatches = useCallback(async (isInitial = false) => {
    if (!apiKey) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const rawMatches = await fetchPremierLeagueOdds(apiKey);
      const processedMatches = processMatchOdds(rawMatches);
      setMatches(processedMatches);
      setLastUpdate(new Date());

      // Mettre à jour le match sélectionné avec les nouvelles cotes
      if (selectedMatch) {
        const updatedMatch = processedMatches.find((m) => m.id === selectedMatch.id);
        if (updatedMatch) {
          setSelectedMatch(updatedMatch);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [apiKey, selectedMatch]);

  // Chargement initial
  useEffect(() => {
    if (!isKeySubmitted || !apiKey) return;
    loadMatches(true);
  }, [apiKey, isKeySubmitted]);

  // Auto-refresh quand un match est sélectionné
  useEffect(() => {
    if (!selectedMatch || !isKeySubmitted) return;

    const interval = setInterval(() => {
      loadMatches(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedMatch, isKeySubmitted, loadMatches]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsKeySubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Premier League Odds
          </h1>
          <p className="text-purple-200">
            Comparez les cotes Bet365, SingBet et Unibet
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* API Key Form */}
        {!isKeySubmitted && (
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Clé API requise
            </h2>
            <p className="text-purple-200 text-sm mb-4">
              Obtenez votre clé sur{' '}
              <a
                href="https://odds-api.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-white underline"
              >
                Odds-API.io
              </a>
            </p>
            <form onSubmit={handleKeySubmit}>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Entrez votre clé API"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Continuer
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-xl mx-auto bg-red-500/20 border border-red-400 rounded-lg p-4 mb-8 text-center text-red-200">
            {error}
          </div>
        )}

        {/* Search */}
        {isKeySubmitted && !selectedMatch && (
          <div className="mb-8">
            <MatchSearch
              matches={matches}
              onSelect={setSelectedMatch}
              isLoading={loading}
            />
            {!loading && matches.length > 0 && (
              <p className="text-center text-purple-300 mt-4">
                {matches.length} matchs disponibles
              </p>
            )}
          </div>
        )}

        {/* Selected Match Odds */}
        {selectedMatch && (
          <div className="animate-fade-in">
            <MatchOddsCard
              match={selectedMatch}
              onClose={() => setSelectedMatch(null)}
              lastUpdate={lastUpdate}
              isRefreshing={isRefreshing}
              onRefresh={() => loadMatches(false)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-purple-300">
          <p>Données fournies par Odds-API.io</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
