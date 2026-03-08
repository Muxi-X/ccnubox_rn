export interface SheetItem {
  record_id: string;
  fields: {
    title: string;
    description: string;
    solution: string;
    resolvedStatus: 'resolved' | 'unresolved' | 'notSelected';
  };
}
