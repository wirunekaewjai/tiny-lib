import { expect, spyOn, test } from "bun:test";
import { defineComponent, observeComponents } from "../../src/modules/component";

test("mount and unmount", async () => {
  let value = 0;

  const parent = defineComponent("1", () => {
    value += 1;
    return () => value += 2;
  });

  const child = defineComponent("2", () => {
    value += 3;
    return () => value += 4;
  });

  const root = document.createElement("div");
  const parentElement = document.createElement("div");
  const childElement = document.createElement("div");

  parentElement.setAttribute("x-is", parent.name);
  childElement.setAttribute("x-is", child.name);

  parentElement.appendChild(childElement);
  root.appendChild(parentElement);
  document.body.appendChild(root);

  observeComponents(root, parent, child);
  expect(value).toBe(4);

  parentElement.remove();
  await Bun.sleep(50);

  expect(value).toBe(10);
  root.remove();
});

test("mount and abort", async () => {
  let value = "";

  const component = defineComponent("1", async (_, signal) => {
    value = "mounted";

    await Bun.sleep(20);

    if (signal.aborted) {
      value = "aborted";
      return;
    }

    value = "done";
    return () => { };
  });

  const iter: [number, string][] = [
    [0, "aborted"],
    [50, "done"],
  ];

  for (const [delay, target] of iter) {
    const root = document.createElement("div");
    const element = document.createElement("div");

    element.setAttribute("x-is", component.name);

    root.appendChild(element);
    document.body.appendChild(root);

    observeComponents(root, component);
    expect(value).toBe("mounted");

    if (delay > 0) {
      await Bun.sleep(delay);
    }

    element.remove();
    await Bun.sleep(50);

    expect(value).toBe(target);
    root.remove();
  }
});

test("mount unknown component", async () => {
  const debugArgs: any[] = [];
  const consoleDebugSpy = spyOn(console, "debug").mockImplementation((...args: any[]) => debugArgs.push(...args));

  const root = document.createElement("div");
  const element = document.createElement("div");

  element.setAttribute("x-is", "hello");

  root.appendChild(element);
  document.body.appendChild(root);

  observeComponents(root);
  root.remove();

  expect(debugArgs).toMatchObject(["invalid component:", "hello"]);
  consoleDebugSpy.mockRestore();
});
