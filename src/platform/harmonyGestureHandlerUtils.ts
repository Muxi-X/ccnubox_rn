import React from 'react';

export function toArray<T>(object: T | T[]) {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export type WithPrevAndCurrentMapFn<T, Transformed> = (
  previous: Transformed | null,
  current: T
) => Transformed;

export function withPrevAndCurrent<T, Transformed>(
  array: T[],
  mapFn: WithPrevAndCurrentMapFn<T, Transformed>
) {
  const previousArr: (Transformed | null)[] = [null];
  const transformedArr: Transformed[] = [];

  array.forEach((current, index) => {
    const previous = previousArr[index] ?? null;
    const transformed = mapFn(previous, current);
    previousArr.push(transformed);
    transformedArr.push(transformed);
  });

  return transformedArr;
}

export function hasProperty(object: object, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function isTestEnv() {
  return (
    hasProperty(globalThis, 'process') &&
    (globalThis as any).process?.env?.NODE_ENV === 'test'
  );
}

export const isJestEnv = isTestEnv;

export function tagMessage(message: string) {
  return `[react-native-gesture-handler] ${message}`;
}

export function isFabric() {
  return Boolean((globalThis as any).nativeFabricUIManager);
}

export function isReact19() {
  return React.version.startsWith('19.');
}

export function isRemoteDebuggingEnabled() {
  const localGlobal = globalThis as any;
  return (
    (!localGlobal.nativeCallSyncHook || Boolean(localGlobal.__REMOTEDEV__)) &&
    !localGlobal.RN$Bridgeless
  );
}

export function deepEqual(first: unknown, second: unknown): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    typeof first !== 'object' ||
    first === null ||
    typeof second !== 'object' ||
    second === null
  ) {
    return false;
  }

  const firstEntries = Object.entries(first);
  const secondEntries = Object.entries(second);

  if (firstEntries.length !== secondEntries.length) {
    return false;
  }

  return firstEntries.every(([key, value]) =>
    deepEqual(value, (second as Record<string, unknown>)[key])
  );
}
