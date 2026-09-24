import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { personalInfo } from "@/components/Info";
import { describeFilters, FilterBar, hasFilters } from "@/components/food/FilterBar";
import { Crumbs, FoodMain, HowIRate, Lead, PageTitle, crumbStyles } from "@/components/food/layout";
import { MiniHeader } from "@/components/food/MiniHeader";
import { PlaceRows } from "@/components/food/PlaceRows";
import { useRowKeys } from "@/components/food/useRowKeys";
import { getGuide } from "@/lib/food-api";
import { applyListFilters, parseListFilters, type ListFilters } from "@/lib/food-core";
import { formatMonthYear, recommendationMailto } from "@/lib/food-format";
import { breadcrumbs, foodMeta, foodUrl, guideSchema, guideUrl } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/$region/$guide")({
  validateSearch: (search: Record<string, unknown>): ListFilters => parseListFilters(search),
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async ({ params }) => {
    const guide = await getGuide({ data: { region: params.region, guide: params.guide } });
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData: guide }) => {
    if (!guide) return {};
    // Canonical ignores filters: every filtered view points back at the full guide.
    const url = guideUrl(guide.region.slug, guide.segment);
    const count = guide.rows.length;
    const title = guide.custom ? guide.title : `${guide.title}: ${count} places, ranked`;
    const description = guide.custom
      ? guide.description
      : `${guide.description} ${count} places, ${guide.noted} with notes, from ${guide.rows[0].name} (${guide.rows[0].score.toFixed(1)}) down.`;
    return {
      meta: foodMeta({ title: `${title} | ${personalInfo.name}`, description, url, og: guide.og, image: guide.image, type: "article" }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd(guideSchema(guide, url)),
        jsonLd(
          breadcrumbs([
            { name: guide.region.name, url: foodUrl(`/${guide.region.slug}`) },
            { name: guide.label, url },
          ])
        ),
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const guide = Route.useLoaderData();
  const filters = Route.useSearch();
  const rows = applyListFilters(guide.rows, filters);
  const total = guide.rows.length;
  const filterLabel = describeFilters(filters);
  const focused = useRowKeys(rows.length, JSON.stringify(filters));

  return (
    <FoodMain>
      <MiniHeader title={guide.title} detail={filterLabel || `${total} places`} />
      <Crumbs>
        {[
          <Link key="food" to="/food" {...stylex.props(crumbStyles.link)}>
            Food
          </Link>,
          <Link key="region" to="/food/$region" params={{ region: guide.region.slug }} {...stylex.props(crumbStyles.link)}>
            {guide.region.name}
          </Link>,
        ]}
      </Crumbs>
      <PageTitle>{guide.title}</PageTitle>
      {guide.intro ? (
        <div
          className={`prose ${stylex.props(styles.intro).className}`}
          dangerouslySetInnerHTML={{ __html: guide.intro }}
        />
      ) : (
        <Lead>
          {guide.description} {total} places, {guide.noted} with notes.
          {guide.updated && ` Updated ${formatMonthYear(guide.updated)}.`}
        </Lead>
      )}

      <FilterBar
        region={guide.region.slug}
        guide={guide.segment}
        filters={filters}
        hasTea={guide.hasTea}
        areas={guide.areas}
      />
      <p {...stylex.props(styles.count)} aria-live="polite">
        {rows.length === total ? `${total} places` : `${rows.length} of ${total}`}
        {filterLabel && ` · ${filterLabel}`} · score out of 10
        <span {...stylex.props(styles.keys)}>
          {" · "}
          <kbd {...stylex.props(styles.kbd)}>j</kbd> <kbd {...stylex.props(styles.kbd)}>k</kbd>{" "}
          <kbd {...stylex.props(styles.kbd)}>↵</kbd>
        </span>
      </p>

      {rows.length > 0 ? <PlaceRows rows={rows} focused={focused} /> : <EmptyState guide={guide.label} region={guide.region} filters={filters} />}

      <HowIRate />
    </FoodMain>
  );
}

function EmptyState({ guide, region, filters }: { guide: string; region: { phrase: string }; filters: ListFilters }) {
  const where = filters.nbhd ?? region.phrase;
  return (
    <div {...stylex.props(styles.empty)}>
      <p {...stylex.props(styles.emptyTitle)}>
        Nothing in {guide.toLowerCase()} for {where}
        {filters.min ? ` at ${filters.min}+` : ""} yet.
      </p>
      <p {...stylex.props(styles.emptyText)}>
        Know a place?{" "}
        <a href={recommendationMailto(where)} {...stylex.props(styles.underline)}>
          Send it my way
        </a>{" "}
        and I'll go.
      </p>
      {hasFilters(filters) && (
        <Link to="." search={{}} replace resetScroll={false} {...stylex.props(styles.emptyClear)}>
          Clear filters
        </Link>
      )}
    </div>
  );
}

const styles = stylex.create({
  intro: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
  },
  count: {
    marginTop: "1rem",
    color: "var(--dim)",
    fontSize: "12px",
  },
  // Keyboard hint only where there is a keyboard.
  keys: {
    display: { default: "none", "@media (hover: hover) and (pointer: fine)": "inline" },
  },
  kbd: {
    paddingInline: "4px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
  },
  empty: {
    marginTop: "2.5rem",
    padding: "2rem 1.25rem",
    borderRadius: "0.75rem",
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: "var(--border)",
    textAlign: "center",
  },
  emptyTitle: {
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 500,
  },
  emptyText: {
    marginTop: "0.5rem",
    color: "var(--muted-foreground)",
    fontSize: "13px",
  },
  underline: {
    textDecorationLine: "underline",
  },
  emptyClear: {
    display: "inline-block",
    marginTop: "0.75rem",
    color: { default: "var(--dim)", ":hover": "var(--foreground)" },
    fontSize: "12px",
    textDecorationLine: "underline",
  },
});
