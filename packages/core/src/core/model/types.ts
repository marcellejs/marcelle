export interface ClassifierResults {
  label: string;
  confidences: Record<string, number>;
}

export interface ObjectDetectorResults {
  outputs: Array<{
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }>;
}

export interface ClusteringResults {
  cluster: number;
  confidences: Record<number, number>;
}
