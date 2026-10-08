import { createTreeNodeValue } from 'vue-router/unplugin'
import { MatcherPatternPathDynamic } from 'vue-router/experimental'
import type {
  PathOptions,
  PathToRank,
  RouteRecordMatcher,
  RouteRecordMatcherError,
} from '../types/matcher'

export function createExperimentalMatcher(
  record: PathToRank,
  options: PathOptions
) {
  const values = record.path
    .slice(1)
    .split('/')
    .map((segment) => {
      const value = createTreeNodeValue(segment, undefined, { format: 'path' })
      // The raw path parser adds an empty prefix before each parameter.
      if (value.isParam()) value.subSegments = value.subSegments.filter(Boolean)
      return value
    })
  let source = ''
  let onlyOptionalParams = true
  for (const [i, value] of values.entries()) {
    if (value.isParam()) {
      const segment = value.subSegments[0]
      const optional =
        value.subSegments.length === 1 &&
        typeof segment === 'object' &&
        !segment.isSplat &&
        segment.optional
      onlyOptionalParams &&= optional
      source +=
        (source || i < values.length - 1) && optional
          ? `(?:\\/${value.re.slice(0, -1)})?`
          : (source ? '\\/' : '') + value.re
    } else if (value.pathSegment) {
      onlyOptionalParams = false
      source +=
        (source ? '\\/' : '') +
        value.pathSegment.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
    }
  }
  source = (source.startsWith('(?:\\/') ? '' : '\\/') + source
  if (onlyOptionalParams && source.startsWith('(?:\\/')) source += '\\/?'

  const strict = record.strict ?? options.strict
  const sensitive = record.sensitive ?? options.sensitive
  const re = new RegExp(
    `^${source}${strict ? '' : '\\/?'}$`,
    sensitive ? '' : 'i'
  )
  const params = Object.fromEntries(
    values.flatMap((value) =>
      value.pathParams.map((param) => [
        param.paramName,
        [undefined, param.repeatable, param.optional] as [
          undefined,
          boolean,
          boolean,
        ],
      ])
    )
  )
  const pattern = new MatcherPatternPathDynamic(re, params, [], null)
  return {
    record,
    re,
    score: values.map((value) => value.score),
    parse: (path: string) => pattern.match(path),
  }
}

export function compareExperimentalMatchers(
  a: RouteRecordMatcher | RouteRecordMatcherError,
  b: RouteRecordMatcher | RouteRecordMatcherError
) {
  if (a instanceof Error) return b instanceof Error ? 0 : -1
  if (b instanceof Error) return 1
  for (let i = 0; i < Math.min(a.score.length, b.score.length); i++) {
    const left = a.score[i]
    const right = b.score[i]
    for (let j = 0; j < Math.min(left.length, right.length); j++) {
      const difference = right[j] - left[j]
      if (difference) return difference
    }
    if (left.length < right.length)
      return left.length === 1 && left[0] === 300 ? -1 : 1
    if (left.length > right.length)
      return right.length === 1 && right[0] === 300 ? 1 : -1
  }
  if (Math.abs(a.score.length - b.score.length) === 1) {
    if (a.score.at(-1)?.at(-1)! < 0) return 1
    if (b.score.at(-1)?.at(-1)! < 0) return -1
  }
  return b.score.length - a.score.length
}
