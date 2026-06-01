import type { Metadata } from "next";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bruno – Verified Male Massage Therapist in Dallas, TX | MasseurMatch",
  description:
    "Bruno is a verified Brazilian massage therapist in Oak Lawn, Dallas TX. 14 years experience. LGBT+ welcoming. Deep Tissue, Hot Stone, Swedish, and more. Sessions from $175.",
};

export default function BrunoDallasTxPage() {
  return (
    <div className={styles.body}>
      <nav className={styles.nav}>
        <div className={styles["nav-logo"]}>
          Masseur<span>Match</span>
        </div>
        <ul className={styles["nav-links"]}>
          <li>
            <Link href="/therapists">Browse Therapists</Link>
          </li>
          <li>
            <Link href="/how-it-works">How It Works</Link>
          </li>
          <li>
            <Link href="/for-therapists">For Therapists</Link>
          </li>
        </ul>
        <Link href="/search" className={styles["nav-cta"]}>
          Find a Therapist
        </Link>
      </nav>

      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> &rsaquo;{" "}
        <Link href="/therapists">Therapists</Link> &rsaquo;{" "}
        <Link href="/search?city=Dallas%2C+TX">Dallas, TX</Link> &rsaquo;{" "}
        <span>Bruno</span>
      </div>

      <section className={styles.hero}>
        <div className={styles["hero-bg"]} />
        <div className={styles["hero-inner"]}>
          <div className={styles["photo-col"]}>
            <div className={styles["photo-frame"]}>
              <p className={styles["photo-placeholder"]}>
                Professional
                <br />
                Photo
              </p>
              <span className={styles["verified-badge"]}>
                <Check className="inline h-3.5 w-3.5" strokeWidth={2.5} /> Verified
              </span>
            </div>
            <span className={styles["photo-badge"]}>Available Now</span>
          </div>

          <div className={styles["info-col"]}>
            <div className={styles["profile-tags"]}>
              <span className={`${styles.ptag} ${styles["ptag-lgbt"]}`}>
                LGBT+ Welcoming
              </span>
              <span className={`${styles.ptag} ${styles["ptag-mobile"]}`}>
                Mobile Available
              </span>
              <span className={`${styles.ptag} ${styles["ptag-namt"]}`}>
                NAMT Member
              </span>
            </div>

            <h1>Bruno</h1>
            <p className={styles.subtitle}>
              Licensed Massage Therapist &bull; Dallas, TX &bull; Oak Lawn
            </p>

            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={styles.star}>
                  <Star className="inline h-4 w-4 fill-current" />
                </span>
              ))}
              <span className={styles["review-count"]}>(12 reviews)</span>
            </div>

            <div className={styles["quick-stats"]}>
              <div className={styles.qs}>
                <span className={styles["qs-val"]}>14</span>
                <span className={styles["qs-label"]}>Years Experience</span>
              </div>
              <div className={styles.qs}>
                <span className={styles["qs-val"]}>$175</span>
                <span className={styles["qs-label"]}>From (60 min)</span>
              </div>
              <div className={styles.qs}>
                <span className={styles["qs-val"]}>8</span>
                <span className={styles["qs-label"]}>Techniques</span>
              </div>
            </div>

            <div className={styles["hero-ctas"]}>
              <a href="tel:+17623345300" className={styles["btn-primary"]}>
                Call Now
              </a>
              <Link href="/search?city=Dallas%2C+TX" className={styles["btn-secondary"]}>
                More in Dallas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <p className={styles["seo-lead"]}>
        Bruno is a Brazilian-trained, LGBTQ+ owned and operated massage therapist based in Oak
        Lawn, Dallas TX. With 14 years of professional experience he offers Deep Tissue, Swedish,
        Hot Stone, Shiatsu, AMMA Therapy, Lymphatic Drainage, Myofascial Release, and Zero
        Balancing — available both in-studio and as mobile outcall throughout Dallas.
      </p>

      <main className="max-w-5xl mx-auto px-12 py-10 text-[#FCFBF8]">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">About Bruno</h2>
          <p className="text-[#b5c6e0] leading-relaxed">
            With 14 years of professional experience, Bruno brings a unique blend of Brazilian
            therapeutic bodywork and diverse massage modalities to every session. His practice is
            rooted in both Brazilian and American massage traditions. Based in Oak Lawn, he operates
            from a private studio with full amenities — shower, private restroom, and hot towels
            included. He also offers high-end mobile outcall services to your home or hotel
            throughout Dallas.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Services &amp; Techniques</h2>
          <ul className="list-disc ml-6 text-[#b5c6e0] space-y-1">
            <li>AMMA Therapy</li>
            <li>Deep Tissue</li>
            <li>Hot Stone</li>
            <li>Lymphatic Drainage</li>
            <li>Myofascial Release</li>
            <li>Shiatsu</li>
            <li>Swedish</li>
            <li>Zero Balancing</li>
            <li>Add-ons: Cupping Therapy (+$25), Fitness Training (+$50)</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Rates</h2>
          <ul className="text-[#b5c6e0] space-y-1">
            <li>60 min — Studio: $175 &nbsp;|&nbsp; Mobile: ask for rates</li>
            <li>90 min — Studio: $250 &nbsp;|&nbsp; Mobile: ask for rates</li>
          </ul>
          <h3 className="text-lg font-semibold mt-4 mb-2">Current Promotions</h3>
          <ul className="list-disc ml-6 text-[#b5c6e0] space-y-1">
            <li>10% off any session on Mondays</li>
            <li>$10 off any session — week of April 5</li>
            <li>Special discounts for military, law enforcement, and repeat clients</li>
          </ul>
          <h3 className="text-lg font-semibold mt-4 mb-2">Payment Methods</h3>
          <p className="text-[#b5c6e0]">
            Apple Pay, Cash, Mastercard, Venmo, Visa, Zelle
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Amenities</h2>
          <div className="grid grid-cols-2 gap-4 text-[#b5c6e0]">
            <div>
              <h3 className="font-semibold mb-1">Studio</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Bottled water</li>
                <li>Hot towels</li>
                <li>Private restroom</li>
                <li>Shower</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Mobile</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Hot towels</li>
                <li>Massage table</li>
                <li>Music</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Client Testimonials</h2>
          <ul className="space-y-4 text-[#b5c6e0] text-sm">
            <li className="border-l-2 border-[#FF8A1F] pl-4">
              &ldquo;Outstanding male massage with Bruno. Very skilled, attentive, and truly goes
              above and beyond. Clean, fresh-smelling space and a deeply relaxing experience. One
              of the best male massage services on MasseurMatch. I highly recommend Bruno.&rdquo;
            </li>
            <li className="border-l-2 border-[#FF8A1F] pl-4">
              &ldquo;I was in Dallas for work and booked a massage with Bruno, it was incredible!
              His warm smile, sense of humor and strong, confident hands delivered the perfect
              deep-tissue pressure. The energy was very relaxing, and I left feeling completely
              recharged. Truly one of a kind, I can&apos;t recommend Bruno enough, he&apos;s the
              best massage therapist in Dallas I&apos;ve had.&rdquo;
            </li>
            <li className="border-l-2 border-[#FF8A1F] pl-4">
              &ldquo;I&apos;ve been seeing Bruno here in Dallas for almost a year now, and
              he&apos;s hands-down the best massage therapist I&apos;ve ever found. Bruno is not
              only incredibly skilled at deep tissue and relaxation massage, but also one of the
              sweetest and most charming people you&apos;ll ever meet.&rdquo;
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Contact &amp; Availability</h2>
          <p className="text-[#b5c6e0]">
            Phone:{" "}
            <a href="tel:+17623345300" className="text-[#FF8A1F] underline">
              (762) 334-5300
            </a>
          </p>
          <p className="text-[#b5c6e0]">Available: midnight – 11 pm, every day</p>
          <p className="text-[#b5c6e0] mt-2">
            Areas served: Oak Lawn, Uptown, Highland Park, University Park, Downtown Dallas,
            Turtle Creek
          </p>
        </section>
      </main>
    </div>
  );
}
