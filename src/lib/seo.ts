type SocialMetaInput = {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  type?: "website" | "article";
};

export function buildSocialMeta({
  title,
  description,
  url,
  image,
  siteName,
  type = "website",
}: SocialMetaInput) {
  return [
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:site_name", content: siteName },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

export function jsonLd(schema: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema),
  };
}
