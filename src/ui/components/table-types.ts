export interface Column {
  name: string;
  type?: 'image' | 'date' | 'link' | 'slot' | 'array' | 'generic';
  sortable?: boolean;
}
