import { createFileRoute, Link } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { personalInfo, socialUrls } from "@/components/Info";
import { Crumbs, FoodMain, Lead, PageTitle, crumbStyles } from "@/components/food/layout";
import { getHub } from "@/lib/food-api";
import { formatMonthYear } from "@/lib/food-format";
import { author, breadcrumbs, foodMeta, foodUrl } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/how-i-rate")({
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async () => (await getHub()).stats,
  head: ({ loaderData: stats }) => {
    if (!stats) return {};
    const url = foodUrl("/how-i-rate");
    const description = `How I score the ${stats.places} places I've rated: basically opportunity cost, a mix of taste, price and value with a little atmosphere.`;
    return {
      meta: foodMeta({ title: `How I rate food | ${personalInfo.name}`, description, url, type: "article" }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({ "@context": "https://schema.org", "@type": "ProfilePage", url, description, mainEntity: author }),
        jsonLd(breadcrumbs([{ name: "How I rate", url }])),
      ],
    };
  },
  component: HowIRatePage,
});

function HowIRatePage() {
  const stats = Route.useLoaderData();
  return (
    <FoodMain>
      <Crumbs>
        {[
          <Link key="food" to="/food" {...stylex.props(crumbStyles.link)}>
            Food
          </Link>,
          <span key="here">How I rate</span>,
        ]}
      </Crumbs>
      <PageTitle>How I rate</PageTitle>
      <Lead>
        Every score is basically opportunity cost: for what it cost me, was this worth it compared with everything else I
        could have eaten?
      </Lead>

      <Section title="What goes into a score">
        A mix of taste, price and value, with a little bit of atmosphere. There's no formula, so the weights shift a bit
        from place to place. I do my best.
      </Section>

      <Section title="Scores are relative">
        I rate each place by comparing it with the ones I've already rated in the same category. A 10 means it beat
        everything else I've had in that category, not that it's perfect, and scores can move as I try more places.
      </Section>

      <Section title="By the numbers">
        {stats.places} places rated
        {stats.since && ` since ${formatMonthYear(stats.since)}`}, across {stats.regions} cities. {stats.notes} have
        notes, and there are {stats.photos} photos. Nothing here is sponsored.
      </Section>

      <Section title="Elsewhere">
        I also post reviews and photos on{" "}
        <a href={socialUrls.googleMaps} target="_blank" rel="noopener noreferrer me" {...stylex.props(styles.link)}>
          Google Maps
        </a>
        . Know somewhere I should try?{" "}
        <a href={`mailto:${personalInfo.email}?subject=Food%20rec`} {...stylex.props(styles.link)}>
          Send it my way
        </a>
        .
      </Section>
    </FoodMain>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section {...stylex.props(styles.section)}>
      <h2 {...stylex.props(styles.h2)}>{title}</h2>
      <p {...stylex.props(styles.body)}>{children}</p>
    </section>
  );
}

const styles = stylex.create({
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
  body: {
    color: "var(--muted-foreground)",
    fontSize: "15px",
    lineHeight: "1.65",
    textWrap: "pretty",
  },
  link: {
    color: "var(--foreground)",
    textDecorationLine: "underline",
    textUnderlineOffset: "3px",
  },
});
