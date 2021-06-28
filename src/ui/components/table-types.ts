export interface Column {
  name: string;
  type?: 'image' | 'action' | 'date' | 'link' | 'slot' | 'array' | 'generic';
  sortable?: boolean;
}

export interface Action {
  name: string;
  multiple?: boolean;
  confirm?: boolean;
}
