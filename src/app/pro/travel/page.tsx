"use client";

import { motion } from "framer-motion";
import { Plane, Car, Crosshair, Save } from "lucide-react";
import { useState } from "react";

export default function TravelAndMobilePage() {
  const [radius, setRadius] = useState(15);
  const [isTravelMode, setIsTravelMode] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-32 md:p-10">
      {/* Sticky header */}
      <div className="sticky top-4 z-30 flex flex-col justify-between gap-4 border border-slate-200/60 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-medium text-slate-900">
            Viagens &amp; Raio de Ação
          </h1>
          <p className="font-sans text-sm text-slate-500">
            Controla onde e como os clientes te encontram.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-950 px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-lg transition-colors hover:bg-slate-800 active:scale-95">
          <Save className="h-4 w-4" />
          Guardar Definições
        </button>
      </div>

      {/* Out-Call / Service Radius */}
      <section className="space-y-6 border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <Car className="h-5 w-5 text-slate-900" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="font-display text-xl font-medium text-slate-900">
                Atendimento ao Domicílio (Out-Call)
              </h2>
              <p className="mt-1 font-sans text-sm text-slate-500">
                Define a distância máxima que estás disposto a conduzir.
              </p>
            </div>

            <div className="pt-4">
              <div className="mb-2 flex justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  Service Radius
                </span>
                <span className="font-mono text-lg font-semibold text-slate-900">
                  {radius} km
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-slate-950"
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
                <span>Apenas In-Call (0km)</span>
                <span>Todo o Estado (100km+)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Mode */}
      <section
        className={`space-y-6 border p-6 shadow-sm transition-colors sm:p-8 ${
          isTravelMode
            ? "border-amber-200 bg-amber-50/50"
            : "border-slate-200/60 bg-white"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              isTravelMode ? "bg-amber-100" : "bg-slate-100"
            }`}
          >
            <Plane
              className={`h-5 w-5 ${isTravelMode ? "text-amber-700" : "text-slate-900"}`}
            />
          </div>
          <div className="flex-1 space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-xl font-medium text-slate-900">Travel Mode</h2>
                <p className="mt-1 font-sans text-sm text-slate-500">
                  Aparece nas pesquisas da tua cidade de destino antes de chegares.
                </p>
              </div>
              <button
                onClick={() => setIsTravelMode(!isTravelMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isTravelMode ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isTravelMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isTravelMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-1 gap-4 border-t border-amber-200/50 pt-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-amber-800">
                    Cidade de Destino
                  </label>
                  <div className="relative">
                    <Crosshair className="absolute left-3 top-3 h-4 w-4 text-amber-600/50" />
                    <input
                      type="text"
                      placeholder="Ex: Los Angeles, CA"
                      className="w-full border border-amber-200 bg-white p-3 pl-10 font-sans text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-amber-800">
                    Datas da Viagem
                  </label>
                  <input
                    type="text"
                    placeholder="10 Out - 15 Out"
                    className="w-full border border-amber-200 bg-white p-3 font-sans text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
