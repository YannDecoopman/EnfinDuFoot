import type {
  Event,
  OddsResponse,
  MatchOdds,
  BookmakerOdds,
  ProcessedOdds,
  BookmakerKey,
} from '../types/odds';
import { TARGET_BOOKMAKERS } from '../types/odds';

const API_BASE_URL = 'https://api.odds-api.io/v3';
const PREMIER_LEAGUE_SLUG = 'premier-league';

/**
 * Fetches upcoming Premier League events from Odds-API.io
 */
export async function fetchPremierLeagueEvents(apiKey: string): Promise<Event[]> {
  const url = new URL(`${API_BASE_URL}/events`);
  url.searchParams.append('apiKey', apiKey);
  url.searchParams.append('sport', 'football');
  url.searchParams.append('league', PREMIER_LEAGUE_SLUG);
  url.searchParams.append('status', 'upcoming');

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Odds-API.io key.');
    }
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: Event[] = await response.json();
  return data;
}

/**
 * Fetches odds for multiple events using the /odds/multi endpoint
 */
export async function fetchOddsForEvents(
  apiKey: string,
  eventIds: string[]
): Promise<OddsResponse[]> {
  if (eventIds.length === 0) return [];

  // API supports max 10 events per call
  const batchSize = 10;
  const results: OddsResponse[] = [];
  const bookmakerKeys = Object.keys(TARGET_BOOKMAKERS).join(',');

  for (let i = 0; i < eventIds.length; i += batchSize) {
    const batch = eventIds.slice(i, i + batchSize);
    const url = new URL(`${API_BASE_URL}/odds/multi`);
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('eventIds', batch.join(','));
    url.searchParams.append('bookmakers', bookmakerKeys);

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Odds-API.io key.');
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OddsResponse[] = await response.json();
    results.push(...data);
  }

  return results;
}

/**
 * Fetches Premier League matches with odds
 */
export async function fetchPremierLeagueOdds(apiKey: string): Promise<OddsResponse[]> {
  const events = await fetchPremierLeagueEvents(apiKey);
  const eventIds = events.map((e) => e.id);
  return fetchOddsForEvents(apiKey, eventIds);
}

/**
 * Extracts odds from a match's bookmaker data
 */
function extractOdds(oddsResponse: OddsResponse, bookmakerKey: string): ProcessedOdds {
  const bookmaker = oddsResponse.bookmakers.find(
    (b) => b.bookmaker.toLowerCase() === bookmakerKey.toLowerCase()
  );

  if (!bookmaker) {
    return { home: null, draw: null, away: null };
  }

  // Find ML (moneyline/1X2) market
  const mlMarket = bookmaker.markets.find((m) => m.type === 'ML');

  if (!mlMarket) {
    return { home: null, draw: null, away: null };
  }

  const homeOutcome = mlMarket.outcomes.find(
    (o) => o.name.toLowerCase() === oddsResponse.home.toLowerCase() || o.name === '1'
  );
  const awayOutcome = mlMarket.outcomes.find(
    (o) => o.name.toLowerCase() === oddsResponse.away.toLowerCase() || o.name === '2'
  );
  const drawOutcome = mlMarket.outcomes.find(
    (o) => o.name.toLowerCase() === 'draw' || o.name === 'X'
  );

  return {
    home: homeOutcome?.odds ?? null,
    draw: drawOutcome?.odds ?? null,
    away: awayOutcome?.odds ?? null,
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
export function processMatchOdds(oddsResponses: OddsResponse[]): MatchOdds[] {
  return oddsResponses.map((oddsResponse) => {
    const bookmakerOdds: BookmakerOdds[] = (Object.keys(TARGET_BOOKMAKERS) as BookmakerKey[]).map(
      (key) => ({
        bookmaker: TARGET_BOOKMAKERS[key],
        bookmakerKey: key,
        odds: extractOdds(oddsResponse, key),
      })
    );

    return {
      id: oddsResponse.eventId,
      homeTeam: oddsResponse.home,
      awayTeam: oddsResponse.away,
      commenceTime: oddsResponse.startTime,
      bookmakerOdds,
      bestOdds: findBestOdds(bookmakerOdds),
    };
  });
}
