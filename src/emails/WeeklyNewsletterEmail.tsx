import {
  Button,
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import BaseLayout from "./components/BaseLayout";

interface TherapistHighlight {
  id: string;
  name: string;
  city: string;
  region?: string;
  specialty: string;
  profileUrl: string;
  imageUrl?: string;
  availableMinutesLeft?: number;
  badge?: string;
}

interface FavoriteAvailability {
  therapistName: string;
  city: string;
  profileUrl: string;
  wasAvailableAt: string;
}

interface WeeklyNewsletterEmailProps {
  appUrl?: string;
  userName?: string;
  logoUrl?: string;
  managePreferencesUrl?: string;
  unsubscribeUrl?: string;
  availableNow?: TherapistHighlight[];
  visitingSoon?: TherapistHighlight[];
  favoritesAvailable?: FavoriteAvailability[];
}

const sectionTitleStyle =
  "text-slate-900 text-[18px] leading-[24px] font-semibold tracking-[-0.2px] m-0 mb-3";
const cardStyle = "border border-slate-200 rounded-[12px] p-4 mb-3 bg-white";
const emptyStateStyle = "text-slate-500 text-[13px] leading-[20px] m-0";

export default function WeeklyNewsletterEmail({
  appUrl = "https://masseurmatch.com",
  userName = "there",
  logoUrl = "https://masseurmatch.com/favicon.ico",
  managePreferencesUrl = "https://masseurmatch.com/client/dashboard/settings",
  unsubscribeUrl = "https://masseurmatch.com/unsubscribe",
  availableNow = [],
  visitingSoon = [],
  favoritesAvailable = [],
}: WeeklyNewsletterEmailProps) {
  const openAppUrl = `${appUrl}/search?sort=available_now`;

  return (
    <BaseLayout previewText="Your weekly MasseurMatch update with available therapists and travel highlights.">
      <Section className="mb-6">
        <Row>
          <Column>
            <Img
              alt="MasseurMatch"
              className="rounded-[8px]"
              height="36"
              src={logoUrl}
              width="36"
            />
          </Column>
          <Column align="right">
            <Text className="text-slate-500 text-[12px] uppercase tracking-[1.2px] m-0">
              Weekly update
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-slate-900 text-[26px] leading-[32px] font-semibold tracking-[-0.4px] m-0 mb-2">
        Hi, {userName}
      </Text>
      <Text className="text-slate-600 text-[14px] leading-[22px] mt-0 mb-6">
        Here are this week's availability and travel highlights from MasseurMatch.
      </Text>

      <Section className="bg-emerald-50 border border-emerald-200 rounded-[14px] px-4 py-4 mb-7">
        <Text className="text-emerald-900 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Available Now
        </Text>
        <Text className={sectionTitleStyle}>Therapists active for direct contact</Text>

        {availableNow.length > 0 ? (
          availableNow.map((therapist) => (
            <Section className={cardStyle} key={therapist.id}>
              <Row>
                {therapist.imageUrl ? (
                  <Column className="w-[68px]">
                    <Img
                      alt={therapist.name}
                      className="rounded-[10px] object-cover"
                      height="56"
                      src={therapist.imageUrl}
                      width="56"
                    />
                  </Column>
                ) : null}
                <Column>
                  <Text className="text-slate-900 text-[15px] leading-[20px] font-semibold m-0">
                    {therapist.name}
                  </Text>
                  <Text className="text-slate-600 text-[12px] leading-[18px] m-0 mb-1">
                    {therapist.specialty}
                  </Text>
                  <Text className="text-slate-500 text-[12px] m-0">
                    {therapist.city}
                    {therapist.region ? `, ${therapist.region}` : ""}
                    {therapist.availableMinutesLeft
                      ? ` • ${therapist.availableMinutesLeft} minutes left`
                      : ""}
                  </Text>
                  <Link
                    className="text-emerald-700 text-[12px] font-semibold no-underline"
                    href={therapist.profileUrl}
                  >
                    View profile
                  </Link>
                </Column>
              </Row>
            </Section>
          ))
        ) : (
          <Text className={emptyStateStyle}>
            No available-now highlights were found for this send window.
          </Text>
        )}
      </Section>

      <Section className="mb-7">
        <Text className="text-amber-700 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Visiting Soon
        </Text>
        <Text className={sectionTitleStyle}>Travel highlights in your area</Text>

        {visitingSoon.length > 0 ? (
          visitingSoon.map((therapist) => (
            <Section key={therapist.id} className={cardStyle}>
              <Row>
                {therapist.imageUrl ? (
                  <Column className="w-[68px]">
                    <Img
                      alt={therapist.name}
                      className="rounded-[10px] object-cover"
                      height="56"
                      src={therapist.imageUrl}
                      width="56"
                    />
                  </Column>
                ) : null}
                <Column>
                  <Text className="text-slate-900 text-[15px] font-semibold m-0">
                    {therapist.name}
                  </Text>
                  <Text className="text-slate-600 text-[12px] m-0 mb-1">{therapist.specialty}</Text>
                  <Text className="text-slate-500 text-[12px] m-0">
                    {therapist.badge || "Visiting soon"} in {therapist.city}
                    {therapist.region ? `, ${therapist.region}` : ""}
                  </Text>
                  <Link
                    className="text-amber-700 text-[12px] font-semibold no-underline"
                    href={therapist.profileUrl}
                  >
                    View travel details
                  </Link>
                </Column>
              </Row>
            </Section>
          ))
        ) : (
          <Text className={emptyStateStyle}>
            No travel highlights were found for this send window.
          </Text>
        )}
      </Section>

      <Section className="mb-7">
        <Text className="text-indigo-700 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Favorite Availability
        </Text>
        {favoritesAvailable.length > 0 ? (
          favoritesAvailable.map((favorite) => (
            <Section
              className="bg-indigo-50 border border-indigo-200 rounded-[10px] px-4 py-3 mb-2"
              key={`${favorite.therapistName}-${favorite.wasAvailableAt}`}
            >
              <Text className="text-slate-900 text-[13px] leading-[20px] m-0">
                <strong>{favorite.therapistName}</strong> · {favorite.city}
              </Text>
              <Text className="text-slate-600 text-[12px] m-0">
                Available at: {favorite.wasAvailableAt}
              </Text>
              <Link className="text-indigo-700 text-[12px] font-semibold" href={favorite.profileUrl}>
                Open profile
              </Link>
            </Section>
          ))
        ) : (
          <Text className={emptyStateStyle}>
            No saved favorite availability updates were found for this send window.
          </Text>
        )}
      </Section>

      <Section className="text-center bg-slate-950 rounded-[14px] px-5 py-7 mb-6">
        <Text className="text-white text-[21px] leading-[28px] tracking-[-0.3px] font-semibold m-0 mb-3">
          Ready to browse available therapists?
        </Text>
        <Text className="text-slate-300 text-[13px] leading-[20px] mt-0 mb-5">
          Open MasseurMatch to see current availability and direct contact options.
        </Text>
        <Button
          className="bg-emerald-500 text-slate-950 text-[13px] font-bold rounded-[10px] px-6 py-3"
          href={openAppUrl}
        >
          Open MasseurMatch
        </Button>
      </Section>

      <Hr className="border-slate-200 my-5" />

      <Text className="text-slate-500 text-[12px] leading-[18px] m-0">
        You received this email because you are subscribed to weekly MasseurMatch updates.
      </Text>
      <Text className="text-slate-500 text-[12px] leading-[18px] mt-2 mb-0">
        <Link className="text-slate-700 underline" href={managePreferencesUrl}>
          Manage preferences
        </Link>{" "}
        •{" "}
        <Link className="text-slate-700 underline" href={unsubscribeUrl}>
          Unsubscribe
        </Link>
      </Text>
    </BaseLayout>
  );
}
