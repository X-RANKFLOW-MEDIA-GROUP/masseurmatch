import type { ProfileViewModel } from "./profile-utils";

export function ProfileStats({ profile }: { profile: ProfileViewModel }) {
  const stats = [["Experience", profile.yearsExperience], ["Languages", profile.languages.join(", ")], ["Body type", profile.bodyType], ["Height", profile.height], ["Weight", profile.weight], ["Gender", profile.gender], ["Orientation", profile.orientation], ["Ethnicity", profile.ethnicity], ["Views", profile.viewsCount], ["Favorites", profile.favoritesCount]];
  return <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.035] p-4"><dt className="text-xs uppercase tracking-[0.2em] text-[#64748B]">{label}</dt><dd className="mt-2 text-sm font-medium text-[#F8FAFC]">{value}</dd></div>)}</dl>;
}
