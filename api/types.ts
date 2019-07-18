import pathToRegexp from 'path-to-regexp'

// ensure options are present
export interface RequiredPathOptions extends pathToRegexp.RegExpOptions {
  strict: boolean
  sensitive: boolean
}

export interface PathToRank {
  path: string
  options: RequiredPathOptions
  applyOptions: boolean
}
