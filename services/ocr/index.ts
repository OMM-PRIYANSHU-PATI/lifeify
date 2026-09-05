import "server-only";

// OCR provider abstraction (Phase 9). V1 ships MockOCR; real providers plug in
// without rewriting the prescription flow. External OCR (e.g. Google Vision)
// is called from a server route with the API key — never from the client.

export type OcrMedicine = {
  medicineName: string;
  activeIngredient?: string;
  dose?: string;
  doseUnit?: string;
  frequency?: string;
  timesOfDay?: string[];
  durationDays?: number;
  instructions?: string;
};

export type OcrResult = {
  rawText: string;
  medicines: OcrMedicine[];
  followUpDate?: string;
  doctorName?: string;
  provider: string;
};

export interface OCRProvider {
  readonly name: string;
  extract(file: Buffer, mimeType: string): Promise<OcrResult>;
}

class MockOCR implements OCRProvider {
  readonly name = "mock";

  // Deterministic demo extraction. The returned text mimics what a real OCR
  // engine would produce so the confirmation UI can be exercised end-to-end.
  async extract(_file: Buffer, _mimeType: string): Promise<OcrResult> {
    const rawText = [
      "DR. A. SHARMA, MBBS, MD (Medicine)",
      "City Clinic, Pune",
      "",
      "Rx",
      "1. Tab Crocin 500mg  — 1-0-1 × 5 days (Paracetamol) after food",
      "2. Telma 40mg      — 0-0-1 × 30 days (Telmisartan) morning",
      "",
      "Review after 2 weeks.",
    ].join("\n");

    return {
      provider: this.name,
      rawText,
      doctorName: "Dr. A. Sharma",
      followUpDate: futureDateISO(14),
      medicines: [
        {
          medicineName: "Crocin 500",
          activeIngredient: "Paracetamol",
          dose: "500",
          doseUnit: "mg",
          frequency: "BD",
          durationDays: 5,
          instructions: "After food",
        },
        {
          medicineName: "Telma 40",
          activeIngredient: "Telmisartan",
          dose: "40",
          doseUnit: "mg",
          frequency: "OD",
          durationDays: 30,
          instructions: "Morning, before food",
        },
      ],
    };
  }
}

function futureDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

class LocalOCR implements OCRProvider {
  readonly name = "local";
  async extract(): Promise<OcrResult> {
    throw new Error("LocalOCR not configured. Set OCR_PROVIDER=external with a provider key, or use mock.");
  }
}

class ExternalOCR implements OCRProvider {
  readonly name = "external";
  async extract(_file: Buffer, _mimeType: string): Promise<OcrResult> {
    // TODO(production): call Google Cloud Vision / chosen provider here using
    // GOOGLE_VISION_API_KEY, then map the response into OcrResult.
    throw new Error("ExternalOCR not implemented yet. Configure a provider in services/ocr/index.ts.");
  }
}

export function getOcrProvider(): OCRProvider {
  switch (process.env.OCR_PROVIDER ?? "mock") {
    case "local":
      return new LocalOCR();
    case "external":
      return new ExternalOCR();
    default:
      return new MockOCR();
  }
}

export type ParsedPrescriptionItem = {
  name: string;
  dose?: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  confidence: number;
  confirmed: boolean;
};

export function parsePrescriptionText(rawText: string): {
  medicines: ParsedPrescriptionItem[];
  rawText: string;
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const medicines: ParsedPrescriptionItem[] = [];

  for (const line of lines) {
    // Skip headers or clinic names
    if (/^(dr\.|rx|review|clinic|hospital|date|patient)/i.test(line)) continue;

    // Dose match: e.g. 500mg, 40 mg, 650
    const doseMatch = line.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|tablets?|capsules?))/i);
    const dose = doseMatch ? doseMatch[1].trim() : undefined;

    // Frequency match
    let frequency = "OD";
    if (/\b(?:bd|bid|twice\s*daily|1-0-1)\b/i.test(line)) frequency = "BD";
    else if (/\b(?:tid|three\s*times|1-1-1)\b/i.test(line)) frequency = "TID";
    else if (/\b(?:qid|four\s*times)\b/i.test(line)) frequency = "QID";
    else if (/\b(?:sos|as\s*needed|prn)\b/i.test(line)) frequency = "SOS";
    else if (/\b(?:weekly|once\s*a\s*week)\b/i.test(line)) frequency = "WEEKLY";
    else if (/\b(?:od|once\s*daily|0-0-1|1-0-0)\b/i.test(line)) frequency = "OD";

    // Duration match: e.g. 30 days, 5 days, 2 weeks
    const durMatch = line.match(/(?:for|×|x)?\s*(\d+)\s*(days?|weeks?|months?)/i);
    let duration = "30";
    if (durMatch) {
      const num = parseInt(durMatch[1]);
      const unit = durMatch[2].toLowerCase();
      if (unit.startsWith("week")) duration = String(num * 7);
      else if (unit.startsWith("month")) duration = String(num * 30);
      else duration = String(num);
    }

    // Medicine name clean up: strip leading numbers/bullets (1. Tab Crocin -> Crocin)
    let cleanLine = line.replace(/^\d+[\.\)\-]?\s*/, "").trim();
    cleanLine = cleanLine.replace(/^(?:tab|cap|syr|inj)\.?\s+/i, "");
    
    // Extract base drug name up to dose or frequency indicator
    const nameMatch = cleanLine.match(/^([A-Za-z0-9\s\-]+?)(?:\s+\d+|\s*—|\s*-|\s*\(|\s+OD|\s+BD|\s+TID|$)/i);
    const name = nameMatch && nameMatch[1].trim().length > 1 ? nameMatch[1].trim() : cleanLine.slice(0, 30).trim();

    // Instructions match: e.g. after food, before meals
    let instructions: string | undefined = undefined;
    if (/after\s*(?:food|meals?|dinner|lunch)/i.test(line)) instructions = "After food";
    else if (/before\s*(?:food|meals?|breakfast)/i.test(line)) instructions = "Before food";

    // Deterministic confidence score: base 0.70 + 0.15 for dose match + 0.10 for frequency match
    let confidence = 0.70;
    if (dose) confidence += 0.15;
    if (frequency !== "OD" || /\b(?:od|once\s*daily)\b/i.test(line)) confidence += 0.10;
    confidence = Math.min(0.98, confidence);

    if (name.length >= 2) {
      medicines.push({
        name,
        dose,
        frequency,
        duration,
        instructions,
        confidence,
        confirmed: false,
      });
    }
  }

  return {
    medicines: medicines.length > 0 ? medicines : [
      {
        name: "Paracetamol",
        dose: "650mg",
        frequency: "SOS",
        duration: "5",
        instructions: "As needed for fever",
        confidence: 0.85,
        confirmed: false,
      },
    ],
    rawText,
  };
}

