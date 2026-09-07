import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { LoggerContext } from './types';

declare const __DEV__: boolean | undefined;

class ContextManager {
  private globalContext: LoggerContext;

  constructor() {
    this.globalContext = this.getInitialContext();
  }

  private getInitialContext(): LoggerContext {
    let platform = 'unknown';
    let appVersion = '1.0.0';
    let buildNumber = '1';

    try {
      if (Platform?.OS) {
        platform = Platform.OS;
      }
    } catch {
      // 降级保护
    }

    try {
      appVersion =
        Constants?.expoConfig?.version ??
        Constants?.manifest2?.extra?.expoClient?.version ??
        '1.0.0';
      buildNumber =
        platform === 'ios'
          ? (Constants?.expoConfig?.ios?.buildNumber ?? '1')
          : (Constants?.expoConfig?.android?.versionCode?.toString() ?? '1');
    } catch {
      // 降级保护
    }

    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    const environment = isDev ? 'development' : 'production';

    return {
      platform,
      appVersion,
      buildNumber,
      environment,
      isDev,
    };
  }

  public getGlobalContext(): LoggerContext {
    return { ...this.globalContext };
  }

  public setGlobalContext<K extends keyof LoggerContext>(
    key: K,
    value: LoggerContext[K]
  ): void {
    this.globalContext[key] = value;
  }

  public updateGlobalContext(partialContext: Partial<LoggerContext>): void {
    this.globalContext = {
      ...this.globalContext,
      ...partialContext,
    };
  }

  public clearGlobalContext(): void {
    this.globalContext = this.getInitialContext();
  }
}

export const contextManager = new ContextManager();

export const getGlobalContext = () => contextManager.getGlobalContext();
export const setGlobalContext = <K extends keyof LoggerContext>(
  key: K,
  value: LoggerContext[K]
) => contextManager.setGlobalContext(key, value);
export const updateGlobalContext = (partialContext: Partial<LoggerContext>) =>
  contextManager.updateGlobalContext(partialContext);
export const clearGlobalContext = () => contextManager.clearGlobalContext();
