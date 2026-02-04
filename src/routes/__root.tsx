import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { siteUrl, personalInfo, socialUrls } from '@/components/Info'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/pfp.png' },
      { rel: 'canonical', href: siteUrl },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: personalInfo.name,
          url: siteUrl,
          publisher: {
            '@type': 'Person',
            name: personalInfo.name,
            url: siteUrl,
            sameAs: [socialUrls.github, socialUrls.linkedin],
          },
        }),
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
