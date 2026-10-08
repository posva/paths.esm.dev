import { _RouteRecordBase, createRouterMatcher } from 'vue-router'

export interface PathToRank extends _RouteRecordBase {
  applyOptions: boolean
}

export type PathOptions = Parameters<typeof createRouterMatcher>[1]

export type ClassicRouteRecordMatcher = Exclude<
  ReturnType<ReturnType<typeof createRouterMatcher>['getRecordMatcher']>,
  undefined
>

export type RouteRecordMatcher = Pick<
  ClassicRouteRecordMatcher,
  're' | 'score'
> & { record: { path: string }; parse(path: string): unknown }

export type RouteRecordMatcherError = Error & {
  record: RouteRecordMatcher['record']
}
