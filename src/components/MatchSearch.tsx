import { useState, useEffect, useRef } from 'react';
import type { MatchOdds } from '../types/odds';

interface MatchSearchProps {
  matches: MatchOdds[];
  onSelect: (match: MatchOdds) => void;
  isLoading: boolean;
}

export function MatchSearch({ matches, onSelect, isLoading }: MatchSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredMatches = matches.filter((match) => {
    const searchTerm = query.toLowerCase();
    return (
      match.homeTeam.toLowerCase().includes(searchTerm) ||
      match.awayTeam.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleSelect = (match: MatchOdds) => {
    setQuery(`${match.homeTeam} vs ${match.awayTeam}`);
    setIsOpen(false);
    onSelect(match);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredMatches.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredMatches[highlightedIndex]) {
          handleSelect(filteredMatches[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher une équipe..."
          className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          disabled={isLoading}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {isOpen && query.length > 0 && filteredMatches.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredMatches.map((match, index) => (
            <li
              key={match.id}
              onClick={() => handleSelect(match)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex ? 'bg-purple-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900">{match.homeTeam}</span>
                  <span className="text-gray-500 mx-2">vs</span>
                  <span className="font-semibold text-gray-900">{match.awayTeam}</span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(match.commenceTime)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length > 0 && filteredMatches.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Aucun match trouvé
        </div>
      )}
    </div>
  );
}
