import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { personalInfo } from "@/components/Info";
import { Crumbs, FoodMain, crumbStyles } from "@/components/food/layout";
import { Lightbox } from "@/components/food/Lightbox";
import type { PlaceView } from "@/lib/food";
import { getPlace } from "@/lib/food-api";
import { cityName, photoUrl, type Photo } from "@/lib/food-core";
import {
  DAY_NAMES,
  WEEK,
  directionsUrl,
  displayDomain,
  formatDayHours,
  formatScore,
  formatVisitDate,
  lowerLabel,
  placeLocation,
  placeType,
  recommendationMailto,
} from "@/lib/food-format";
import { breadcrumbs, foodMeta, foodUrl, guideUrl, placeSchema, placeUrl } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/place/$slug")({
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async ({ params }) => {
    const place = await getPlace({ data: { slug: params.slug } });
    if (!place) throw notFound();
    return place;
  },
  head: ({ loaderData: place }) => {
    if (!place) return {};
    const url = placeUrl(place.slug);
    const town = cityName(place.city);
    const where = placeLocation(place.city, place.area, place.neighborhood);
    const rank = place.guide && ` #${place.guide.rank} of ${place.guide.total} in my ${place.region.name} ${lowerLabel(place.guide.label)} guide.`;
    const description = place.note
      ? `${formatScore(place.score)}/10. ${truncate(place.note, 120)}`
      : `${place.name} in ${where}: ${formatScore(place.score)}/10.${rank ?? ""}`;
    const crumbs = [
      place.region.hasPage
        ? { name: place.region.name, url: foodUrl(`/${place.region.slug}`) }
        : { name: "Elsewhere", url: foodUrl("/elsewhere") },
      ...(place.guide ? [{ name: place.guide.label, url: guideUrl(place.region.slug, place.guide.segment) }] : []),
      { name: place.name, url },
    ];
    return {
      meta: [
        ...foodMeta({
          title: `${place.name}, ${town}: ${formatScore(place.score)}/10 | ${personalInfo.name}`,
          description,
          url,
          og: place.og,
          image: place.photos[0],
          type: "article",
        }),
        // Photo-only pages stay reachable from guides but out of search results until they have a note.
        ...(place.indexable
          ? []
          : [
              { name: "robots", content: "noindex, follow" },
              { name: "googlebot", content: "noindex, follow" },
            ]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [jsonLd(placeSchema(place, url)), jsonLd(breadcrumbs(crumbs))],
    };
  },
  component: PlacePage,
});

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max))}…`;
}

function PlacePage() {
  const place = Route.useLoaderData();
  const { guide, region } = place;
  const where = placeLocation(place.city, place.area, place.neighborhood);
  const guideName = guide && `${region.name} ${lowerLabel(guide.label)}`;
  const short = (place.note?.split(/\s+/).length ?? 0) <= 3;

  return (
    <FoodMain>
      <Crumbs>
        {[
          <Link key="food" to="/food" {...stylex.props(crumbStyles.link)}>
            Food
          </Link>,
          region.hasPage ? (
            <Link key="region" to="/food/$region" params={{ region: region.slug }} {...stylex.props(crumbStyles.link)}>
              {region.name}
            </Link>
          ) : (
            <Link key="region" to="/food/elsewhere" {...stylex.props(crumbStyles.link)}>
              Elsewhere
            </Link>
          ),
          ...(guide
            ? [
                <Link
                  key="guide"
                  to="/food/$region/$guide"
                  params={{ region: region.slug, guide: guide.segment }}
                  {...stylex.props(crumbStyles.link)}
                >
                  {guide.label}
                </Link>,
              ]
            : []),
        ]}
      </Crumbs>

      <div {...stylex.props(styles.top)}>
        <h1 {...stylex.props(styles.title)}>{place.name}</h1>
        <div {...stylex.props(styles.scoreBlock)}>
          <span {...stylex.props(styles.bigScore)} aria-label={`Score ${formatScore(place.score)} out of 10`}>
            {formatScore(place.score)}
          </span>
          {guide && (
            <span {...stylex.props(styles.of)}>
              #{guide.rank} of {guide.total} {lowerLabel(guide.label)}
            </span>
          )}
        </div>
      </div>

      <p {...stylex.props(styles.meta)}>
        {where} · {placeType(place.category, place.kind, place.cuisines)}
        {place.visited && (
          <>
            <br />
            Visited {formatVisitDate(place.visited)}
          </>
        )}
      </p>

      {place.status && (
        <p {...stylex.props(styles.banner)} role="status">
          {place.status === "closed"
            ? "Permanently closed. Kept here for the record."
            : "Temporarily closed at last check."}
        </p>
      )}

      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.h2)}>My take</h2>
        {place.note ? (
          <p {...stylex.props(styles.take, styles.takeLines, short && styles.takeShort)}>{place.note}</p>
        ) : (
          <p {...stylex.props(styles.muted)}>
            No notes yet.{" "}
            <a href={recommendationMailto(place.name)} {...stylex.props(styles.underline)}>
              Tell me what to order
            </a>{" "}
            next time.
          </p>
        )}
        {place.dishes.length > 0 && (
          <ul {...stylex.props(styles.dishes)}>
            {place.dishes.map((dish) => (
              <li key={dish.name} {...stylex.props(styles.dish)}>
                {dish.name}
                {dish.mustOrder && <span {...stylex.props(styles.must)}>must order</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Photos photos={place.photos} name={place.name} dishes={place.dishes.map((d) => d.name)} />

      <div {...stylex.props(styles.facts)}>
        <section>
          <h2 {...stylex.props(styles.h2)}>Hours</h2>
          <Hours hours={place.hours} />
        </section>
        <section>
          <h2 {...stylex.props(styles.h2)}>Links</h2>
          <div {...stylex.props(styles.links)}>
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.linkRow)}>
                Website <span {...stylex.props(styles.linkMeta)}>{displayDomain(place.website)}</span>
              </a>
            )}
            <a
              href={directionsUrl(place.name, place.placeId, place.lat, place.lng)}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.linkRow)}
            >
              Directions <span {...stylex.props(styles.linkMeta)}>Google Maps</span>
            </a>
            {guide && (
              <Link
                to="/food/$region/$guide"
                params={{ region: region.slug, guide: guide.segment }}
                {...stylex.props(styles.linkRow)}
              >
                All {guideName} <span {...stylex.props(styles.linkMeta)}>{guide.total} places</span>
              </Link>
            )}
          </div>
        </section>
      </div>

      {guide && (guide.prev || guide.next) && (
        <nav aria-label={`More ${guideName}`} {...stylex.props(styles.pager)}>
          {guide.prev ? <PagerLink item={guide.prev} label="Better" /> : <span />}
          {guide.next && <PagerLink item={guide.next} label="Next" alignEnd />}
        </nav>
      )}
    </FoodMain>
  );
}

function PagerLink({ item, label, alignEnd }: { item: { slug: string; name: string; rank: number }; label: string; alignEnd?: boolean }) {
  return (
    <Link to="/food/place/$slug" params={{ slug: item.slug }} {...stylex.props(styles.pagerLink, alignEnd && styles.alignEnd)}>
      <span {...stylex.props(styles.pagerLabel)}>
        {label} · #{item.rank}
      </span>
      {item.name}
    </Link>
  );
}

/**
 * Photos keep their own shape: nearly all are portrait phone shots, so tiles are 3:4
 * (landscape ones span two columns). Tapping one opens the full photo, uncropped.
 */
function Photos({ photos, name, dishes }: { photos: Photo[]; name: string; dishes: string[] }) {
  const [open, setOpen] = useState<number>();
  if (photos.length === 0) return null;
  // A caption that just repeats a dish chip above adds nothing under the tile (the viewer still shows it).
  const listed = new Set(dishes.map((d) => d.trim().toLowerCase()));
  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.h2)}>Photos</h2>
      <div {...stylex.props(styles.grid)}>
        {photos.map((photo, i) => {
          const wide = Boolean(photo.w && photo.h && photo.w > photo.h);
          return (
            <figure key={photo.id} {...stylex.props(styles.figure, wide && styles.wide)}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open photo${photo.caption ? `: ${photo.caption}` : ""}`}
                {...stylex.props(styles.tile)}
              >
                <img
                  src={photoUrl(photo.id, "480")}
                  srcSet={`${photoUrl(photo.id, "480")} 480w, ${photoUrl(photo.id, "800")} 800w`}
                  sizes={wide ? "(min-width: 44.5rem) 27.5rem, calc(100vw - 2.5rem)" : "(min-width: 44.5rem) 13.5rem, calc(50vw - 1.6rem)"}
                  width={photo.w}
                  height={photo.h}
                  alt={photo.caption ? `${photo.caption} at ${name}` : `Photo from ${name}`}
                  loading={i < 3 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  {...stylex.props(styles.image, wide && styles.wideImage)}
                />
              </button>
              {photo.caption && !listed.has(photo.caption.trim().toLowerCase()) && (
                <figcaption {...stylex.props(styles.caption)}>{photo.caption}</figcaption>
              )}
            </figure>
          );
        })}
      </div>
      <Lightbox photos={photos} name={name} index={open} onClose={() => setOpen(undefined)} />
    </section>
  );
}

function Hours({ hours }: { hours: PlaceView["hours"] }) {
  // Today depends on the visitor's clock, so it's highlighted after hydration.
  const [today, setToday] = useState<number>();
  useEffect(() => setToday(new Date().getDay()), []);
  if (!hours?.length) return <p {...stylex.props(styles.muted, styles.factsBody)}>Hours not captured.</p>;
  return (
    <dl {...stylex.props(styles.factsBody)}>
      {WEEK.map((day) => (
        <div key={day} {...stylex.props(styles.hourRow, day === today && styles.today)}>
          <dt>{DAY_NAMES[day]}</dt>
          <dd>{formatDayHours(hours, day)}</dd>
        </div>
      ))}
    </dl>
  );
}

const styles = stylex.create({
  top: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    marginTop: "0.25rem",
  },
  title: {
    flex: 1,
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
    textWrap: "pretty",
  },
  scoreBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  bigScore: {
    color: "var(--foreground)",
    fontSize: "2.25rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.045em",
    fontVariantNumeric: "tabular-nums",
  },
  of: {
    marginTop: "0.15rem",
    whiteSpace: "nowrap",
    color: "var(--dim)",
    fontSize: "11px",
  },
  meta: {
    marginTop: "0.75rem",
    color: "var(--dim)",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  banner: {
    marginTop: "1rem",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.5rem",
    backgroundColor: "var(--secondary)",
    color: "var(--foreground)",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: { default: "repeat(2, 1fr)", "@media (min-width: 640px)": "repeat(3, 1fr)" },
    gap: "0.75rem",
    marginTop: "0.75rem",
  },
  figure: {
    margin: 0,
    minWidth: 0,
  },
  wide: {
    gridColumn: "span 2",
  },
  tile: {
    display: "block",
    width: "100%",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "zoom-in",
  },
  image: {
    display: "block",
    width: "100%",
    height: "auto",
    aspectRatio: "3 / 4",
    objectFit: "cover",
    borderRadius: "0.75rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "var(--secondary)",
    transition: "opacity 150ms",
    opacity: { default: 1, ":hover": 0.9 },
  },
  wideImage: {
    aspectRatio: "auto",
  },
  caption: {
    marginTop: "0.5rem",
    color: "var(--dim)",
    fontSize: "12px",
  },
  section: {
    marginTop: "2rem",
  },
  h2: {
    marginBottom: "0.5rem",
    color: "var(--foreground)",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  take: {
    color: "var(--foreground)",
    fontSize: "15.5px",
    lineHeight: "1.65",
    textWrap: "pretty",
  },
  /** Keeps the line breaks of list-style notes ("croissant - really good"). */
  takeLines: {
    whiteSpace: "pre-line",
  },
  takeShort: {
    fontSize: "1.5rem",
    lineHeight: "1.35",
    fontWeight: 500,
    letterSpacing: "-0.02em",
  },
  muted: {
    color: "var(--dim)",
    fontSize: "13px",
  },
  underline: {
    textDecorationLine: "underline",
  },
  dishes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.375rem",
    marginTop: "0.875rem",
    listStyle: "none",
  },
  dish: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    borderRadius: "999px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    color: "var(--muted-foreground)",
    fontSize: "12.5px",
  },
  must: {
    color: "var(--foreground)",
    fontSize: "11px",
    fontWeight: 500,
  },
  facts: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", "@media (min-width: 640px)": "1fr 1fr" },
    gap: "1.5rem",
    marginTop: "2rem",
  },
  factsBody: {
    marginTop: "0.5rem",
  },
  hourRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    paddingBlock: "0.2rem",
    color: "var(--muted-foreground)",
    fontSize: "13px",
    fontVariantNumeric: "tabular-nums",
  },
  today: {
    color: "var(--foreground)",
    fontWeight: 500,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0.5rem",
  },
  linkRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    paddingBlock: "0.6rem",
    borderBottomWidth: "1px",
    borderColor: "var(--border)",
    color: "var(--foreground)",
    fontSize: "13.5px",
    textDecorationLine: { default: "none", ":hover": "underline" },
  },
  linkMeta: {
    color: "var(--dim)",
    fontSize: "12px",
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginTop: "2.5rem",
    paddingTop: "1.25rem",
    borderTopWidth: "1px",
    borderColor: "var(--border)",
    fontSize: "13px",
  },
  pagerLink: {
    color: { default: "var(--muted-foreground)", ":hover": "var(--foreground)" },
  },
  alignEnd: {
    textAlign: "right",
  },
  pagerLabel: {
    display: "block",
    color: "var(--dim)",
    fontSize: "11px",
  },
});
