export interface SleepHygieneChecklistItem {
  id: string;
  label: string;
  category: "environmental" | "behavioral" | "circadian";
  importance: "essential" | "recommended";
}

export interface SleepPlanResult {
  targetDurationH: number;
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  caffeineCutoff: string; // HH:mm
  windDownMinutes: number;
  windDownStart: string; // HH:mm
  checklist: SleepHygieneChecklistItem[];
}

export function generateSleepPlan(
  targetWakeTime: string = "06:30",
  cycles: 4 | 5 | 6 = 5 // 5 cycles = 7.5 hrs (recommended adult)
): SleepPlanResult {
  const durationHours = cycles * 1.5; // 6h, 7.5h, or 9h

  const [wakeH, wakeM] = targetWakeTime.split(":").map(Number);
  const totalWakeMinutes = wakeH * 60 + wakeM;

  // Bedtime is wakeTime - (durationHours * 60) - 15 mins sleep latency
  let totalBedMinutes = totalWakeMinutes - (durationHours * 60 + 15);
  if (totalBedMinutes < 0) totalBedMinutes += 24 * 60;

  const bedH = Math.floor(totalBedMinutes / 60);
  const bedM = totalBedMinutes % 60;
  const bedtime = `${String(bedH).padStart(2, "0")}:${String(bedM).padStart(2, "0")}`;

  // Caffeine cutoff: bedtime - 9 hours (540 mins)
  let totalCaffeineMinutes = totalBedMinutes - 540;
  if (totalCaffeineMinutes < 0) totalCaffeineMinutes += 24 * 60;
  const caffH = Math.floor(totalCaffeineMinutes / 60);
  const caffM = totalCaffeineMinutes % 60;
  const caffeineCutoff = `${String(caffH).padStart(2, "0")}:${String(caffM).padStart(2, "0")}`;

  // Wind-down start: bedtime - 45 mins
  let totalWindDown = totalBedMinutes - 45;
  if (totalWindDown < 0) totalWindDown += 24 * 60;
  const windH = Math.floor(totalWindDown / 60);
  const windM = totalWindDown % 60;
  const windDownStart = `${String(windH).padStart(2, "0")}:${String(windM).padStart(2, "0")}`;

  const checklist: SleepHygieneChecklistItem[] = [
    {
      id: "screen_cutoff",
      label: "Turn off all phone, laptop, and TV screens 45 minutes before bedtime.",
      category: "behavioral",
      importance: "essential",
    },
    {
      id: "caffeine_cutoff",
      label: `Avoid coffee, black tea, energy drinks, and chocolate after ${caffeineCutoff}.`,
      category: "circadian",
      importance: "essential",
    },
    {
      id: "temperature_control",
      label: "Keep the bedroom temperature cool (ideally 18°C – 21°C).",
      category: "environmental",
      importance: "recommended",
    },
    {
      id: "dark_environment",
      label: "Sleep in pitch darkness using blackout curtains or an eye mask.",
      category: "environmental",
      importance: "essential",
    },
    {
      id: "morning_sunlight",
      label: "Get 10–15 minutes of outdoor natural sunlight within 1 hour of waking.",
      category: "circadian",
      importance: "essential",
    },
    {
      id: "consistency",
      label: "Maintain the same wake-up time on weekends within a 30-minute window.",
      category: "circadian",
      importance: "essential",
    },
  ];

  return {
    targetDurationH: durationHours,
    bedtime,
    wakeTime: targetWakeTime,
    caffeineCutoff,
    windDownMinutes: 45,
    windDownStart,
    checklist,
  };
}

/**
 * Calculates sleep consistency score (0 - 100%) from recorded wake/sleep times.
 */
export function calculateSleepConsistency(
  records: { bedtime: string; wakeTime: string }[],
  targetBedtime: string,
  targetWakeTime: string
): number {
  if (records.length === 0) return 0;

  const [tBedH, tBedM] = targetBedtime.split(":").map(Number);
  const [tWakeH, tWakeM] = targetWakeTime.split(":").map(Number);
  const targetBedMin = tBedH * 60 + tBedM;
  const targetWakeMin = tWakeH * 60 + tWakeM;

  let consistentDays = 0;

  for (const r of records) {
    const [bH, bM] = r.bedtime.split(":").map(Number);
    const [wH, wM] = r.wakeTime.split(":").map(Number);
    const bMin = bH * 60 + bM;
    const wMin = wH * 60 + wM;

    // Within 30 mins window of target
    const bedDiff = Math.abs(bMin - targetBedMin);
    const wakeDiff = Math.abs(wMin - targetWakeMin);

    if (bedDiff <= 30 && wakeDiff <= 30) {
      consistentDays++;
    }
  }

  return Math.round((consistentDays / records.length) * 100);
}
