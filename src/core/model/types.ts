export interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}

export interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}

export interface ClusteringResults {
  cluster: number;
  confidences: { [key: number]: number };
}
