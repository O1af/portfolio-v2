import { createFileRoute, Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { personalInfo } from "@/components/Info";
import { FoodMain, GuideList, Lead, PageTitle, SectionHeading } from "@/components/food/layout";
import type { Pick } from "@/lib/food";
import { photoUrl } from "@/lib/food-core";
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
  const { stats, regions, elsewhere } = Route.useLoaderData();
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

      {regions.map((region, index) => (
        <section key={region.slug} {...stylex.props(styles.section)}>
          <SectionHeading
            title={region.name}
            region={region.slug}
            meta={`${region.count} places${region.cities ? ` · ${region.cities}` : ""}`}
          />
          <Picks picks={region.picks} eager={index === 0} />
          <GuideList region={region.slug} guides={region.guides} />
        </section>
      ))}

      {elsewhere && (
        <section {...stylex.props(styles.section)}>
          <SectionHeading title="Elsewhere" meta="places from trips" />
          <Link to="/food/elsewhere" {...stylex.props(styles.place)}>
            <span {...stylex.props(styles.placeName)}>{elsewhere.cities} and more</span>
            <span {...stylex.props(styles.placeCount)}>{elsewhere.count}</span>
          </Link>
        </section>
      )}
    </FoodMain>
  );
}

/** Top three places with photos in a city: a sideways-scrolling strip on phones, three across on desktop. */
function Picks({ picks, eager }: { picks: Pick[]; eager: boolean }) {
  if (picks.length === 0) return null;
  return (
    <ul {...stylex.props(styles.picks)}>
      {picks.map((pick) => (
        <li key={pick.slug} {...stylex.props(styles.pick)}>
          <Link to="/food/place/$slug" params={{ slug: pick.slug }} {...stylex.props(styles.pickLink)}>
            <img
              src={photoUrl(pick.photo, "480")}
              srcSet={`${photoUrl(pick.photo, "480")} 480w, ${photoUrl(pick.photo, "800")} 800w`}
              sizes="(min-width: 640px) 13rem, 70vw"
              alt=""
              width={480}
              height={360}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              {...stylex.props(styles.pickImage)}
            />
            <span {...stylex.props(styles.pickRow)}>
              <span {...stylex.props(styles.pickName)}>{pick.name}</span>
              <span {...stylex.props(styles.pickScore)}>{pick.score.toFixed(1)}</span>
            </span>
            {pick.area && <span {...stylex.props(styles.pickArea)}>{pick.area}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const styles = stylex.create({
  picks: {
    display: "grid",
    gridAutoFlow: { default: "column", "@media (min-width: 640px)": "row" },
    gridAutoColumns: { default: "70%", "@media (min-width: 640px)": "auto" },
    gridTemplateColumns: { default: "none", "@media (min-width: 640px)": "repeat(3, 1fr)" },
    gap: "0.75rem",
    marginTop: "0.875rem",
    marginBottom: "0.5rem",
    // Bleed to the screen edge on phones so the strip reads as scrollable.
    marginInline: { default: "-1.25rem", "@media (min-width: 640px)": 0 },
    paddingInline: { default: "1.25rem", "@media (min-width: 640px)": 0 },
    overflowX: { default: "auto", "@media (min-width: 640px)": "visible" },
    scrollSnapType: "x mandatory",
    scrollPaddingInline: "1.25rem",
    scrollbarWidth: "none",
    listStyle: "none",
  },
  pick: {
    minWidth: 0,
    scrollSnapAlign: "start",
  },
  pickLink: {
    "--pick-decoration": { default: "none", ":hover": "underline" },
    display: "flex",
    flexDirection: "column",
    borderRadius: "0.75rem",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  pickImage: {
    display: "block",
    width: "100%",
    height: "auto",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    borderRadius: "0.75rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "var(--secondary)",
  },
  pickRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  pickName: {
    minWidth: 0,
    overflow: "hidden",
    color: "var(--foreground)",
    fontSize: "14px",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textDecorationLine: "var(--pick-decoration)",
  },
  pickScore: {
    marginLeft: "auto",
    color: "var(--foreground)",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
  },
  pickArea: {
    marginTop: "0.125rem",
    color: "var(--dim)",
    fontSize: "12px",
  },
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
  place: {
    "--place-decoration": { default: "none", ":hover": "underline" },
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    marginTop: "0.25rem",
    paddingBlock: "0.875rem",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  placeName: {
    color: "var(--foreground)",
    fontSize: "14.5px",
    fontWeight: 500,
    textDecorationLine: "var(--place-decoration)",
  },
  placeCount: {
    marginLeft: "auto",
    color: "var(--dim)",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontVariantNumeric: "tabular-nums",
  },
});
