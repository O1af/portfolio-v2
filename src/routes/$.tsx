import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  beforeLoad: ({ params }) => {
    const requestedPath = (params as { _splat?: string })._splat ?? "";

    // Only redirect file-like paths (contains an extension).
    if (!requestedPath || !requestedPath.includes(".")) {
      throw notFound();
    }

    throw redirect({
      href: `/data/${requestedPath}`,
      statusCode: 308,
    });
  },
  component: () => null,
});
