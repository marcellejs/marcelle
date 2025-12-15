import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function mkdirp(dir: string): void {
  try {
    fs.mkdirSync(dir, { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === 'EEXIST') return;
    throw e;
  }
}

export function rimraf(p: string): void {
  fs.rmdirSync(p);
}

function identity(x: string): string {
  return x;
}

export function copy(from: string, to: string, rename = identity): void {
  if (!fs.existsSync(from)) return;

  const stats = fs.statSync(from);

  if (stats.isDirectory()) {
    fs.readdirSync(from).forEach((file) => {
      copy(path.join(from, file), path.join(to, rename(file)));
    });
  } else {
    mkdirp(path.dirname(to));
    fs.copyFileSync(from, to);
  }
}

export function dist(p: string): string {
  return fileURLToPath(new URL(`./${p}`, import.meta.url).href);
}
