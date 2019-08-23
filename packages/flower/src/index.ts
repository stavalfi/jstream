import { Flow, UnparsedFlowExtensions } from '@flower/types'
import baseParse, { Splitters, UserConfiguration } from '@jstream/parser'
import parseExtensions from '@flower/parser-extensions'

export const parse = (
  userConfiguration: UserConfiguration<UnparsedFlowExtensions>,
): {
  splitters: Splitters
  flows: Flow[]
} => baseParse(userConfiguration, parseExtensions)

export * from '@flower/types'
export * from '@flower/actions'
export * from '@flower/thunks'
export { default as reducer } from '@flower/reducer'
export { default as parseExtensions } from '@flower/parser-extensions'
