import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { View } from 'react-native';

interface ModalPortalProps {
  children?: React.ReactNode;
}

/**
 * 所有要在 portal 中注册的组件的基本类型
 */
export interface PortalBaseProps {
  /* 当前组件的 key */
  currentKey?: number;
  /* 当前组件在 portal 中的 type */
  portalType?: string;
}

const PortalRoot = forwardRef<any, ModalPortalProps>(function PortalRoot(
  { children },
  ref
) {
  const [modalChildren, setModalChildren] = useState<React.ReactNode>(children);

  useImperativeHandle(ref, () => ({
    setChildren: (newChildren: React.ReactNode) => {
      setModalChildren(newChildren);
    },
  }));

  return (
    <View
      style={{
        position: 'absolute',
        flex: 1,
      }}
      ref={ref}
    >
      {modalChildren}
    </View>
  );
});

export default PortalRoot;
