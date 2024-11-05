import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  ReactElement,
} from 'react';
import { View } from 'react-native';

import { keyGenerator } from '@/utils/autoKey';

interface ModalPortalProps {
  children?: React.ReactNode;
}

const Portal = forwardRef<any, ModalPortalProps>(({ children }, ref) => {
  const [modalChildren, setModalChildren] = useState<React.ReactNode>(children);

  useImperativeHandle(ref, () => ({
    setChildren: (newChildren: React.ReactNode) => {
      setModalChildren(newChildren);
    },
  }));

  return (
    <View style={{ flex: 1, position: 'absolute' }} ref={ref}>
      {modalChildren}
    </View>
  );
});

export default Portal;
