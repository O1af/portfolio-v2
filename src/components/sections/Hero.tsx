import { AnimatePresence, motion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import { Image } from "@unpic/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { personalInfo, socialLinks } from "@/components/Info";

const EMERGENCE_VIDEO_ID = "16W7c0mb-rE";
const EMERGENCE_VIDEO_URL = `https://www.youtube.com/watch?v=${EMERGENCE_VIDEO_ID}`;

function HoverVideoLink({
  href,
  videoId,
  children,
}: {
  href: string;
  videoId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setOpen(true);
  };

  const hide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  return (
    <span
      onMouseEnter={show}
      onMouseLeave={hide}
      {...stylex.props(styles.hoverWord)}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onFocus={show}
        onBlur={hide}
        {...stylex.props(styles.hoverLink)}
      >
        {children}
      </a>
      <AnimatePresence>
        {open && (
          <span {...stylex.props(styles.preview)} aria-hidden="true">
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              {...stylex.props(styles.previewMotion)}
            >
              <span {...stylex.props(styles.previewCard)}>
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt=""
                  {...stylex.props(styles.previewThumb)}
                />
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${videoId}`}
                  title="Emergence – How Stupid Things Become Smart Together"
                  allow="autoplay; encrypted-media"
                  tabIndex={-1}
                  {...stylex.props(styles.previewFrame)}
                />
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-label="Watch Emergence on YouTube"
                  {...stylex.props(styles.previewHit)}
                />
              </span>
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Bio() {
  const [before, after] = personalInfo.bio.split("emergence");

  return (
    <p {...stylex.props(styles.bio)}>
      {before}
      <HoverVideoLink href={EMERGENCE_VIDEO_URL} videoId={EMERGENCE_VIDEO_ID}>
        emergence
      </HoverVideoLink>
      {after}
    </p>
  );
}

export function Hero() {
  return (
    <section id="hero" {...stylex.props(styles.section)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image
          src={personalInfo.avatarImage}
          alt={personalInfo.name}
          width={96}
          height={96}
          layout="fixed"
          loading="eager"
          fetchPriority="high"
          {...stylex.props(styles.avatar)}
        />

        <h1 {...stylex.props(styles.heading)}>
          Hi, I'm {personalInfo.name.split(" ")[0]}
        </h1>

        <Bio />

        <div {...stylex.props(styles.links)}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.link)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const styles = stylex.create({
  section: {
    scrollMarginTop: "6rem",
  },
  avatar: {
    width: "6rem",
    height: "6rem",
    borderRadius: "9999px",
    borderWidth: "1px",
    borderColor: "var(--border)",
    objectFit: "cover",
  },
  heading: {
    marginTop: "1.5rem",
    color: "var(--foreground)",
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    fontWeight: 600,
    letterSpacing: "-0.025em",
  },
  bio: {
    marginTop: "0.875rem",
    color: "var(--muted-foreground)",
    fontSize: "15.5px",
    lineHeight: "1.625",
    textWrap: "pretty",
  },
  hoverWord: {
    position: "relative",
    display: "inline",
  },
  hoverLink: {
    borderRadius: "0.125rem",
    color: {
      default: "inherit",
      ":hover": "var(--foreground)",
    },
    textDecorationLine: {
      default: "underline",
      ":hover": "underline",
    },
    textDecorationStyle: "dotted",
    textUnderlineOffset: "3px",
    textDecorationColor: {
      default: "color-mix(in oklab, var(--muted-foreground) 55%, transparent)",
      ":hover": "var(--foreground)",
    },
    transitionProperty:
      "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  preview: {
    position: "absolute",
    top: "100%",
    left: {
      default: 0,
      "@media (min-width: 640px)": "50%",
    },
    zIndex: 40,
    paddingTop: "0.6rem",
    transform: {
      default: "none",
      "@media (min-width: 640px)": "translateX(-50%)",
    },
  },
  previewMotion: {
    display: "block",
    transformOrigin: "top center",
  },
  previewCard: {
    display: "block",
    position: "relative",
    overflow: "hidden",
    width: {
      default: "16rem",
      "@media (min-width: 640px)": "20rem",
    },
    aspectRatio: "16 / 9",
    borderRadius: "0.75rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    backgroundColor: "#000000",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  previewThumb: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  previewFrame: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    borderWidth: 0,
  },
  previewHit: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
  },
  links: {
    display: "flex",
    marginTop: "1.25rem",
    gap: "1.25rem",
  },
  link: {
    borderRadius: "0.125rem",
    color: {
      default: "var(--muted-foreground)",
      ":hover": "var(--foreground)",
    },
    fontSize: "13.5px",
    fontWeight: 500,
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
});
