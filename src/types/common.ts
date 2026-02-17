/**
 * Common type definitions used across the application
 */

import { GestureResponderEvent } from 'react-native';

/**
 * Generic callback function type
 */
export type Callback<T extends unknown[] = []> = (...args: T) => void;

/**
 * Async callback function type
 */
export type AsyncCallback<T extends unknown[] = [], R = void> = (
  ...args: T
) => Promise<R>;

/**
 * Generic value change handler
 */
export type ValueChangeHandler<T = string> = (value: T) => void;

/**
 * Generic form field value type
 */
export type FormFieldValue = string | number | boolean | null | undefined;

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  code: number;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination response metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Common event handler types
 */
export type PressHandler = (event: GestureResponderEvent) => void;
export type AsyncPressHandler = (event: GestureResponderEvent) => Promise<void>;

/**
 * Common picker/selector types
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
}

/**
 * Generic error type
 */
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

