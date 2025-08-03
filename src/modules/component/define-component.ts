import type { Component } from "./types";

export const defineComponent = <T = HTMLElement>(name: string, mount: Component<T>["mount"]): Component<T> => {
  return { name, mount };
};
