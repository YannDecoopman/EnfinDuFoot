// Types for The Odds API response
// API Documentation: https://the-odds-api.com/

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
}

export interface Match {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface OddsApiResponse {
  matches: Match[];
}

// Processed odds for display
export interface ProcessedOdds {
  home: number | null;
  draw: number | null;
  away: number | null;
}

export interface BookmakerOdds {
  bookmaker: string;
  bookmakerKey: string;
  odds: ProcessedOdds;
}

export interface MatchOdds {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakerOdds: BookmakerOdds[];
  bestOdds: {
    home: { value: number | null; bookmaker: string };
    draw: { value: number | null; bookmaker: string };
    away: { value: number | null; bookmaker: string };
  };
}

// Bookmakers we're interested in
export const TARGET_BOOKMAKERS = {
  bet365: 'Bet365',
  singbet: 'SingBet',
  unibet_eu: 'Unibet',
} as const;

export type BookmakerKey = keyof typeof TARGET_BOOKMAKERS;
