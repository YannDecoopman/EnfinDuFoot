import { useState } from 'react';
import { PremierLeagueOdds } from './components/PremierLeagueOdds';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [submittedKey, setSubmittedKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedKey(apiKey);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Premier League Odds Comparison</h1>
          <p className="mt-2 text-purple-200">
            Compare odds from Bet365, SingBet, and Unibet
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* API Key Form */}
        {!submittedKey && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Enter Your API Key
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Get your API key from{' '}
              <a
                href="https://odds-api.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Odds-API.io
              </a>
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={!apiKey.trim()}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Load Odds
              </button>
            </form>
          </div>
        )}

        {/* Odds Table */}
        {submittedKey && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Upcoming Matches
              </h2>
              <button
                onClick={() => {
                  setSubmittedKey('');
                  setApiKey('');
                }}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Change API Key
              </button>
            </div>
            <PremierLeagueOdds apiKey={submittedKey} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Data provided by Odds-API.io</p>
          <p className="mt-1">
            Bookmakers: Bet365, SingBet, Unibet
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
