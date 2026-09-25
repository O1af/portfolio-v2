// Custom server entry. Pages are prerendered to static HTML at build time and
// served as assets, so the Worker mostly answers server-function calls made
// during client-side navigation (and renders 404s). The food dataset is imported
// statically so it's parsed once while the Worker starts (1 s budget) instead
// of inside a request's 10 ms CPU budget.
import handler from "@tanstack/react-start/server-entry";
import "./lib/food";

export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
};
