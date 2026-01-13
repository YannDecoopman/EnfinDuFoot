import type {
  Match,
  MatchOdds,
  BookmakerOdds,
  ProcessedOdds,
  BookmakerKey,
} from '../types/odds';
import { TARGET_BOOKMAKERS } from '../types/odds';

const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const SPORT_KEY = 'soccer_epl'; // English Premier League

/**
 * Fetches upcoming Premier League matches with odds from The Odds API
 */
export async function fetchPremierLeagueOdds(apiKey: string): Promise<Match[]> {
  const bookmakerKeys = Object.keys(TARGET_BOOKMAKERS).join(',');

  const url = new URL(`${API_BASE_URL}/sports/${SPORT_KEY}/odds`);
  url.searchParams.append('apiKey', apiKey);
  url.searchParams.append('regions', 'eu,uk');
  url.searchParams.append('markets', 'h2h'); // Head to head (1X2)
  url.searchParams.append('bookmakers', bookmakerKeys);
  url.searchParams.append('oddsFormat', 'decimal');

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Odds API key.');
    }
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: Match[] = await response.json();
  return data;
}

/**
 * Extracts odds from a match's bookmaker data
 */
function extractOdds(match: Match, bookmakerKey: string): ProcessedOdds {
  const bookmaker = match.bookmakers.find((b) => b.key === bookmakerKey);

  if (!bookmaker) {
    return { home: null, draw: null, away: null };
  }

  const h2hMarket = bookmaker.markets.find((m) => m.key === 'h2h');

  if (!h2hMarket) {
    return { home: null, draw: null, away: null };
  }

  const homeOutcome = h2hMarket.outcomes.find((o) => o.name === match.home_team);
  const awayOutcome = h2hMarket.outcomes.find((o) => o.name === match.away_team);
  const drawOutcome = h2hMarket.outcomes.find((o) => o.name === 'Draw');

  return {
    home: homeOutcome?.price ?? null,
    draw: drawOutcome?.price ?? null,
    away: awayOutcome?.price ?? null,
  };
}

/**
 * Finds the best odds across all bookmakers for each outcome
 */
function findBestOdds(bookmakerOdds: BookmakerOdds[]): MatchOdds['bestOdds'] {
  const best = {
    home: { value: null as number | null, bookmaker: '' },
    draw: { value: null as number | null, bookmaker: '' },
    away: { value: null as number | null, bookmaker: '' },
  };

  for (const bo of bookmakerOdds) {
    if (bo.odds.home !== null && (best.home.value === null || bo.odds.home > best.home.value)) {
      best.home = { value: bo.odds.home, bookmaker: bo.bookmaker };
    }
    if (bo.odds.draw !== null && (best.draw.value === null || bo.odds.draw > best.draw.value)) {
      best.draw = { value: bo.odds.draw, bookmaker: bo.bookmaker };
    }
    if (bo.odds.away !== null && (best.away.value === null || bo.odds.away > best.away.value)) {
      best.away = { value: bo.odds.away, bookmaker: bo.bookmaker };
    }
  }

  return best;
}

/**
 * Processes raw API data into a format suitable for display
 */
export function processMatchOdds(matches: Match[]): MatchOdds[] {
  return matches.map((match) => {
    const bookmakerOdds: BookmakerOdds[] = (Object.keys(TARGET_BOOKMAKERS) as BookmakerKey[]).map(
      (key) => ({
        bookmaker: TARGET_BOOKMAKERS[key],
        bookmakerKey: key,
        odds: extractOdds(match, key),
      })
    );

    return {
      id: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      commenceTime: match.commence_time,
      bookmakerOdds,
      bestOdds: findBestOdds(bookmakerOdds),
    };
  });
}
