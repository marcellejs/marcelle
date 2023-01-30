declare module '@ircam/devicemotion' {
  export function requestPermission(): Promise<'granted' | 'refused'>;
  export function addEventListener(callback: (e: DeviceMotionEvent) => void): void;
  export function removeEventListener(callback: (e: DeviceMotionEvent) => void): void;
}
