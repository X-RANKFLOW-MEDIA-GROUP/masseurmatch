/**
 * Central redirect manifest. Mirrors next.config.mjs redirects().
 * permanent: true means Next.js serves HTTP 308, treated as permanent by search engines.
 */

export type LegacyRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

export const legacyRedirects: LegacyRedirect[] = [
  { source: "/city/dallas", destination: "/cities/dallas-tx", permanent: true },
  { source: "/city/plano", destination: "/cities/plano-tx", permanent: true },
  { source: "/city/irving", destination: "/cities/irving-tx", permanent: true },
  { source: "/city/highland-park", destination: "/cities/highland-park-tx", permanent: true },
  { source: "/city/fort-worth", destination: "/cities/fort-worth-tx", permanent: true },
  { source: "/city/houston", destination: "/cities/houston-tx", permanent: true },
  { source: "/city/austin", destination: "/cities/austin-tx", permanent: true },
  { source: "/city/los-angeles", destination: "/cities/los-angeles-ca", permanent: true },
  { source: "/city/miami", destination: "/cities/miami-fl", permanent: true },
  { source: "/city/new-york", destination: "/cities/new-york-ny", permanent: true },
  { source: "/city/chicago", destination: "/cities/chicago-il", permanent: true },
  { source: "/city/san-diego", destination: "/cities/san-diego-ca", permanent: true },
  { source: "/city/fort-lauderdale", destination: "/cities/fort-lauderdale-fl", permanent: true },
  { source: "/city/wilton-manors", destination: "/cities/wilton-manors-fl", permanent: true },
  { source: "/city/west-hollywood", destination: "/cities/west-hollywood-ca", permanent: true },
  { source: "/city/atlanta", destination: "/cities/atlanta-ga", permanent: true },
  { source: "/city/seattle", destination: "/cities/seattle-wa", permanent: true },
  { source: "/city/denver", destination: "/cities/denver-co", permanent: true },
  { source: "/city/phoenix", destination: "/cities/phoenix-az", permanent: true },
  { source: "/dallas", destination: "/cities/dallas-tx", permanent: true },
  { source: "/plano", destination: "/cities/plano-tx", permanent: true },
  { source: "/irving", destination: "/cities/irving-tx", permanent: true },
  { source: "/highland-park", destination: "/cities/highland-park-tx", permanent: true },
  { source: "/fort-worth", destination: "/cities/fort-worth-tx", permanent: true },
  { source: "/houston", destination: "/cities/houston-tx", permanent: true },
  { source: "/austin", destination: "/cities/austin-tx", permanent: true },
  { source: "/los-angeles", destination: "/cities/los-angeles-ca", permanent: true },
  { source: "/miami", destination: "/cities/miami-fl", permanent: true },
  { source: "/new-york", destination: "/cities/new-york-ny", permanent: true },
  { source: "/chicago", destination: "/cities/chicago-il", permanent: true },
  { source: "/san-diego", destination: "/cities/san-diego-ca", permanent: true },
  { source: "/fort-lauderdale", destination: "/cities/fort-lauderdale-fl", permanent: true },
  { source: "/wilton-manors", destination: "/cities/wilton-manors-fl", permanent: true },
  { source: "/west-hollywood", destination: "/cities/west-hollywood-ca", permanent: true },
  { source: "/atlanta", destination: "/cities/atlanta-ga", permanent: true },
  { source: "/seattle", destination: "/cities/seattle-wa", permanent: true },
  { source: "/denver", destination: "/cities/denver-co", permanent: true },
  { source: "/phoenix", destination: "/cities/phoenix-az", permanent: true },
  { source: "/dallas/lgbtq-friendly", destination: "/cities/dallas-tx/gay-massage", permanent: true },
  { source: "/dallas/male-therapists", destination: "/cities/dallas-tx/male-massage", permanent: true },
  { source: "/dallas/wellness/deep-tissue", destination: "/cities/dallas-tx/deep-tissue", permanent: true },
  { source: "/dallas/wellness/outcall", destination: "/cities/dallas-tx/outcall", permanent: true },
  { source: "/dallas/wellness/incall", destination: "/cities/dallas-tx/incall", permanent: true },
  { source: "/dallas/wellness/swedish", destination: "/cities/dallas-tx/swedish", permanent: true },
  { source: "/dallas/wellness/sports-recovery", destination: "/cities/dallas-tx/sports-massage", permanent: true },
  { source: "/dallas/wellness/mobile-massage", destination: "/cities/dallas-tx/mobile", permanent: true },
  { source: "/dallas/wellness/hotel-massage", destination: "/cities/dallas-tx/hotel", permanent: true },
  { source: "/massage-therapists", destination: "/therapists", permanent: true },
];

export const REDIRECTS_BY_SOURCE: ReadonlyMap<string, string> = new Map(
  legacyRedirects.map(({ source, destination }) => [source, destination]),
);
