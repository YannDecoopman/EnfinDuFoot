// Types for Odds-API.io response
// API Documentation: https://docs.odds-api.io/

// Event from /events endpoint
export interface Event {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  startTime: string;
  status: string;
}

// Odds response structure
export interface OddsOutcome {
  name: string;
  odds: number;
  link?: string;
}

export interface OddsMarket {
  type: string; // "ML" for moneyline (1X2)
  outcomes: OddsOutcome[];
}

export interface BookmakerOddsResponse {
  bookmaker: string;
  markets: OddsMarket[];
  updatedAt: string;
}

export interface OddsResponse {
  eventId: string;
  home: string;
  away: string;
  startTime: string;
  bookmakers: BookmakerOddsResponse[];
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
  unibet: 'Unibet',
} as const;

export type BookmakerKey = keyof typeof TARGET_BOOKMAKERS;
