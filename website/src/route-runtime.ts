let initialRoutePath = '/';

/** Sets the route path consumed by the app during SSR and hydration startup. */
export function setInitialRoutePath(path: string): void {
  initialRoutePath = path;
}

/** Reads the route path used before browser mount normalizes from location. */
export function readInitialRoutePath(): string {
  return initialRoutePath;
}
