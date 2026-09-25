import { useEffect, useState } from "react";

// Flips once, after the first client render. Pages are prerendered as static HTML,
// which can't see the query string, so anything that depends on search params has
// to match the server HTML until hydration is done. Later client-side navigations
// start out hydrated, so they render the final state immediately.
let hydrated = false;

export function useHydrated(): boolean {
  const [value, setValue] = useState(hydrated);
  useEffect(() => {
    hydrated = true;
    setValue(true);
  }, []);
  return value;
}
