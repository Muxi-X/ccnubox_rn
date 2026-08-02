import { create } from 'zustand';

export type SensitivePermissionPurpose = {
  description: string;
  id: string;
  title: string;
};

type SensitivePermissionNotice = SensitivePermissionPurpose & {
  requestId: number;
  resolve: (confirmed: boolean) => void;
  status: 'awaiting-confirmation' | 'requesting';
};

type SensitivePermissionState = {
  notice: SensitivePermissionNotice | null;
  cancelNotice: (requestId: number) => void;
  confirmNotice: (requestId: number) => void;
  hideNotice: (requestId: number) => void;
  showNotice: (
    requestId: number,
    purpose: SensitivePermissionPurpose
  ) => Promise<boolean>;
};

const useSensitivePermissionStore = create<SensitivePermissionState>(
  (set, get) => ({
    notice: null,
    showNotice: (requestId, purpose) =>
      new Promise<boolean>(resolve => {
        const previousNotice = get().notice;
        if (previousNotice?.status === 'awaiting-confirmation') {
          previousNotice.resolve(false);
        }
        set({
          notice: {
            ...purpose,
            requestId,
            resolve,
            status: 'awaiting-confirmation',
          },
        });
      }),
    confirmNotice: requestId => {
      const notice = get().notice;
      if (
        notice?.requestId !== requestId ||
        notice.status !== 'awaiting-confirmation'
      ) {
        return;
      }
      set({ notice: { ...notice, status: 'requesting' } });
      notice.resolve(true);
    },
    cancelNotice: requestId => {
      const notice = get().notice;
      if (
        notice?.requestId !== requestId ||
        notice.status !== 'awaiting-confirmation'
      ) {
        return;
      }
      set({ notice: null });
      notice.resolve(false);
    },
    hideNotice: requestId => {
      const notice = get().notice;
      if (notice?.requestId !== requestId) return;
      set({ notice: null });
      if (notice.status === 'awaiting-confirmation') {
        notice.resolve(false);
      }
    },
  })
);

export default useSensitivePermissionStore;
