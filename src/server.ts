// Custom server entry. Its only job beyond the default is to import the food
// dataset statically, so parsing and merging ~700 places happens once while
// the Worker starts up (1 s budget) instead of inside the first request that
// needs it (10 ms CPU budget on the free plan).
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import "./lib/food";

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
