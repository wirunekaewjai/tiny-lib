import { expect, test } from "bun:test";
import { sleep } from "../../src";

test("ok", async () => {
  const t = performance.now();
  const ok = await sleep(10);
  const u = performance.now() - t;

  expect(ok).toBe(true);
  expect(u).toBeGreaterThanOrEqual(9);
});

test("aborted", async () => {
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => controller.abort(), 20);

  const t = performance.now();
  const ok = await sleep(50, signal);
  const u = performance.now() - t;

  expect(ok).toBe(false);
  expect(u).toBeGreaterThanOrEqual(19);
});
