import * as React from 'react';
import { Platform, findNodeHandle as findNodeHandleRN } from 'react-native';

import { handlerIDToTag } from './harmonyGestureHandlersRegistry';
import { toArray } from './harmonyGestureHandlerUtils';

export type GestureEventPayload = {
  handlerTag: number;
  numberOfPointers: number;
  pointerType?: unknown;
  state: number;
};

export type HandlerStateChangeEventPayload = GestureEventPayload & {
  oldState: number;
};

export type GestureEvent<ExtraEventPayloadT = Record<string, unknown>> = {
  nativeEvent: Readonly<GestureEventPayload & ExtraEventPayloadT>;
};

export type HandlerStateChangeEvent<
  ExtraEventPayloadT = Record<string, unknown>,
> = {
  nativeEvent: Readonly<HandlerStateChangeEventPayload & ExtraEventPayloadT>;
};

export type BaseGestureHandlerProps<T extends Record<string, unknown>> = T & {
  id?: string;
  enabled?: boolean;
  shouldCancelWhenOutside?: boolean;
  hitSlop?: unknown;
  waitFor?: unknown;
  simultaneousHandlers?: unknown;
  blocksHandlers?: unknown;
  onBegan?: (event: HandlerStateChangeEvent<T>) => void;
  onFailed?: (event: HandlerStateChangeEvent<T>) => void;
  onCancelled?: (event: HandlerStateChangeEvent<T>) => void;
  onActivated?: (event: HandlerStateChangeEvent<T>) => void;
  onEnded?: (event: HandlerStateChangeEvent<T>) => void;
  onGestureEvent?: (event: GestureEvent<T>) => void;
  onHandlerStateChange?: (event: HandlerStateChangeEvent<T>) => void;
};

const isConfigParam = (param: unknown, name: string) =>
  param !== undefined &&
  (param !== Object(param) ||
    !('__isNative' in (param as Record<string, unknown>))) &&
  name !== 'onHandlerStateChange' &&
  name !== 'onGestureEvent';

const transformIntoHandlerTags = (handlerIDs: unknown) => {
  const handlers = toArray(handlerIDs);

  if (Platform.OS === 'web') {
    return handlers
      .map(handler => (handler as { current?: unknown })?.current)
      .filter(Boolean);
  }

  return handlers
    .map(handler => {
      if (typeof handler === 'string') {
        return handlerIDToTag[handler] ?? -1;
      }

      return (
        (handler as { current?: { handlerTag?: number } })?.current
          ?.handlerTag ?? -1
      );
    })
    .filter(handlerTag => handlerTag > 0);
};

export function filterConfig(
  props: Record<string, unknown>,
  validProps: string[],
  defaults: Record<string, unknown> = {}
) {
  const filteredConfig = { ...defaults };

  for (const key of validProps) {
    let value = props[key];
    if (isConfigParam(value, key)) {
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
        value = transformIntoHandlerTags(value);
      } else if (key === 'hitSlop' && typeof value !== 'object') {
        value = { top: value, left: value, bottom: value, right: value };
      }
      filteredConfig[key] = value;
    }
  }

  return filteredConfig;
}

export function findNodeHandle(
  node: null | number | React.Component<any, any> | React.ComponentClass<any>
) {
  if (Platform.OS === 'web') {
    return node;
  }

  return findNodeHandleRN(node);
}

export function scheduleFlushOperations() {}
