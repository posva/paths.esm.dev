import { createPathMatcher, PathMatcher } from './path-matcher'
import {
  PathParams,
  comparePathParserScore,
  PathParserOptions,
} from './path-parser-ranker'

export interface MatcherLocationNormalized {
  path: string
  params: Record<string, string | string[]>
}

export interface RequiredPathParserOptions extends PathParserOptions {
  strict: boolean
  sensitive: boolean
}

export interface PathToRank {
  path: string
  options: RequiredPathParserOptions
  applyOptions: boolean
}

interface RouterMatcher {
  addRoute: (record: PathToRank, parent?: PathMatcher) => void
  // TODO: remove route
  // removeRoute: (path: string) => void
  match: (location: string) => MatcherLocationNormalized
  matchers: PathMatcher[]
}

const TRAILING_SLASH_RE = /(.)\/+$/
function removeTrailingSlash(path: string): string {
  return path.replace(TRAILING_SLASH_RE, '$1')
}

export function createRouterMatcher(
  routes: PathToRank[],
  globalOptions: PathParserOptions
): RouterMatcher {
  const matchers: PathMatcher[] = []

  function addRoute(record: PathToRank): void {
    const mainNormalizedRecord = { ...record }
    const options: PathParserOptions = {
      ...globalOptions,
      ...(record.applyOptions ? record.options : undefined),
    }
    // generate an array of records to correctly handle aliases
    const normalizedRecords: PathToRank[] = [mainNormalizedRecord]

    for (const normalizedRecord of normalizedRecords) {
      // create the object before hand so it can be passed to children
      const matcher = createPathMatcher(normalizedRecord.path, options)

      insertMatcher(matcher)
    }
  }

  function insertMatcher(matcher: PathMatcher) {
    let i = 0
    // console.log('i is', { i })
    while (
      i < matchers.length &&
      comparePathParserScore(matcher, matchers[i]) >= 0
    )
      i++
    // console.log('END i is', { i })
    // while (i < matchers.length && matcher.score <= matchers[i].score) i++
    matchers.splice(i, 0, matcher)
  }

  /**
   * Resolves a location. Gives access to the route record that corresponds to the actual path as well as filling the corresponding params objects
   * @param location MatcherLocation to resolve to a url
   * @param currentLocation MatcherLocationNormalized of the current location
   */
  function match(location: string): MatcherLocationNormalized {
    let matcher: PathMatcher | void
    let params: PathParams = {}

    matcher = matchers.find((m) => m.re.test(location))
    // matcher should have a value after the loop

    // TODO: if no matcher, return the location with an empty matched array
    // to allow non existent matches
    // TODO: warning of unused params if provided
    if (!matcher) throw new Error('not found')

    params = matcher.parse(location)!
    // no need to resolve the path with the matcher as it was provided
    // this also allows the user to control the encoding

    return {
      path: location,
      params,
    }
  }

  for (const route of routes) addRoute(route)

  return { addRoute, match, matchers }
}
