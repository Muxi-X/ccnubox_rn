import React, { memo } from 'react';

import Divider from '@/components/divider';

import { commonColors } from '@/styles/common';

export const StickyBottom = memo(function StickyBottom() {
  return (
    <Divider
      style={{
        flexShrink: 0,
        width: '100%',
      }}
      color={commonColors.gray}
    >
      别闹，学霸也是要睡觉的
    </Divider>
  );
});
