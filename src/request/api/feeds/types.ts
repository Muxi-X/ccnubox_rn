/**
 * Type definitions for feeds API
 */

/**
 * Feed allow list change request data
 */
export interface FeedAllowListData {
  allow: boolean;
  feedId?: string;
}

/**
 * Feed token save request data
 */
export interface FeedTokenData {
  token: string;
  deviceId?: string;
}
