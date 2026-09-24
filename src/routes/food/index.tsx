import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { personalInfo } from "@/components/Info";
import { FoodMain, GuideList, Lead, PageTitle, SectionHeading } from "@/components/food/layout";
import { getHub } from "@/lib/food-api";
import { breadcrumbs, foodMeta, foodUrl } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/")({
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: () => getHub(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { stats, regions } = loaderData;
    const url = foodUrl();
    const description = `Every restaurant, coffee shop, bakery and bar I've rated: ${stats.places} places across ${regions
      .slice(0, 4)
      .map((r) => r.name)
      .join(", ")} and more, ranked with notes and photos.`;
    return {
      meta: foodMeta({ title: `Food guides: ${stats.places} places I've rated | ${personalInfo.name}`, description, url, og: loaderData.og }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Food",
          description,
          url,
          author: { "@type": "Person", name: personalInfo.name },
          hasPart: regions.flatMap((r) =>
            r.guides.map((g) => ({ "@type": "ItemList", name: `${g.label} in ${r.name}`, url: foodUrl(`/${r.slug}/${g.segment}`) }))
          ),
        }),
        jsonLd(breadcrumbs([])),
      ],
    };
  },
  component: FoodHub,
});

function FoodHub() {
  const { stats, regions } = Route.useLoaderData();
  const statItems = [
    [stats.places, "places rated"],
    [stats.nines, "scored 9+"],
    [stats.photos, "photos"],
    [stats.regions, "cities"],
  ] as const;

  return (
    <FoodMain>
      <PageTitle>Food</PageTitle>
      <Lead>
        Everywhere I've eaten and rated since 2024, straight from my Beli. Ranked lists by city, with notes and photos
        where I remembered to take them.
      </Lead>
      <dl {...stylex.props(styles.stats)}>
        {statItems.map(([value, label]) => (
          <div key={label} {...stylex.props(styles.stat)}>
            <dt {...stylex.props(styles.statLabel)}>{label}</dt>
            <dd {...stylex.props(styles.statValue)}>{value}</dd>
          </div>
        ))}
      </dl>

      {regions.map((region) => (
        <section key={region.slug} {...stylex.props(styles.section)}>
          <SectionHeading
            title={region.name}
            meta={`${region.count} places${region.cities ? ` · ${region.cities}` : ""}`}
          />
          <GuideList region={region.slug} guides={region.guides} />
        </section>
      ))}
    </FoodMain>
  );
}

const styles = stylex.create({
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  stat: {
    display: "flex",
    flexDirection: "column-reverse",
  },
  statValue: {
    color: "var(--foreground)",
    fontFamily: "var(--font-mono)",
    fontSize: "1.375rem",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    color: "var(--dim)",
    fontSize: "12px",
  },
  section: {
    marginTop: "3rem",
  },
});
