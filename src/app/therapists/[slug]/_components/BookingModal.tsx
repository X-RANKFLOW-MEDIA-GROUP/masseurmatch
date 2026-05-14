"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { PublicTherapist } from "@/app/_lib/directory";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const SERVICE_OPTIONS = [
  { value: "swedish", label: "Swedish Massage", duration: 60, price_cents: 9000 },
  { value: "deep_tissue", label: "Deep Tissue", duration: 90, price_cents: 12000 },
  { value: "sports", label: "Sports Massage", duration: 60, price_cents: 10000 },
  { value: "prenatal", label: "Prenatal Massage", duration: 60, price_cents: 9500 },
  { value: "hot_stone", label: "Hot Stone", duration: 90, price_cents: 13000 },
];

function CheckoutForm({
  clientSecret,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {paying ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function BookingModal({
  therapist,
  onClose,
}: {
  therapist: PublicTherapist;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "datetime" | "payment" | "success">("select");
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleBooking = async () => {
    if (!date || !time) { setError("Please select date and time"); return; }
    setLoading(true);
    setError(null);

    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // 1. Create appointment
    const apptRes = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        therapist_id: therapist.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        service_type: service.value,
        notes,
        location_type: "client_location",
      }),
    });

    if (!apptRes.ok) {
      const d = await apptRes.json();
      setError(d.error ?? "Could not create appointment");
      setLoading(false);
      return;
    }

    const apptData = await apptRes.json();
    setAppointmentId(apptData.appointment.id);

    // 2. Create payment intent
    const piRes = await fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: apptData.appointment.id,
        amount_cents: service.price_cents,
      }),
    });

    if (!piRes.ok) {
      const d = await piRes.json();
      setError(d.error ?? "Could not initialize payment");
      setLoading(false);
      return;
    }

    const piData = await piRes.json();
    setClientSecret(piData.client_secret);
    setStep("payment");
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Book with {therapist.display_name || therapist.full_name}</h2>
            <p className="text-sm text-gray-500">{therapist.city}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5">
          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Your {service.label} session has been booked. You&apos;ll receive a confirmation shortly.
              </p>
              <a
                href="/client/bookings"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 font-medium"
              >
                View My Bookings
              </a>
            </div>
          )}

          {/* Step: Select service */}
          {step === "select" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Choose a Service</h3>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setService(opt)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                      service.value === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.duration} min</p>
                    </div>
                    <p className="font-bold text-gray-900">${(opt.price_cents / 100).toFixed(0)}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("datetime")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step: Date & Time */}
          {step === "datetime" && (
            <div className="space-y-4">
              <button onClick={() => setStep("select")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <h3 className="font-semibold text-gray-800">Pick Date & Time</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">Select a time</option>
                  {["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any preferences, health notes, or special requests..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>{service.label}</span><span>{service.duration} min</span></div>
                <div className="flex justify-between font-bold text-gray-900 mt-1"><span>Total</span><span>${(service.price_cents / 100).toFixed(2)}</span></div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? "Creating booking..." : "Continue to Payment →"}
              </button>
            </div>
          )}

          {/* Step: Payment */}
          {step === "payment" && clientSecret && (
            <div className="space-y-4">
              <button onClick={() => setStep("datetime")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <h3 className="font-semibold text-gray-800">Complete Payment</h3>
              <div className="bg-gray-50 rounded-xl p-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600"><span>{service.label}</span><span>{date} at {time}</span></div>
                <div className="flex justify-between font-bold text-gray-900 mt-1"><span>Total</span><span>${(service.price_cents / 100).toFixed(2)}</span></div>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  amount={service.price_cents}
                  onSuccess={() => setStep("success")}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
