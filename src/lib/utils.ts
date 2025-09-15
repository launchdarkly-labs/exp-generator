import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wait(seconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}
