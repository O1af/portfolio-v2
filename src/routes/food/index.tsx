import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { siteUrl, personalInfo } from "@/components/Info";
import { buildSocialMeta, jsonLd } from "@/lib/seo";
import type { HubData } from "@/lib/food";

const getHub = createServerFn({ method: "GET" }).handler(async (): Promise<HubData> => {
  const { hub } = await import("@/lib/food");
  return hub;
});

const title = `Food | ${personalInfo.name}`;
const description = (stats: HubData["stats"]) =>
  `Every restaurant, coffee shop, bakery and bar I've rated — ${stats.places} places across ${stats.regions} cities, ranked, with notes and photos.`;

export const Route = createFileRoute("/food/")({
  loader: () => getHub(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const url = `${siteUrl}/food`;
    const desc = description(loaderData.stats);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "author", content: personalInfo.name },
        ...buildSocialMeta({
          title,
          description: desc,
          url,
          image: `${siteUrl}${personalInfo.profileImage}`,
          siteName: personalInfo.name,
        }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Food",
          description: desc,
          url,
          author: { "@type": "Person", name: personalInfo.name, url: siteUrl },
        }),
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
    <main id="main-content" {...stylex.props(styles.main)}>
      <div {...stylex.props(styles.content)}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 {...stylex.props(styles.heading)}>Food</h1>
          <p {...stylex.props(styles.description)}>
            Everywhere I've eaten and rated since 2024, straight from my Beli. Ranked lists by city, with notes
            and photos where I remembered to take them.
          </p>
          <div {...stylex.props(styles.stats)}>
            {statItems.map(([value, label]) => (
              <div key={label}>
                <div {...stylex.props(styles.statValue)}>{value}</div>
                <div {...stylex.props(styles.statLabel)}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {regions.map((region, index) => (
          <motion.section
            key={region.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            {...stylex.props(styles.section)}
          >
            <div {...stylex.props(styles.sectionHeading)}>
              <h2 {...stylex.props(styles.regionName)}>{region.name}</h2>
              <span {...stylex.props(styles.regionMeta)}>
                {region.count} places
                {region.cities && ` · ${region.cities}`}
              </span>
            </div>
            <div {...stylex.props(styles.list)}>
              {region.guides.map((guide, i) => (
                // Plain anchors until the guide routes land in the next step.
                <a
                  key={guide.slug}
                  href={`/food/${guide.slug}`}
                  {...stylex.props(styles.item, i < region.guides.length - 1 && styles.divider)}
                >
                  <span {...stylex.props(styles.itemName)}>{guide.label}</span>
                  <span {...stylex.props(styles.itemCount)}>{guide.count}</span>
                </a>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}

const styles = stylex.create({
  main: {
    minHeight: "100vh",
    padding: "8rem 1.5rem 4rem",
  },
  content: {
    maxWidth: "42rem",
    marginInline: "auto",
  },
  heading: {
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  description: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
    textWrap: "pretty",
  },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    marginTop: "1.5rem",
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
  sectionHeading: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: "0.625rem",
  },
  regionName: {
    whiteSpace: "nowrap",
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  regionMeta: {
    color: "var(--dim)",
    fontSize: "13px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0.25rem",
  },
  item: {
    "--item-decoration": {
      default: "none",
      ":hover": "underline",
    },
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    paddingBlock: "0.875rem",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
  },
  itemName: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
    textDecorationLine: "var(--item-decoration)",
  },
  itemCount: {
    marginLeft: "auto",
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontVariantNumeric: "tabular-nums",
  },
});
