// Perfil destacado de terapeuta baseado em https://rentmasseur.com/KevinOS
import { TherapistProfile } from "../../types";

const kevinOS: TherapistProfile = {
  slug: "kevin-os",
  name: "KevinOS",
  email: "SAYAGOOSORIO280192@GMAIL.COM",
  password: "Zorra2026", // Para uso interno/admin
  location: {
    city: "Carrollton",
    state: "TX",
    country: "USA",
    travelCities: ["Dallas, TX", "Irving, TX", "Frisco, TX", "Fort Worth, TX", "Richardson, TX"]
  },
  age: 33,
  ethnicity: "Latino",
  bodyType: "Muscular",
  bodyHair: "Hairy",
  heightCm: 178,
  weightKg: 80,
  style: "Muscle Guy",
  pressure: "Ask me",
  experienceYears: 8,
  health: { hiv: "Negative", prep: true },
  description: `Sou massoterapeuta certificado com mais de 8 anos de experiência. Ofereço massagem deep tissue, acupressão e massagem na cabeça. O ambiente é relaxante, com música e aromaterapia. Atendimento profissional, focado no seu bem-estar e relaxamento total.`,
  massageTypes: ["Terapêutica", "Sensual"],
  incall: true,
  outcall: true,
  photos: [
    "https://cdn.rentmasseur.com/rmass/photos/f5/0f/f50fd70e-cc9e-4aae-ba67-2b8cf08e8aab--h600.jpg",
    "https://cdn.rentmasseur.com/rmass/photos/90/f0/90f0f406-a651-448a-82fd-4168eaa17894--h600.jpg",
    "https://cdn.rentmasseur.com/rmass/photos/a4/2e/a42e138c-134d-4e64-9b6b-7678623af82d--h600.jpg",
    "https://cdn.rentmasseur.com/rmass/photos/27/8c/278c3487-9757-41ff-bd2f-3936a9b7edf2--h600.jpg",
    "https://cdn.rentmasseur.com/rmass/photos/57/d7/57d70b79-b31c-4aaa-a17c-37759f55c00f--h600.jpg"
  ],
  isFeatured: true, // Destaque na home
  isAvailableNow: true, // Preferência máxima
  reviewsCount: 58,
  rating: 5,
  profileSource: "https://rentmasseur.com/KevinOS"
};

export default kevinOS;
