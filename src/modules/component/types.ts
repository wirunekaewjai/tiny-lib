export type Component<T = HTMLElement> = {
  name: string;
  mount: (element: T, signal: AbortSignal) => (Promise<void | Function>) | void | Function;
};
