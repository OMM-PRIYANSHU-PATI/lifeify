/**
 * Pure deterministic rule-based natural language intent parser for voice health logging.
 * Zero AI / ML — runs entirely on regular expressions, tokenization, and domain dictionaries.
 */

export interface ParsedVoiceIntent {
  intent: "water" | "steps" | "vital_bp" | "vital_glucose" | "sleep" | "weight" | "medication" | "mood" | "unknown";
  confidence: number;
  data: Record<string, unknown>;
  summary: string;
}

export function parseVoiceTranscript(rawText: string): ParsedVoiceIntent {
  const text = rawText.trim().toLowerCase();

  // 1. WATER LOGGING
  // Patterns: "drank 2 glasses of water", "had 500ml water", "water 300 ml"
  const waterMlMatch = text.match(/(?:drank|had|logged|water)\s*(\d+)\s*(?:ml|milliliters?)/i) ||
                       text.match(/(\d+)\s*(?:ml|milliliters?)\s*(?:of\s*)?water/i);
  if (waterMlMatch) {
    const ml = Number(waterMlMatch[1]);
    return {
      intent: "water",
      confidence: 0.95,
      data: { type: "water", value: ml, unit: "ml" },
      summary: `Log ${ml} ml of water intake`,
    };
  }

  const waterGlassMatch = text.match(/(?:drank|had|logged)?\s*(\d+)\s*(?:glass|glasses|cup|cups)\s*(?:of\s*)?water/i);
  if (waterGlassMatch) {
    const glasses = Number(waterGlassMatch[1]);
    const ml = glasses * 250; // standard 250ml per glass
    return {
      intent: "water",
      confidence: 0.95,
      data: { type: "water", value: ml, unit: "ml", glasses },
      summary: `Log ${glasses} glasses (${ml} ml) of water intake`,
    };
  }

  // 2. BLOOD PRESSURE
  // Patterns: "bp is 120 over 80", "blood pressure 130/85", "bp 125 82"
  const bpMatch = text.match(/(?:bp|blood\s*pressure)(?:\s*is)?\s*(\d{2,3})\s*(?:over|\/|\s)\s*(\d{2,3})/i);
  if (bpMatch) {
    const sys = Number(bpMatch[1]);
    const dia = Number(bpMatch[2]);
    return {
      intent: "vital_bp",
      confidence: 0.98,
      data: { vitalType: "BP", systolic: sys, diastolic: dia, unit: "mmHg" },
      summary: `Record Blood Pressure reading: ${sys}/${dia} mmHg`,
    };
  }

  // 3. BLOOD GLUCOSE
  // Patterns: "blood sugar is 110", "glucose 95 fasting", "sugar 140"
  const glucoseMatch = text.match(/(?:blood\s*sugar|glucose|sugar)(?:\s*is)?\s*(\d{2,3})/i);
  if (glucoseMatch) {
    const val = Number(glucoseMatch[1]);
    const isFasting = text.includes("fasting");
    const isPostMeal = text.includes("post") || text.includes("after meal") || text.includes("pp");
    const context = isFasting ? "fasting" : isPostMeal ? "post_meal" : "random";
    return {
      intent: "vital_glucose",
      confidence: 0.95,
      data: { vitalType: "GLUCOSE", value: val, unit: "mg/dL", context },
      summary: `Record Blood Glucose reading: ${val} mg/dL (${context})`,
    };
  }

  // 4. STEPS
  // Patterns: "walked 8500 steps", "did 10000 steps today", "steps 6000"
  const stepsMatch = text.match(/(?:walked|did|logged|steps)?\s*(\d{3,6})\s*steps/i) ||
                     text.match(/steps\s*(?:is|are)?\s*(\d{3,6})/i);
  if (stepsMatch) {
    const count = Number(stepsMatch[1]);
    return {
      intent: "steps",
      confidence: 0.95,
      data: { type: "steps", value: count, unit: "count" },
      summary: `Log ${count.toLocaleString()} steps`,
    };
  }

  // 5. SLEEP
  // Patterns: "slept 7 hours", "slept 8.5 hours last night", "7 hours sleep"
  const sleepMatch = text.match(/(?:slept|sleep)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*hours?/i) ||
                     text.match(/(\d+(?:\.\d+)?)\s*hours?\s*(?:of\s*)?sleep/i);
  if (sleepMatch) {
    const hours = Number(sleepMatch[1]);
    return {
      intent: "sleep",
      confidence: 0.95,
      data: { type: "sleep_duration", value: hours, unit: "hours" },
      summary: `Log ${hours} hours of sleep`,
    };
  }

  // 6. WEIGHT
  // Patterns: "weight is 72.5 kg", "weighed 68 kilos", "weight 75"
  const weightMatch = text.match(/(?:weight|weighed)(?:\s*is)?\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kgs?)?/i);
  if (weightMatch) {
    const kg = Number(weightMatch[1]);
    return {
      intent: "weight",
      confidence: 0.92,
      data: { type: "weight", value: kg, unit: "kg" },
      summary: `Log weight reading: ${kg} kg`,
    };
  }

  // 7. MEDICATION DOSE
  // Patterns: "took paracetamol", "took metformin 500mg", "taken aspirin"
  const medMatch = text.match(/(?:took|taken|had\s*my)\s*([a-zA-Z0-9\s]+?)(?:\s*dose|\s*tablet|\s*pill|\s*$)/i);
  if (medMatch) {
    const medName = medMatch[1].trim();
    if (medName.length > 2) {
      return {
        intent: "medication",
        confidence: 0.9,
        data: { medicineName: medName, status: "taken" },
        summary: `Mark dose as taken: "${medName}"`,
      };
    }
  }

  // 8. MOOD
  const moodMap: Record<string, number> = {
    great: 5,
    excellent: 5,
    happy: 5,
    good: 4,
    fine: 3,
    okay: 3,
    tired: 2,
    exhausted: 2,
    sad: 2,
    anxious: 2,
    terrible: 1,
    awful: 1,
  };

  for (const [k, score] of Object.entries(moodMap)) {
    if (text.includes(k)) {
      return {
        intent: "mood",
        confidence: 0.85,
        data: { type: "mood", score, label: k },
        summary: `Log mood as "${k}" (Score: ${score}/5)`,
      };
    }
  }

  return {
    intent: "unknown",
    confidence: 0,
    data: {},
    summary: `Could not determine exact health intent for: "${rawText}". Please edit manually.`,
  };
}

export function parseVoiceCommand(rawText: string) {
  const parsed = parseVoiceTranscript(rawText);
  return {
    action: `log_${parsed.intent}`,
    data: {
      ...parsed.data,
      amountMl: parsed.data.value,
      medicineName: (parsed.data as any).name || (parsed.data as any).medicineName,
    },
    confidence: parsed.confidence,
    summary: parsed.summary,
  };
}

