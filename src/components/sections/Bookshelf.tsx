import { motion } from "motion/react";
import { favoriteBlogs } from "@/components/Info";

export function Bookshelf() {
  return (
    <section id="bookshelf" className="scroll-mt-24 mt-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="flex items-baseline gap-2.5"
      >
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Bookshelf
        </h2>
        <span className="text-[13px] text-dim">
          Some of my favorite Engineering Blogs
        </span>
      </motion.div>

      <div className="flex flex-col">
        {favoriteBlogs.map((blog, index) => (
          <motion.a
            key={blog.href}
            href={blog.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className={`group flex items-baseline gap-2 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              index < favoriteBlogs.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-[14.5px] font-medium text-foreground group-hover:underline">
              {blog.name}
            </span>
            <span className="ml-auto text-xs text-dim">{blog.domain}</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
