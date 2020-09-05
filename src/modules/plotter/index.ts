import { Plotter } from './plotter.module';
// import { Stream } from '../../core/stream';

// export function plotter(inputStreams: [Stream<number[]>], title: string): Plotter {
//   return new Plotter(inputStreams, title);
// }
export function plotter(title: string): Plotter {
  return new Plotter(title);
}

export type { Plotter };
