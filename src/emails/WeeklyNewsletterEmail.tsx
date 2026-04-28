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

export default function WeeklyNewsletterEmail({
  appUrl = "https://masseurmatch.com",
  userName = "there",
  logoUrl = "https://masseurmatch.com/favicon.ico",
  managePreferencesUrl = "https://masseurmatch.com/client/dashboard/settings",
  unsubscribeUrl = "https://masseurmatch.com/unsubscribe",
  availableNow = [
    {
      id: "1",
      name: "Rafael S.",
      city: "Miami",
      region: "FL",
      specialty: "Deep Tissue + Sports Recovery",
      profileUrl: "https://masseurmatch.com/therapists/rafael-s",
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=320&auto=format&fit=crop",
      availableMinutesLeft: 58,
      badge: "Available Now",
    },
    {
      id: "2",
      name: "Daniel M.",
      city: "Austin",
      region: "TX",
      specialty: "Relaxation + Stretch Therapy",
      profileUrl: "https://masseurmatch.com/therapists/daniel-m",
      imageUrl:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=320&auto=format&fit=crop",
      availableMinutesLeft: 42,
      badge: "Available Now",
    },
  ],
  visitingSoon = [
    {
      id: "3",
      name: "Thiago V.",
      city: "Orlando",
      region: "FL",
      specialty: "Trigger Point + Mobility",
      profileUrl: "https://masseurmatch.com/therapists/thiago-v",
      imageUrl:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=320&auto=format&fit=crop",
      badge: "Visiting Soon",
    },
    {
      id: "4",
      name: "Lucas A.",
      city: "Tampa",
      region: "FL",
      specialty: "Myofascial Release",
      profileUrl: "https://masseurmatch.com/therapists/lucas-a",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=320&auto=format&fit=crop",
      badge: "Visiting Soon",
    },
  ],
  favoritesAvailable = [
    {
      therapistName: "Marcelo P.",
      city: "Fort Lauderdale",
      profileUrl: "https://masseurmatch.com/therapists/marcelo-p",
      wasAvailableAt: "Today at 9:20 AM",
    },
    {
      therapistName: "Henrique L.",
      city: "Miami Beach",
      profileUrl: "https://masseurmatch.com/therapists/henrique-l",
      wasAvailableAt: "Yesterday at 7:45 PM",
    },
  ],
}: WeeklyNewsletterEmailProps) {
  const openAppUrl = `${appUrl}/search?sort=available_now`;

  return (
    <BaseLayout previewText="Sua newsletter semanal com os melhores matches disponíveis.">
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
              Sua newsletter semanal
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-slate-900 text-[26px] leading-[32px] font-semibold tracking-[-0.4px] m-0 mb-2">
        Olá, {userName} 👋
      </Text>
      <Text className="text-slate-600 text-[14px] leading-[22px] mt-0 mb-6">
        Curadoria da semana para acelerar seus agendamentos com perfis verificados
        perto de você.
      </Text>

      <Section className="bg-emerald-50 border border-emerald-200 rounded-[14px] px-4 py-4 mb-7">
        <Text className="text-emerald-900 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Available Now Agora
        </Text>
        <Text className={sectionTitleStyle}>Ativos neste momento para reserva rápida</Text>

        {availableNow.map((therapist) => (
          <Section className={cardStyle} key={therapist.id}>
            <Row>
              <Column className="w-[68px]">
                <Img
                  alt={therapist.name}
                  className="rounded-[10px] object-cover"
                  height="56"
                  src={therapist.imageUrl}
                  width="56"
                />
              </Column>
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
                    ? ` • ${therapist.availableMinutesLeft} min restantes`
                    : ""}
                </Text>
                <Link
                  className="text-emerald-700 text-[12px] font-semibold no-underline"
                  href={therapist.profileUrl}
                >
                  Ver perfil →
                </Link>
              </Column>
            </Row>
          </Section>
        ))}
      </Section>

      <Section className="mb-7">
        <Text className="text-amber-700 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Visiting Your Area Soon
        </Text>
        <Text className={sectionTitleStyle}>Travel System detectou visitas na sua região</Text>

        {visitingSoon.map((therapist) => (
          <Section key={therapist.id} className={cardStyle}>
            <Row>
              <Column className="w-[68px]">
                <Img
                  alt={therapist.name}
                  className="rounded-[10px] object-cover"
                  height="56"
                  src={therapist.imageUrl}
                  width="56"
                />
              </Column>
              <Column>
                <Text className="text-slate-900 text-[15px] font-semibold m-0">
                  {therapist.name}
                </Text>
                <Text className="text-slate-600 text-[12px] m-0 mb-1">{therapist.specialty}</Text>
                <Text className="text-slate-500 text-[12px] m-0">
                  {therapist.badge} em {therapist.city}
                  {therapist.region ? `, ${therapist.region}` : ""}
                </Text>
                <Link
                  className="text-amber-700 text-[12px] font-semibold no-underline"
                  href={therapist.profileUrl}
                >
                  Acompanhar agenda de viagem →
                </Link>
              </Column>
            </Row>
          </Section>
        ))}
      </Section>

      <Section className="mb-7">
        <Text className="text-indigo-700 text-[11px] uppercase tracking-[1.3px] font-bold m-0 mb-2">
          Seus Favoritos estiveram disponíveis
        </Text>
        {favoritesAvailable.map((favorite) => (
          <Section
            className="bg-indigo-50 border border-indigo-200 rounded-[10px] px-4 py-3 mb-2"
            key={`${favorite.therapistName}-${favorite.wasAvailableAt}`}
          >
            <Text className="text-slate-900 text-[13px] leading-[20px] m-0">
              <strong>{favorite.therapistName}</strong> · {favorite.city}
            </Text>
            <Text className="text-slate-600 text-[12px] m-0">
              Disponível em: {favorite.wasAvailableAt}
            </Text>
            <Link className="text-indigo-700 text-[12px] font-semibold" href={favorite.profileUrl}>
              Abrir perfil →
            </Link>
          </Section>
        ))}
      </Section>

      <Section className="text-center bg-slate-950 rounded-[14px] px-5 py-7 mb-6">
        <Text className="text-white text-[21px] leading-[28px] tracking-[-0.3px] font-semibold m-0 mb-3">
          Pronto para reservar agora?
        </Text>
        <Text className="text-slate-300 text-[13px] leading-[20px] mt-0 mb-5">
          Abra o app/site e veja quem está ativo perto de você neste exato momento.
        </Text>
        <Button
          className="bg-emerald-500 text-slate-950 text-[13px] font-bold rounded-[10px] px-6 py-3"
          href={openAppUrl}
        >
          Abrir MasseurMatch agora
        </Button>
      </Section>

      <Hr className="border-slate-200 my-5" />

      <Text className="text-slate-500 text-[12px] leading-[18px] m-0">
        Você recebeu este email por estar inscrito em comunicações semanais.
      </Text>
      <Text className="text-slate-500 text-[12px] leading-[18px] mt-2 mb-0">
        <Link className="text-slate-700 underline" href={managePreferencesUrl}>
          Gerenciar preferências
        </Link>{" "}
        •{" "}
        <Link className="text-slate-700 underline" href={unsubscribeUrl}>
          Unsubscribe
        </Link>
      </Text>
    </BaseLayout>
  );
}
