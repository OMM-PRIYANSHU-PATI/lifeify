import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  predictFutureDiseases,
  FutureDiseasePredictorInputs,
} from "@/lib/rules/risk-scores/future-disease-predictor";
import { FutureDiseasePredictorClient } from "./future-disease-predictor-client";

export const metadata: Metadata = {
  title: "Future Disease Predictor | LIFEIFY Health OS",
  description:
    "Predict future disease onset probabilities over 5-year and 10-year horizons with real-time What-If lifestyle simulation.",
};

export default async function FutureDiseasePredictorPage() {
  const user = await getCurrentUser();

  // Baseline default parameters
  let inputs: FutureDiseasePredictorInputs = {
    age: 38,
    gender: "MALE",
    heightCm: 172,
    weightKg: 78,
    waistCircumferenceCm: 88,
    systolicBp: 128,
    diastolicBp: 82,
    restingHeartRate: 72,
    fastingGlucoseMgDl: 104,
    hba1cPercent: 5.7,
    totalCholesterolMgDl: 202,
    hdlCholesterolMgDl: 44,
    triglyceridesMgDl: 165,
    serumCreatinineMgDl: 0.9,
    familyDiabetes: "ONE_PARENT",
    familyPrematureCad: false,
    familyHypertension: true,
    familyStroke: false,
    familyCkd: false,
    dailySteps: 5200,
    sleepHours: 6.5,
    smokingStatus: "NEVER",
    alcoholFrequency: "OCCASIONAL",
    dietType: "BALANCED",
    stressLevel: 6,
    symptoms: {
      frequentThirstOrUrination: false,
      morningHeadaches: false,
      breathlessnessOnExertion: false,
      chronicJointStiffness: false,
      postMealBrainFog: true,
      unexplainedFatigue: false,
      ankleSwelling: false,
    },
  };

  if (user) {
    const profile = user.healthProfile;
    const lifestyle = user.lifestyleProfile;

    const latestBp = await prisma.vitalReading.findFirst({
      where: { userId: user.id, type: "blood_pressure" },
      orderBy: { takenAt: "desc" },
    });

    const latestGlucose = await prisma.vitalReading.findFirst({
      where: { userId: user.id, type: "glucose" },
      orderBy: { takenAt: "desc" },
    });

    const latestHr = await prisma.vitalReading.findFirst({
      where: { userId: user.id, type: "heart_rate" },
      orderBy: { takenAt: "desc" },
    });

    const famHistory = await prisma.familyMedicalHistory.findMany({
      where: { userId: user.id },
    });

    const hasFamCad = famHistory.some(
      (f) =>
        f.condition.toLowerCase().includes("heart") ||
        f.condition.toLowerCase().includes("cad") ||
        f.condition.toLowerCase().includes("infarct")
    );
    const hasFamDm = famHistory.some((f) =>
      f.condition.toLowerCase().includes("diabet")
    );
    const hasFamHtn = famHistory.some(
      (f) =>
        f.condition.toLowerCase().includes("hypertens") ||
        f.condition.toLowerCase().includes("bp")
    );

    inputs = {
      ...inputs,
      age: profile?.age || inputs.age,
      gender: profile?.sex?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
      heightCm: profile?.heightCm || profile?.height || inputs.heightCm,
      weightKg: profile?.weightKg || profile?.weight || inputs.weightKg,
      waistCircumferenceCm: inputs.waistCircumferenceCm,
      systolicBp: latestBp?.systolic
        ? Number(latestBp.systolic)
        : latestBp
        ? Number(latestBp.value)
        : inputs.systolicBp,
      diastolicBp: latestBp?.diastolic
        ? Number(latestBp.diastolic)
        : inputs.diastolicBp,
      restingHeartRate: latestHr
        ? Number(latestHr.value)
        : inputs.restingHeartRate,
      fastingGlucoseMgDl: latestGlucose
        ? Number(latestGlucose.value)
        : inputs.fastingGlucoseMgDl,
      familyDiabetes: hasFamDm ? "ONE_PARENT" : "NONE",
      familyPrematureCad: hasFamCad,
      familyHypertension: hasFamHtn,
      dailySteps: lifestyle?.stepTarget || inputs.dailySteps,
      sleepHours: lifestyle?.sleepTargetH || inputs.sleepHours,
      smokingStatus: lifestyle?.smoking ? "CURRENT" : "NEVER",
      alcoholFrequency: lifestyle?.alcohol ? "MODERATE" : "NONE",
    };
  }

  const initialReport = predictFutureDiseases(inputs);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <FutureDiseasePredictorClient
        initialInputs={inputs}
        initialReport={initialReport}
      />
    </div>
  );
}
