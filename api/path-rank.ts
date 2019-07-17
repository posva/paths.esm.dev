import pathToRegexp from 'path-to-regexp'

const isDefaultPathRegExpRE = /^\[\^[^\]]+\]\+\?$/

type RouteParams = Record<string, string | string[]>

export interface RouteMatcher {
  re: RegExp
  resolve: (params?: RouteParams) => string
  path: string
  parent: RouteMatcher | void
  // TODO: children so they can be removed
  // children: RouteMatcher[]
  keys: string[]
  score: number
}

enum PathScore {
  Segment = 4, // /a-segment
  SubSegment = 2, // /multiple-:things-in-one-:segment
  Static = 3, // /static
  Dynamic = 2, // /:someId
  DynamicCustomRegexp = 2.5, // /:someId(\\d+)
  Wildcard = -1, // /:namedWildcard(.*)
  SubWildcard = 1, // Wildcard as a subsegment
  Repeatable = -0.5, // /:w+ or /:w*
  Strict = 0.5, // when options strict: true is passed, as the regex omits \/?
  CaseSensitive = 0.25, // when options strict: true is passed, as the regex omits \/?
  Optional = -4, // /:w? or /:w*
  SubOptional = -0.1, // optional inside a subsegment /a-:w? or /a-:w*
  Root = 1, // just /
}

export function createRouteMatcher(
  path: string,
  parent: RouteMatcher | void,
  options: pathToRegexp.RegExpOptions
): RouteMatcher {
  const keys: pathToRegexp.Key[] = []
  // options only use `delimiter`
  const tokens = pathToRegexp.parse(path, options)
  const re = pathToRegexp.tokensToRegExp(tokens, keys, options)
  // we pass a copy because later on we are modifying the original token array
  // to compute the score of routes
  const resolve = pathToRegexp.tokensToFunction([...tokens])

  let score =
    (options.strict ? PathScore.Strict : 0) +
    (options.sensitive ? PathScore.CaseSensitive : 0)

  // console.log(tokens)
  // console.log('--- GROUPING ---')

  // special case for root path
  if (tokens.length === 1 && tokens[0] === '/') {
    score = 5
  } else {
    // allows us to group tokens into one single segment
    // it will point to the first token of the current group
    let currentSegment = 0
    // we group them in arrays to process them later
    const groups: Array<pathToRegexp.Token[]> = []
    // we skip the first element as it must be part of the first group
    const token = tokens[0]
    if (typeof token === 'string') {
      // TODO: refactor code in loop (right now it is duplicated)
      // we still need to check for / inside the string
      // remove the empty string because of the leading slash
      const sections = token.split('/').slice(1)
      if (sections.length > 1) {
        // the last one is going to replace currentSegment
        const last = sections.pop() as string // ts complains but length >= 2
        // we need to finalize previous group but we cannot use current entry
        // here we are sure that currentSegment < i because the token doesn't start with /
        // assert(currentSegment < i)
        const first = sections.shift() as string // ts complains but length >= 2
        // so we cut until the current segment and add the first section of current token as well
        groups.push(tokens.slice(currentSegment, 0).concat('/' + first))
        // equivalent to
        // groups.push(['/' + first])

        // we add the remaining sections as static groups
        for (const section of sections) {
          groups.push(['/' + section])
        }

        // we replace current entry with the last section and reset current segment
        tokens[0] = '/' + last
        // currentSegment = 0
      }
    }

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i]
      if (typeof token === 'string') {
        if (token.charAt(0) === '/') {
          // finalize previous group and start a new one
          groups.push(tokens.slice(currentSegment, i))
          currentSegment = i
        } else {
          // we still need to check for / inside the string
          const sections = token.split('/')
          if (sections.length > 1) {
            // the last one is going to replace currentSegment
            const last = sections.pop() as string // ts complains but length >= 2
            // we need to finalize previous group but we cannot use current entry
            // here we are sure that currentSegment < i because the token doesn't start with /
            // assert(currentSegment < i)
            const first = sections.shift() as string // ts complains but length >= 2
            // so we cut until the current segment and add the first section of current token as well
            groups.push(tokens.slice(currentSegment, i).concat(first))

            // we add the remaining sections as static groups
            for (const section of sections) {
              groups.push(['/' + section])
            }

            // we replace current entry with the last section and reset current segment
            tokens[i] = '/' + last
            currentSegment = i
          }
        }
      } else if (token.prefix.charAt(0) === '/') {
        // finalize previous group and start a new one
        groups.push(tokens.slice(currentSegment, i))
        currentSegment = i
      }
    }

    // add the remaining segment as one group
    // TODO: refactor the handling of ending with static like /:a/b/c
    if (currentSegment < tokens.length) {
      let token: pathToRegexp.Token
      if (
        tokens.length - currentSegment === 1 &&
        typeof (token = tokens[tokens.length - 1]) === 'string'
      ) {
        // the remaining group is a single string, so it must start with a leading /
        const sections = token.split('/').slice(1)
        // we add the remaining sections as static groups
        for (const section of sections) {
          groups.push(['/' + section])
        }
      } else {
        groups.push(tokens.slice(currentSegment))
      }
    }

    const scoreForSegment = function scoreForSegment(
      group: pathToRegexp.Token
    ): number {
      let score = PathScore.Segment
      if (typeof group === 'string') {
        score += group === '/' ? PathScore.Root : PathScore.Static
      } else {
        score +=
          group.pattern === '.*'
            ? PathScore.Wildcard
            : isDefaultPathRegExpRE.test(group.pattern)
            ? PathScore.Dynamic
            : PathScore.DynamicCustomRegexp
        score +=
          +group.optional * PathScore.Optional +
          +group.repeat * PathScore.Repeatable
        // if (typeof group.name === 'number') {
        //   throw new TypeError('Name your param')
        // }
        // keys.push(group.name)
      }
      return score
    }

    const scoreForSubSegment = function scoreForSubSegment(
      group: pathToRegexp.Token
    ): number {
      let score = 0
      if (typeof group === 'string') {
        // in a sub segment, it doesn't matter if it's root or not
        score += PathScore.Static
      } else {
        score +=
          group.pattern === '.*'
            ? PathScore.SubWildcard
            : isDefaultPathRegExpRE.test(group.pattern)
            ? PathScore.Dynamic
            : PathScore.DynamicCustomRegexp
        score += +group.optional * PathScore.SubOptional
        if (typeof group.name === 'number') {
          throw new TypeError('Name your param')
        }
        // keys.push(group.name)
      }
      return score
    }

    for (const group of groups) {
      // console.log(group)
      if (group.length === 1) {
        score += scoreForSegment(group[0])
      } else {
        score += PathScore.Segment + PathScore.SubSegment
        let multiplier = 1 / 10
        for (let i = 0; i < group.length; i++) {
          score += scoreForSubSegment(group[i]) * multiplier
          multiplier /= 10
        }
      }
      // segments.push('/' + section)
    }

    // console.log(record.path, { score })
    // console.log('____'.repeat(20))
  }

  // create the object before hand so it can be passed to children
  return {
    parent,
    path,
    re,
    // TODO: handle numbers differently. Maybe take the max one and say there are x unnamed keys
    keys: keys.map((key) => String(key.name)),
    resolve,
    score,
  }
}
