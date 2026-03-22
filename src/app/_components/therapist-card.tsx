"use client";

import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TherapistCardProps {
  id: string;
  name: string;
  specialty: string;
  price: number;
  distance: number;
  rating: number;
  imageUrl: string;
}

export default function TechLuxuryTherapistCard({
  id, name, specialty, price, distance, rating, imageUrl
}: TherapistCardProps) {
  return (
    <Link href={`/therapists/${id}`} className="block group">
      <motion.div 
        whileHover={{ y: -4 }}
        className="flex flex-col bg-white border border-slate-200/60 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        {/* Image Wrapper with Ken Burns Effect */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100">
          <Image 
            src={imageUrl} 
            alt={`Photo of ${name}`}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Floating Rating Badge (Mono) */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-slate-900 fill-slate-900" />
            <span className="font-mono text-xs font-semibold text-slate-900">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="space-y-1">
            {/* Name (Space Grotesk) */}
            <h3 className="font-display text-xl font-medium text-slate-900 group-hover:text-slate-600 transition-colors">
              {name}
            </h3>
            {/* Specialty (Inter) */}
            <p className="font-sans text-sm text-slate-500 font-light">
              {specialty}
            </p>
          </div>

          <div className="h-px w-full bg-slate-100 my-1" />

          {/* Technical Data Footer (JetBrains Mono) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] tracking-wider uppercase">{distance} km</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-semibold text-slate-900">${price}</span>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest ml-1">/hr</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}