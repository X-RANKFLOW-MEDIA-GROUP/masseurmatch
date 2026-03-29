import Link from "next/link";
import { getSessionUser } from "@/mm/lib/session";
import { Button, ButtonLink } from "@/mm/components/primitives";

export async function SiteHeader() {
  const session = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-2xl text-foreground">
          MasseurMatch
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/explore" className="transition hover:text-foreground focus:text-foreground">
            Explore
          </Link>
          <Link href="/therapists" className="transition hover:text-foreground focus:text-foreground">
            Therapists
          </Link>
          <Link href="/cities" className="transition hover:text-foreground focus:text-foreground">
            Cities
          </Link>
          <Link href="/blog" className="transition hover:text-foreground focus:text-foreground">
            Blog
          </Link>
          <Link href="/for-therapists" className="transition hover:text-foreground focus:text-foreground">
            For Therapists
          </Link>
          <Link href="/how-it-works" className="transition hover:text-foreground focus:text-foreground">
            How it Works
          </Link>
          <Link href="/trust" className="transition hover:text-foreground focus:text-foreground">
            Trust & Safety
          </Link>
          <Link href="/faq" className="transition hover:text-foreground focus:text-foreground">
            FAQ
          </Link>
          <Link href="/contact" className="transition hover:text-foreground focus:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{session.fullName}</span>
              <ButtonLink href={session.role === "admin" ? "/admin" : "/pro/dashboard"} variant="secondary">
                {session.role === "admin" ? "Admin" : "Dashboard"}
              </ButtonLink>
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="ghost">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Log in
              </ButtonLink>
              <ButtonLink href="/register">Sign up</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
