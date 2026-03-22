import { Text, Button, Section, Row, Column, Img, Link } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

// Interfaces for the dynamic data your backend will inject
interface Therapist {
  name: string;
  specialty: string;
  image: string;
  url: string;
}

interface Promotion {
  title: string;
  discount: string;
  therapistName: string;
  url: string;
}

interface Event {
  day: string;
  month: string;
  title: string;
  location: string;
  url: string;
}

interface Article {
  title: string;
  readTime: string;
  url: string;
}

interface CityDigestEmailProps {
  subscriberName?: string;
  cityName?: string;
  newTherapists?: Therapist[];
  promotions?: Promotion[];
  localEvents?: Event[];
  articles?: Article[];
}

export default function CityDigestEmail({
  subscriberName = "Alex",
  cityName = "Dallas",
  // Mock Data for perfect preview testing
  newTherapists = [
    { name: "Julian K.", specialty: "Sports Recovery & Deep Tissue", image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop", url: "https://masseurmatch.com/therapists/julian-k" },
    { name: "Marcus V.", specialty: "Holistic Relaxation", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop", url: "https://masseurmatch.com/therapists/marcus-v" }
  ],
  promotions = [
    { title: "Double Recovery Session", discount: "20% OFF", therapistName: "Julian K.", url: "https://masseurmatch.com/promotions/julian-k" }
  ],
  localEvents = [
    { day: "12", month: "OCT", title: "Oak Lawn Wellness Mixer", location: "Turtle Creek Park", url: "#" },
    { day: "15", month: "OCT", title: "LGBTQ+ Health Panel", location: "Dallas Community Center", url: "#" }
  ],
  articles = [
    { title: "5 Signs Your Muscles Need Deep Tissue Work", readTime: "4 min", url: "https://masseurmatch.com/blog/deep-tissue-signs" }
  ]
}: CityDigestEmailProps) {
  return (
    <BaseLayout previewText={`Your wellness radar for ${cityName} has arrived.`}>
      
      {/* Digest Header */}
      <Section className="mb-8 border-b border-slate-200 pb-4">
        <Row>
          <Column>
            <Text className="text-slate-500 text-xs uppercase tracking-widest m-0">
              The {cityName} Digest
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-emerald-600 font-mono text-[10px] uppercase tracking-widest m-0 font-semibold bg-emerald-50 px-2 py-1 rounded-sm inline-block">
              City Exclusive
            </Text>
          </Column>
        </Row>
      </Section>

      <Text className="text-slate-900 text-2xl font-medium mb-6 tracking-tight">
        Hello, {subscriberName}. Here is your curated weekly selection for {cityName}.
      </Text>

      {/* BLOCK 1: New in Town (Therapists) */}
      <Section className="mb-10">
        <Text className="text-slate-900 font-display text-xl font-medium mb-4 border-l-2 border-slate-900 pl-3">
          New Additions in {cityName}
        </Text>
        
        {newTherapists.map((therapist, index) => (
          <Section key={index} className="bg-slate-50 border border-slate-200 p-4 mb-4 rounded-md">
            <Row>
              <Column className="w-20">
                <Img src={therapist.image} alt={therapist.name} width="64" height="64" className="rounded-full object-cover shadow-sm" />
              </Column>
              <Column className="pl-2">
                <Text className="text-slate-900 font-sans text-base font-semibold m-0">{therapist.name}</Text>
                <Text className="text-slate-500 font-sans text-sm m-0 mb-2">{therapist.specialty}</Text>
                <Link href={therapist.url} className="text-indigo-600 font-sans text-sm font-semibold hover:text-indigo-800">
                  View Profile &rarr;
                </Link>
              </Column>
            </Row>
          </Section>
        ))}
        <Section className="text-center mt-4">
          <Button href={`https://masseurmatch.com/cities/${cityName.toLowerCase()}`} className="bg-white text-slate-900 border border-slate-300 px-6 py-2 rounded-md text-xs font-semibold tracking-wide hover:bg-slate-50">
            View all in {cityName}
          </Button>
        </Section>
      </Section>

      {/* BLOCK 2: Exclusive Promotions */}
      <Section className="mb-10 bg-slate-950 text-white p-8 rounded-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 blur-[40px] pointer-events-none" />
        <Text className="text-indigo-400 font-mono text-[10px] uppercase tracking-widest m-0 mb-2">Member Perks</Text>
        <Text className="text-white font-display text-xl font-medium m-0 mb-4">Weekly Exclusives</Text>
        
        {promotions.map((promo, index) => (
          <Row key={index} className="bg-white/10 border border-white/20 p-4 rounded-md mb-4">
            <Column>
              <Text className="text-white font-sans text-base font-semibold m-0">{promo.title}</Text>
              <Text className="text-slate-400 font-sans text-sm m-0">with {promo.therapistName}</Text>
            </Column>
            <Column align="right">
              <Button href={promo.url} className="bg-emerald-500 text-white px-4 py-2 rounded-md text-xs font-bold tracking-wide">
                {promo.discount}
              </Button>
            </Column>
          </Row>
        ))}
      </Section>

      {/* BLOCK 3: LGBTQ+ Community Events */}
      <Section className="mb-10">
        <Text className="text-slate-900 font-display text-xl font-medium mb-4 border-l-2 border-slate-900 pl-3">
          Culture & Community
        </Text>
        
        {localEvents.map((event, index) => (
          <Row key={index} className="mb-4 border-b border-slate-100 pb-4">
            {/* Brutalist Calendar Block */}
            <Column className="w-16 pr-4">
              <div className="bg-slate-100 border border-slate-200 text-center rounded-sm overflow-hidden">
                <div className="bg-slate-900 text-white font-mono text-[9px] uppercase tracking-widest py-1">
                  {event.month}
                </div>
                <div className="text-slate-900 font-display text-xl font-bold py-1">
                  {event.day}
                </div>
              </div>
            </Column>
            <Column>
              <Text className="text-slate-900 font-sans text-sm font-semibold m-0 mb-1">{event.title}</Text>
              <Text className="text-slate-500 font-sans text-xs m-0 mb-1">📍 {event.location}</Text>
              <Link href={event.url} className="text-indigo-600 font-sans text-xs hover:underline">Event Details</Link>
            </Column>
          </Row>
        ))}
      </Section>

      {/* BLOCK 4: The Wellness Journal (Blog) */}
      <Section className="mb-8">
        <Text className="text-slate-900 font-display text-xl font-medium mb-4 border-l-2 border-slate-900 pl-3">
          The Wellness Journal
        </Text>
        {articles.map((article, index) => (
          <Section key={index} className="mb-4">
            <Link href={article.url} className="text-slate-800 hover:text-indigo-600 font-sans text-sm font-medium block mb-1">
              {article.title}
            </Link>
            <Text className="text-slate-400 font-mono text-[10px] uppercase tracking-widest m-0">
              Read time: {article.readTime}
            </Text>
          </Section>
        ))}
      </Section>

    </BaseLayout>
  );
}
