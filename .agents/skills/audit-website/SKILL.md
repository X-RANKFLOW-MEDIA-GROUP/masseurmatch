---
name: audit-website
description: Audit websites for SEO, performance, security, technical, content, and 15 other issue categories with 230+ rules using the squirrelscan CLI. Returns LLM-optimized reports with health scores, broken links, meta tag analysis, and actionable recommendations. Use to discover and assess website or webapp issues and health.
license: See LICENSE file in repository root
compatibility: Requires squirrel CLI installed and accessible in PATH
metadata:
  author: squirrelscan
  version: "1.22"
allowed-tools: Bash(squirrel:*) Read Edit Grep Glob
---

# Website Audit Skill

Audit websites for SEO, technical, content, performance and security issues using the squirrelscan cli.

squirrelscan provides a cli tool squirrel - available for macos, windows and linux. It carries out extensive website auditing
by emulating a browser, search crawler, and analyzing the website's structure and content against over 230+ rules.

It will provide you a list of issues as well as suggestions on how to fix them.

## Links 

* squirrelscan website is at [https://squirrelscan.com](https://squirrelscan.com)
* documentation (including rule references) are at [docs.squirrelscan.com](https://docs.squirrelscan.com)

You can look up the docs for any rule with this template:

https://docs.squirrelscan.com/rules/{rule_category}/{rule_id}

example:

https://docs.squirrelscan.com/rules/links/external-links

## What This Skill Does

This skill enables AI agents to audit websites for over 230 rules in 21 categories, including:

- **SEO issues**: Meta tags, titles, descriptions, canonical URLs, Open Graph tags
- **Technical problems**: Broken links, redirect chains, page speed, mobile-friendliness
- **Performance**: Page load time, resource usage, caching
- **Content quality**: Heading structure, image alt text, content analysis
- **Security**: Leaked secrets, HTTPS usage, security headers, mixed content
- **Accessibility**: Alt text, color contrast, keyboard navigation
- **Usability**: Form validation, error handling, user flow
- **Links**: Checks for broken internal and external links
- **E-E-A-T**: Expertise, Experience, Authority, Trustworthiness
- **User Experience**: User flow, error handling, form validation
- **Mobile**: Checks for mobile-friendliness, responsive design, touch-friendly elements
- **Crawlability**: Checks for crawlability, robots.txt, sitemap.xml and more
- **Schema**: Schema.org markup, structured data, rich snippets
- **Legal**: Compliance with legal requirements, privacy policies, terms of service
- **Social**: Open graph, twitter cards and validating schemas, snippets etc.
- **Url Structure**: Length, hyphens, keywords
- **Keywords**: Keyword stuffing 
- **Content**: Content structure, headings
- **Images**: Alt text, color contrast, image size, image format
- **Local SEO**: NAP consistency, geo metadata
- **Video**: VideoObject schema, accessibility

and more

The audit crawls the website, analyzes each page against audit rules, and returns a comprehensive report with:
- Overall health score (0-100)
- Category breakdowns (core SEO, technical SEO, content, security)
- Specific issues with affected URLs
- Broken link detection
- Actionable recommendations
- Rules have levels of error, warning and notice and also have a rank between 1 and 10

## When to Use

Use this skill when you need to:

- Analyze a website's health
- Debug technical SEO issues
- Fix all of the issues mentioned above
- Check for broken links
- Validate meta tags and structured data
- Generate site audit reports
- Compare site health before/after changes
- Improve website performance, accessibility, SEO, security and more.

You should re-audit as often as possible to ensure your website remains healthy and performs well. 

## Prerequisites

This skill requires the squirrel CLI installed and in PATH.

**Install:** [squirrelscan.com/download](https://squirrelscan.com/download)

**Verify:**
```bash
squirrel --version
