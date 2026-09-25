import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { personalInfo } from "@/components/Info";
import { Crumbs, FoodMain, HowIRate, Lead, PageTitle, SectionHeading, crumbStyles } from "@/components/food/layout";
import { PlaceRows } from "@/components/food/PlaceRows";
import { getElsewhere } from "@/lib/food-api";
import { formatMonthYear } from "@/lib/food-format";
import { breadcrumbs, foodMeta, foodUrl, itemList } from "@/lib/food-seo";
import { jsonLd } from "@/lib/seo";

export const Route = createFileRoute("/food/elsewhere")({
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  loader: async () => {
    const view = await getElsewhere();
    if (!view) throw notFound();
    return view;
  },
  head: ({ loaderData: view }) => {
    if (!view) return {};
    const url = foodUrl("/elsewhere");
    const cities = view.sections.map((s) => s.name);
    const description = `${view.count} places I've rated on trips outside my usual cities: ${cities.slice(0, 5).join(", ")}${cities.length > 5 ? " and more" : ""}.`;
    return {
      meta: foodMeta({ title: `Elsewhere: ${view.count} places from trips | ${personalInfo.name}`, description, url, og: view.og }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        jsonLd({ ...itemList("Elsewhere", url, view.sections.flatMap((s) => s.rows)), description }),
        jsonLd(breadcrumbs([{ name: "Elsewhere", url }])),
      ],
    };
  },
  component: ElsewherePage,
});

function ElsewherePage() {
  const view = Route.useLoaderData();
  return (
    <FoodMain>
      <Crumbs>
        {[
          <Link key="food" to="/food" {...stylex.props(crumbStyles.link)}>
            Food
          </Link>,
          <span key="here">Elsewhere</span>,
        ]}
      </Crumbs>
      <PageTitle>Elsewhere</PageTitle>
      <Lead>
        Places I've rated on trips, in cities where I haven't eaten enough for a ranked guide. {view.count} in all,
        grouped by city.{view.updated && ` Updated ${formatMonthYear(view.updated)}.`}
      </Lead>

      {view.sections.map((section) => (
        <section key={section.slug} {...stylex.props(styles.section)}>
          <SectionHeading title={section.name} meta={`${section.rows.length} ${section.rows.length === 1 ? "place" : "places"}`} />
          <PlaceRows rows={section.rows} />
        </section>
      ))}

      <HowIRate />
    </FoodMain>
  );
}

const styles = stylex.create({
  section: {
    marginTop: "2.5rem",
  },
});
