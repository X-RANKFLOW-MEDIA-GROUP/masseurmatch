"use client";

import { motion } from "framer-motion";
import { Calendar, User, Clock, BookmarkPlus } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/components/animations/MicroInteractions";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  category: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

export function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <motion.article
      className={`group overflow-hidden rounded-xl border border-border hover:border-brand-electric/30 transition-all bg-card/40 backdrop-blur-sm hover:shadow-lg ${
        featured ? "md:col-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className={`flex flex-col ${featured ? "md:flex-row" : ""}`}>
        {/* Image */}
        <div
          className={`overflow-hidden bg-gradient-to-br from-brand-primary/20 to-brand-electric/20 ${
            featured
              ? "md:w-1/2 h-64 md:h-auto"
              : "w-full h-48"
          }`}
        >
          <motion.img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          />
          {post.featured && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-accent text-white text-xs font-semibold">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col justify-between p-6 ${featured ? "md:w-1/2" : ""}`}>
          <div>
            {/* Category & Meta */}
            <div className="flex items-center justify-between mb-3">
              <motion.div
                className="inline-block px-3 py-1 rounded-full bg-brand-electric/10 text-brand-electric text-xs font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                {post.category}
              </motion.div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{post.readingTime} min</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <motion.h3
              className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-brand-primary transition-colors line-clamp-2"
              whileHover={{ x: 4 }}
            >
              {post.title}
            </motion.h3>

            {/* Excerpt */}
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <motion.span
                  key={tag}
                  className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                  whileHover={{ scale: 1.05 }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-secondary to-brand-electric flex items-center justify-center text-white text-xs font-bold">
                {post.author.charAt(0)}
              </div>
              <div className="text-sm">
                <div className="font-medium text-foreground">{post.author}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <motion.button
              className="p-2 rounded hover:bg-muted transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title="Save post"
            >
              <BookmarkPlus size={18} className="text-muted-foreground hover:text-brand-primary" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function BlogGrid({ posts, limit }: { posts: BlogPost[]; limit?: number }) {
  const displayPosts = limit ? posts.slice(0, limit) : posts;
  const featured = displayPosts.filter((p) => p.featured)[0];
  const regular = displayPosts.filter((p) => !p.featured);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {featured && (
        <motion.div variants={fadeInUp} className="md:col-span-2 lg:col-span-3">
          <BlogPostCard post={featured} featured={true} />
        </motion.div>
      )}
      {regular.map((post) => (
        <motion.div key={post.id} variants={fadeInUp}>
          <BlogPostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function BlogPostDetail({ post }: { post: BlogPost }) {
  return (
    <motion.article
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Hero Image */}
      <motion.div
        className="w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Header */}
      <motion.div className="mb-8" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div
          className="flex items-center gap-2 mb-4"
          variants={fadeInUp}
        >
          <motion.div className="px-3 py-1 rounded-full bg-brand-electric/10 text-brand-electric text-xs font-semibold">
            {post.category}
          </motion.div>
          <span className="text-xs text-muted-foreground">{post.readingTime} min read</span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-foreground mb-4"
          variants={fadeInUp}
        >
          {post.title}
        </motion.h1>

        <motion.div
          className="flex flex-wrap items-center gap-6 text-muted-foreground"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2">
            <User size={16} />
            <span className="text-sm">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="text-sm">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="text-sm">{post.readingTime} minutes</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="prose prose-invert max-w-none mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>

        {post.content && (
          <div
            className="text-foreground leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </motion.div>

      {/* Tags */}
      <motion.div
        className="flex flex-wrap gap-3 py-6 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {post.tags.map((tag) => (
          <motion.a
            key={tag}
            href={`/blog?tag=${tag}`}
            className="px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
          >
            #{tag}
          </motion.a>
        ))}
      </motion.div>
    </motion.article>
  );
}
