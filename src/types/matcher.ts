import { _RouteRecordBase, createRouterMatcher } from 'vue-router'

export interface PathToRank extends _RouteRecordBase {
  applyOptions: boolean
}

export type PathOptions = Parameters<typeof createRouterMatcher>[1]

export type RouteRecordMatcher = Exclude<
  ReturnType<ReturnType<typeof createRouterMatcher>['getRecordMatcher']>,
  undefined
>

export type RouteRecordMatcherError = Error & {
  record: RouteRecordMatcher['record']
}
