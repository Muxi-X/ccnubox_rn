import { ReactNode } from 'react';
export interface CustomBottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export interface CustomBottomSheetProps {
  children: ReactNode;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  showBackdrop?: boolean;
  enableScrollView?: boolean;
  scrollViewProps?: any;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
}
