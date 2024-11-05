import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { View } from 'react-native';

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
