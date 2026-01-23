/**
 * Type utility functions and advanced type patterns
 */

/**
 * Make specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Deep partial type - makes all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Nullable type - allows null for all properties
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * NonNullable fields - removes null and undefined from all properties
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys of T where value extends V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Extract function property names from T
 */
export type FunctionPropertyNames<T> = KeysOfType<T, Function>;

/**
 * Extract non-function property names from T
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Pick only function properties from T
 */
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

/**
 * Pick only non-function properties from T
 */
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

/**
 * Promisify - wraps return type in Promise
 * Note: Uses `unknown` for maximum flexibility with function types
 */
export type Promisify<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

/**
 * UnwrapPromise - extracts type from Promise
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * ValueOf - gets the union type of all values in an object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Mutable - removes readonly modifier
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * DeepMutable - removes readonly modifier recursively
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * Override - merges two types, with properties from U overriding those in T
 */
export type Override<T, U> = Omit<T, keyof U> & U;
