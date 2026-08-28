import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Beaker,
  CreditCard,
  FileClock,
  FileSearch,
  FileText,
  Flag,
  ImageIcon,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tag,
  UserRoundCog,
  Users,
  Workflow,
} from "lucide-react";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

const sections = [
  {
    title: "People and profiles",
    description: "Accounts, public profiles, moderation, verification and safety.",
    items: [
      { href: "/admin/people", label: "People CRM", description: "Manage accounts, plans, access, profiles and photos from one workspace.", icon: Users },
      { href: "/admin/profile-cms", label: "Profile CMS", description: "Edit and batch-maintain provider profile data.", icon: UserRoundCog },
      { href: "/admin/photos", label: "Photo Approvals", description: "Review uploads, moderation results and primary photos.", icon: ImageIcon },
      { href: "/admin/moderation", label: "Profile Approvals", description: "Approve or reject profiles waiting for review.", icon: ShieldAlert },
      { href: "/admin/verification", label: "Verification", description: "Operate identity and profile verification workflows.", icon: ShieldCheck },
      { href: "/admin/profile-reports", label: "Profile Reports", description: "Investigate reports submitted about public profiles.", icon: Flag },
      { href: "/admin/complaints", label: "Complaints", description: "Resolve client complaints and document administrative action.", icon: FileSearch },
    ],
  },
  {
    title: "Communication and service",
    description: "Outbound messages, requests, support and import operations.",
    items: [
      { href: "/admin/emails", label: "Email Center", description: "Create compliant templates and queued campaigns with live delivery totals.", icon: Mail },
      { href: "/admin/tickets", label: "Tickets", description: "Work operational and customer-service tickets.", icon: MessageSquare },
      { href: "/admin/support", label: "Support", description: "Open the support operations workspace.", icon: LifeBuoy },
      { href: "/admin/sms", label: "SMS Auto-Reply", description: "Monitor SMS conversations and unresolved follow-ups.", icon: MessageSquare },
      { href: "/admin/migrations", label: "Profile Imports", description: "Review external profile imports and retain historical review records privately.", icon: Workflow },
    ],
  },
  {
    title: "Growth and content",
    description: "Publishing, discovery, search visibility and experimentation.",
    items: [
      { href: "/admin/blog", label: "Blog", description: "Create and manage editorial content.", icon: Newspaper },
      { href: "/admin/cities", label: "Cities", description: "Manage city coverage and local landing pages.", icon: MapPin },
      { href: "/admin/keywords", label: "Keywords", description: "Maintain service, specialty and SEO keyword surfaces.", icon: Tag },
      { href: "/admin/seo", label: "SEO", description: "Review search visibility and indexing configuration.", icon: Search },
      { href: "/admin/analytics", label: "Analytics", description: "Inspect provider, market and platform performance.", icon: BarChart3 },
      { href: "/admin/ab-tests", label: "A/B Tests", description: "Review profile-field experiments and rollout controls.", icon: Beaker },
    ],
  },
  {
    title: "Business and system",
    description: "Revenue, reporting, audit history, legal content and configuration.",
    items: [
      { href: "/admin/billing", label: "Billing", description: "Review subscriptions, plans and billing operations.", icon: CreditCard },
      { href: "/admin/reports", label: "Reports", description: "View platform and operational reporting.", icon: BarChart3 },
      { href: "/admin/audit-log", label: "Audit Log", description: "Trace profile and administrative changes.", icon: FileClock },
      { href: "/admin/logs", label: "System Logs", description: "Inspect runtime and administrative activity logs.", icon: FileClock },
      { href: "/admin/legal", label: "Legal", description: "Manage legal and policy content.", icon: FileText },
      { href: "/admin/settings", label: "Settings", description: "Configure platform-level administrative settings.", icon: Settings },
    ],
  },
];

export default function AdminToolsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All Admin Tools"
        description="A complete map of the active administrative workspaces in MasseurMatch."
      />

      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-secondary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-secondary" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950">{item.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
