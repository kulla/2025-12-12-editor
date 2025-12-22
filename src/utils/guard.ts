export type Guard<T> = (value: unknown) => value is T

export const isString: Guard<string> = (value) => typeof value === 'string'

export const isBoolean: Guard<boolean> = (value) => typeof value === 'boolean'

export const isInstanceOf = <T>(
  ctor: new (...args: unknown[]) => T,
): Guard<T> => {
  return (value: unknown): value is T => value instanceof ctor
}

export const isUnion = <Options extends Guard<unknown>[]>(
  ...guards: Options
): Guard<Options[number] extends Guard<infer U> ? U : never> => {
  // biome-ignore lint/suspicious/noExplicitAny: Makes code simpler
  return (value: unknown): value is any => guards.some((guard) => guard(value))
}
