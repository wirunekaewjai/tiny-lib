import type { Component } from "./types";

export const observeComponents = (root: HTMLElement, ...components: Component<any>[]) => {
  const registry = new Map<string, Component<any>["mount"]>();

  for (const component of components) {
    registry.set(component.name, component.mount);
  }

  const attr = "x-is";
  const mounteds = new Map<string, Set<Element>>();
  const unmounts = new Map<Element, Function>();

  const getNames = (element: Element) => {
    return new Set(element.getAttribute(attr)?.split(",").map((x) => x.trim()) ?? []);
  };

  type Action = (element: Element) => void;

  const add: Action = (element) => {
    for (const name of getNames(element)) {
      const mount = registry.get(name);

      if (!mount) {
        return console.debug("invalid component:", name);
      }

      if (!mounteds.has(name)) {
        mounteds.set(name, new Set());
      }

      const elements = mounteds.get(name);

      if (!elements?.has(element)) {
        elements?.add(element);

        const controller = new AbortController();
        const unmountOrPromise = mount(element, controller.signal);

        if (unmountOrPromise instanceof Promise) {
          let unmount: Function = () => controller.abort();

          unmountOrPromise.then((f) => {
            if (f) {
              unmount = f;
            }
          });

          unmounts.set(element, () => unmount?.());
        } else if (typeof unmountOrPromise === "function") {
          unmounts.set(element, unmountOrPromise);
        }
      }
    }
  };

  const remove: Action = (element) => {
    for (const name of getNames(element)) {
      mounteds.get(name)?.delete(element);

      unmounts.get(element)?.();
      unmounts.delete(element);
    }
  };

  const execute = (action: Action, node: Node) => {
    if (node instanceof Element) {
      if (node.hasAttribute(attr)) {
        action(node);
      }

      node.querySelectorAll(`[${attr}]`).forEach(action);
    }
  };

  execute(add, root);

  new MutationObserver((records) => {
    for (const { addedNodes, removedNodes } of records) {
      for (const node of removedNodes) {
        execute(remove, node);
      }

      for (const node of addedNodes) {
        execute(add, node);
      }
    }
  }).observe(root, {
    childList: true,
    subtree: true,
  });
};
