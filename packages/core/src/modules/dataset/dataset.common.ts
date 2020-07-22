export type InstanceId = string;

export interface Instance {
  id?: InstanceId;
  label: string;
  data: unknown;
  thumbnail?: string;
  features?: number[][];
}
