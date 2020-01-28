import {
  tokensToParser,
  PathParser,
  PathParserOptions,
} from './path-parser-ranker'
import { tokenizePath } from './path-tokenizer'

export interface PathMatcher extends PathParser {
  path: string
  // TODO: children so they can be removed
  // children: RouteRecordMatcher[]
}

export function createPathMatcher(
  path: string,
  options?: PathParserOptions
): PathMatcher {
  const parser = tokensToParser(tokenizePath(path), options)

  return {
    ...parser,
    path,
  }
}
