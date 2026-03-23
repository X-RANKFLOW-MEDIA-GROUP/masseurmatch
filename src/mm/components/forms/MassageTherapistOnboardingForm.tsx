"use client";
import React, { useState } from 'react';
import { MASSAGE_THERAPIST_ONBOARDING_STEPS } from '../../forms/steps';
import { StepBasics } from './StepBasics';
import { StepLocation } from './StepLocation';
import { StepAppointmentTypes } from './StepAppointmentTypes';
import { StepServices } from './StepServices';
import { StepPricing } from './StepPricing';
import { StepAvailability } from './StepAvailability';
import { StepTravel } from './StepTravel';
import { StepProfessionalInfo } from './StepProfessionalInfo';
import { StepContact } from './StepContact';
import { StepPhotos } from './StepPhotos';
import { StepTrust } from './StepTrust';
import { StepSEO } from './StepSEO';

const STEP_COMPONENTS: Record<string, React.FC<any>> = {
  basics: StepBasics,
  location: StepLocation,
  appointment_types: StepAppointmentTypes,
  services: StepServices,
  pricing: StepPricing,
  availability: StepAvailability,
  travel: StepTravel,
  professional_info: StepProfessionalInfo,
  contact: StepContact,
  photos: StepPhotos,
  trust: StepTrust,
  seo: StepSEO,
};

export function MassageTherapistOnboardingForm({ initialValues = {}, onSubmit }: {
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const StepComponent = STEP_COMPONENTS[MASSAGE_THERAPIST_ONBOARDING_STEPS[step].key];

  const handleChange = (field: string, value: any) => {
    setValues(v => ({ ...v, [field]: value }));
  };

  const handleNext = () => {
    if (step < MASSAGE_THERAPIST_ONBOARDING_STEPS.length - 1) setStep(s => s + 1);
    else if (onSubmit) onSubmit(values);
  };
  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{MASSAGE_THERAPIST_ONBOARDING_STEPS[step].label}</h2>
      <StepComponent values={values} onChange={handleChange} />
      <div className="flex justify-between mt-6">
        <button type="button" onClick={handleBack} disabled={step === 0} className="btn">Back</button>
        <button type="submit" className="btn btn-primary">{step === MASSAGE_THERAPIST_ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </form>
  );
}
