import { ReactElement } from 'react';

export type GridDataType = Record<string, any> & { key: string };
export interface DraggableGridProps {
  loading?: boolean;
  data: GridDataType[];
  renderItem: (item: GridDataType) => ReactElement;
}
