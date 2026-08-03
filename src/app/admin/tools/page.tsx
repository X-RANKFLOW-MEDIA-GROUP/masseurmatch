import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileClock,
  FileText,
  Flag,
  HeartHandshake,
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
  Users,
  Workflow,
} from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

const sections = [
  {
    title: "People and profiles",
    description: "Manage accounts, provider profiles, photos, verification, and safety reviews.",
    items: [
      { href: "/admin/users", label: "Users", description: "Account access, emails, and admin/provider roles.", icon: Users },
      { href: "/admin/therapists", label: "Therapists", description: "Approve, suspend, feature, and maintain provider profiles.", icon: HeartHandshake },
      { href: "/admin/photos", label: "Photos", description: "Review profile photos and moderation status.", icon: ImageIcon },
      { href: "/admin/moderation", label: "Moderation", description: "Review queued or flagged profile content.", icon: ShieldAlert },
      { href: "/admin/verification", label: "Verification", description: "Manage identity and profile verification workflows.", icon: ShieldCheck },
      { href: "/admin/profile-reports", label: "Profile Reports", description: "Review reports submitted about provider profiles.", icon: Flag },
    ],
  },
  {
    title: "Communication and service",
    description: "Handle incoming requests, support conversations, and customer communication.",
    items: [
      { href: "/admin/bookings", label: "Booking Approvals", description: "Review appointment inquiries that need approval.", icon: CalendarCheck },
      { href: "/admin/sms", label: "SMS Auto-Reply", description: "Monitor SMS conversations and unresolved follow-up alerts.", icon: MessageSquare },
      { href: "/admin/tickets", label: "Tickets", description: "Work operational and customer-service tickets.", icon: MessageSquare },
      { href: "/admin/support", label: "Support", description: "Open the support operations workspace.", icon: LifeBuoy },
      { href: "/admin/migrations", label: "Imports", description: "Review profile migrations and imported reviews.", icon: Workflow },
    ],
  },
  {
    title: "Growth and content",
    description: "Control public content, discovery pages, search visibility, and editorial publishing.",
    items: [
      { href: "/admin/blog", label: "Blog", description: "Create and manage editorial content.", icon: Newspaper },
      { href: "/admin/cities", label: "Cities", description: "Manage city coverage and local landing-page content.", icon: MapPin },
      { href: "/admin/keywords", label: "Keywords", description: "Manage services, specialties, and SEO keyword surfaces.", icon: Tag },
      { href: "/admin/seo", label: "SEO", description: "Review search visibility and SEO configuration.", icon: Search },
    ],
  },
  {
    title: "Business and system",
    description: "Monitor money, reporting, audit history, legal content, and platform configuration.",
    items: [
      { href: "/admin/billing", label: "Billing", description: "Review subscriptions, plans, and billing operations.", icon: CreditCard },
      { href: "/admin/reports", label: "Reports", description: "View platform and operational reporting.", icon: BarChart3 },
      { href: "/admin/logs", label: "Logs", description: "Inspect system and administrative activity logs.", icon: FileClock },
      { href: "/admin/legal", label: "Legal", description: "Manage legal and policy content.", icon: FileText },
      { href: "/admin/settings", label: "Settings", description: "Configure platform-level administrative settings.", icon: Settings },
    ],
  },
];

const backgroundServices = [
  { label: "Lifecycle email campaigns", detail: "Post-signup and lifecycle campaign runners with an email queue." },
  { label: "Resend email delivery", detail: "Shared email sender and notification delivery infrastructure." },
  { label: "Notification delivery", detail: "In-app, email, SMS, and queued push notification routing." },
  { label: "Authentication email hook", detail: "Custom account and authentication email processing." },
  { label: "City digest sender", detail: "Automated city-level digest email function." },
  { label: "Profile import automation", detail: "Import tickets, imported reviews, and migration processing." },
  { label: "SEO profile scoring", detail: "Profile completeness and index-eligibility infrastructure." },
];

export default function AdminToolsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All Admin Tools"
        description="A complete map of the administrative workspaces and background systems already created."
      />

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 text-blue-700" />
          <div>
            <h2 className="font-semibold text-blue-950">How to use this dashboard</h2>
            <p className="mt-1 text-sm leading-6 text-blue-900/80">
              Start with People and profiles for provider work, Communication and service for daily requests,
              Growth and content for public pages, and Business and system for operational oversight.
            </p>
          </div>
        </div>
      </div>

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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-secondary" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-950">{item.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-950">Background systems</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These capabilities exist in the codebase but do not all have a dedicated admin screen yet.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {backgroundServices.map((service) => (
            <div key={service.label} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900">
                {service.label.includes("email") ? <Mail className="h-4 w-4" /> : <Workflow className="h-4 w-4" />}
                <h3 className="text-sm font-semibold">{service.label}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.detail}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-700">No dedicated screen</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
