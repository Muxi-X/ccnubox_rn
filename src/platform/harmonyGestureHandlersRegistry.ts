import { isTestEnv } from './harmonyGestureHandlerUtils';

export const handlerIDToTag: Record<string, number> = {};

const gestures = new Map<number, unknown>();
const oldHandlers = new Map<number, GestureHandlerCallbacks>();
const testIDs = new Map<string, number>();
let handlerTag = 1;

export function getNextHandlerTag() {
  return handlerTag++;
}

export function registerHandler(
  handlerTag: number,
  handler: unknown,
  testID?: string
) {
  gestures.set(handlerTag, handler);
  if (isTestEnv() && testID) {
    testIDs.set(testID, handlerTag);
  }
}

export function registerOldGestureHandler(
  handlerTag: number,
  handler: GestureHandlerCallbacks
) {
  oldHandlers.set(handlerTag, handler);
}

export function unregisterOldGestureHandler(handlerTag: number) {
  oldHandlers.delete(handlerTag);
}

export function unregisterHandler(handlerTag: number, testID?: string) {
  gestures.delete(handlerTag);
  if (isTestEnv() && testID) {
    testIDs.delete(testID);
  }
}

export function findHandler(handlerTag: number) {
  return gestures.get(handlerTag);
}

export function findOldGestureHandler(handlerTag: number) {
  return oldHandlers.get(handlerTag);
}

export function findHandlerByTestID(testID: string) {
  const handlerTag = testIDs.get(testID);
  if (handlerTag !== undefined) {
    return findHandler(handlerTag) ?? null;
  }
  return null;
}

export interface GestureHandlerCallbacks {
  onGestureEvent: (event: unknown) => void;
  onGestureStateChange: (event: unknown) => void;
}
