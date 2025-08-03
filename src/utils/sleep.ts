export const sleep = (ms: number, signal?: AbortSignal) => new Promise<boolean>((resolve) => {
  let timeout: NodeJS.Timeout | undefined = setTimeout(() => {
    timeout = undefined;

    if (!signal?.aborted) {
      resolve(true);
    }
  }, ms);

  signal?.addEventListener("abort", () => {
    if (timeout) {
      clearTimeout(timeout);
      resolve(false);
    }
  });
});
