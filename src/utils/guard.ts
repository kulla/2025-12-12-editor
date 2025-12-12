export type Guard<T> = (value: unknown) => value is T

export const string: Guard<string> = (value) => typeof value === 'string'

export const boolean: Guard<boolean> = (value) => typeof value === 'boolean'

export const union = <Options extends Guard<unknown>[]>(
  ...guards: Options
): Guard<Options[number] extends Guard<infer U> ? U : never> => {
  // biome-ignore lint/suspicious/noExplicitAny: Makes code simpler
  return (value: unknown): value is any => guards.some((guard) => guard(value))
}
