type ScrollToHashTargetOptions = {
  updateHistory?: boolean;
  timeoutMs?: number;
};

export function getPreferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function waitForElementById(id: string, timeoutMs: number): Promise<HTMLElement | null> {
  const startedAt = performance.now();

  return new Promise((resolve) => {
    const tick = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element);
        return;
      }

      if (performance.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

export async function scrollToHashTarget(
  hash: string,
  { updateHistory = false, timeoutMs = 2000 }: ScrollToHashTargetOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const id = hash.replace(/^#/, "").trim();
  if (!id) {
    return false;
  }

  const element = await waitForElementById(id, timeoutMs);
  if (!element) {
    return false;
  }

  if (updateHistory) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${id}`
    );
  }

  element.scrollIntoView({
    behavior: getPreferredScrollBehavior(),
    block: "start",
  });

  return true;
}
