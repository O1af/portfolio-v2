import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { personalInfo } from "@/components/Info";
import { Crumbs, FoodMain, GuideList, Lead, PageTitle, SectionHeading, crumbStyles } from "@/components/food/layout";
import { PlaceRows } from "@/components/food/PlaceRows";
import { getRegion } from "@/lib/food-api";
import { formatMonthYear } from "@/lib/food-format";
import { breadcrumbs, foodMeta, foodUrl, itemList } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/$region/")({
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async ({ params }) => {
    const region = await getRegion({ data: { slug: params.region } });
    if (!region) throw notFound();
    return region;
  },
  head: ({ loaderData: region }) => {
    if (!region) return {};
    const url = foodUrl(`/${region.slug}`);
    const guideNames = region.guides.map((g) => g.label.toLowerCase()).join(", ");
    const description = `The ${region.count} places I've rated in ${region.name}, ranked: ${guideNames}. Scores, notes and photos from every visit.`;
    return {
      meta: foodMeta({ title: `Where to eat in ${region.name}: ${region.count} places, ranked | ${personalInfo.name}`, description, url }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({ ...itemList(`Top rated in ${region.name}`, url, region.top), description }),
        jsonLd(breadcrumbs([{ name: region.name, url }])),
      ],
    };
  },
  component: RegionPage,
});

function RegionPage() {
  const region = Route.useLoaderData();
  return (
    <FoodMain>
      <Crumbs>
        {[
          <Link key="food" to="/food" {...stylex.props(crumbStyles.link)}>
            Food
          </Link>,
          <span key="here">{region.name}</span>,
        ]}
      </Crumbs>
      <PageTitle>Where to eat in {region.name}</PageTitle>
      <Lead>
        Every place I've rated in {region.name}
        {region.cities ? ` (${region.cities})` : ""}, {region.count} in all, split into ranked guides.
        {region.updated && ` Updated ${formatMonthYear(region.updated)}.`}
      </Lead>

      <section {...stylex.props(styles.section)}>
        <SectionHeading title="Guides" />
        <GuideList region={region.slug} guides={region.guides} />
      </section>

      <section {...stylex.props(styles.section)}>
        <SectionHeading title="Top rated" meta="across every category" />
        <PlaceRows rows={region.top} />
      </section>
    </FoodMain>
  );
}

const styles = stylex.create({
  section: {
    marginTop: "3rem",
  },
});
