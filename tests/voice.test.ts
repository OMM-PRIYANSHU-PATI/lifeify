import { describe, it, expect } from "vitest";
import { parseVoiceTranscript } from "../lib/voice/parser";

describe("Voice Natural Language Parser & Mandatory Confirmation", () => {
  it("parses water intake from glasses and ml correctly", () => {
    const resGlasses = parseVoiceTranscript("drank 2 glasses of water");
    expect(resGlasses.intent).toBe("water");
    expect(resGlasses.data.value).toBe(500); // 2 * 250ml
    expect(resGlasses.data.unit).toBe("ml");

    const resMl = parseVoiceTranscript("had 400ml water after workout");
    expect(resMl.intent).toBe("water");
    expect(resMl.data.value).toBe(400);
    expect(resMl.data.unit).toBe("ml");
  });

  it("parses blood pressure systolic and diastolic accurately", () => {
    const res = parseVoiceTranscript("bp is 120 over 80");
    expect(res.intent).toBe("vital_bp");
    expect(res.data.systolic).toBe(120);
    expect(res.data.diastolic).toBe(80);
    expect(res.data.unit).toBe("mmHg");

    const resSlash = parseVoiceTranscript("blood pressure 135/88");
    expect(resSlash.intent).toBe("vital_bp");
    expect(resSlash.data.systolic).toBe(135);
    expect(resSlash.data.diastolic).toBe(88);
  });

  it("parses blood glucose with context", () => {
    const resFasting = parseVoiceTranscript("blood sugar is 95 fasting");
    expect(resFasting.intent).toBe("vital_glucose");
    expect(resFasting.data.value).toBe(95);
    expect(resFasting.data.context).toBe("fasting");
  });

  it("parses steps and sleep hours", () => {
    const resSteps = parseVoiceTranscript("walked 7500 steps");
    expect(resSteps.intent).toBe("steps");
    expect(resSteps.data.value).toBe(7500);

    const resSleep = parseVoiceTranscript("slept 8 hours last night");
    expect(resSleep.intent).toBe("sleep");
    expect(resSleep.data.value).toBe(8);
  });

  it("falls back to unknown for unparsable statements", () => {
    const res = parseVoiceTranscript("random conversation about the weather");
    expect(res.intent).toBe("unknown");
    expect(res.confidence).toBe(0);
  });
});
