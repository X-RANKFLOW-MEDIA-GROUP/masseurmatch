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
    <Link href={`/therapists/${id}`} className="block group h-full">
      <motion.div 
        whileHover={{ y: -4 }}
        className="flex flex-col h-full bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
      >
        {/* Image Wrapper with Ken Burns Effect */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <Image 
            src={imageUrl} 
            alt={`Photo of ${name}`}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          {/* Floating Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5 rounded-full shadow-md">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-sm text-slate-900">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="space-y-1">
            {/* Name */}
            <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
              {name}
            </h3>
            {/* Specialty */}
            <p className="text-sm text-slate-500 font-light line-clamp-1">
              {specialty}
            </p>
          </div>

          <div className="flex-1" />

          <div className="h-px w-full bg-slate-100" />

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{distance} km</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-900">${price}</span>
              <span className="text-slate-400 ml-1">/hr</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
