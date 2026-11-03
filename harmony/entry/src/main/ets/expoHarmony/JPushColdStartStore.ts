import common from '@ohos.app.ability.common';

const CLICK_EVENT_PREFIX = 'onClickMessage:';

let installed = false;
let pendingNotificationOpened: string | null = null;

export function installJPushColdStartCapture(
  applicationContext: common.ApplicationContext
): void {
  if (installed) {
    return;
  }

  applicationContext.eventHub.on('jPush_event', (event: string) => {
    if (!event.startsWith(CLICK_EVENT_PREFIX)) {
      return;
    }

    const payload = event.slice(CLICK_EVENT_PREFIX.length);
    try {
      JSON.parse(payload);
      pendingNotificationOpened = payload;
    } catch {
      pendingNotificationOpened = null;
    }
  });
  installed = true;
}

export function consumeInitialJPushOpened(): string | null {
  const payload = pendingNotificationOpened;
  pendingNotificationOpened = null;
  return payload;
}
