"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/settings";

interface ProfileInitial {
  name: string;
  phone: string;
  age: number;
  sex: string;
  heightCm: number;
  weightKg: number;
  bloodGroup: string;
  dietType: string;
  activityLevel: string;
  sleepTargetH: number;
  waterTargetMl: number;
  stepTarget: number;
}

export function ProfileEditorForm({ initial }: { initial: ProfileInitial }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.ok && (
        <div className="rounded-2xl bg-primary-soft p-3 text-sm text-primary-dark border border-primary/30">
          {state.message}
        </div>
      )}
      {state?.error && (
        <div className="rounded-2xl bg-crisis-soft p-3 text-sm text-crisis border border-crisis/30">
          {state.error}
        </div>
      )}

      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="lif-label">Full Name</label>
            <input
              id="name"
              name="name"
              defaultValue={initial.name}
              required
              className="lif-input"
            />
          </div>

          <div>
            <label className="lif-label">Phone Number</label>
            <input
              type="text"
              disabled
              value={initial.phone}
              className="lif-input bg-surface-subtle text-ink-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="age" className="lif-label">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              defaultValue={initial.age}
              required
              className="lif-input"
            />
          </div>

          <div>
            <label htmlFor="sex" className="lif-label">Biological Sex</label>
            <select id="sex" name="sex" defaultValue={initial.sex} className="lif-input">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="heightCm" className="lif-label">Height (cm)</label>
            <input
              id="heightCm"
              name="heightCm"
              type="number"
              min={50}
              max={260}
              defaultValue={initial.heightCm}
              className="lif-input"
            />
          </div>

          <div>
            <label htmlFor="weightKg" className="lif-label">Weight (kg)</label>
            <input
              id="weightKg"
              name="weightKg"
              type="number"
              min={20}
              max={300}
              step="0.5"
              defaultValue={initial.weightKg}
              className="lif-input"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-line">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-3">Lifestyle & Daily Targets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dietType" className="lif-label">Dietary Preference</label>
            <select id="dietType" name="dietType" defaultValue={initial.dietType} className="lif-input">
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
              <option value="EGGETARIAN">Eggetarian</option>
              <option value="VEGAN">Vegan</option>
            </select>
          </div>

          <div>
            <label htmlFor="activityLevel" className="lif-label">Activity Level</label>
            <select id="activityLevel" name="activityLevel" defaultValue={initial.activityLevel} className="lif-input">
              <option value="SEDENTARY">Sedentary (mostly sitting)</option>
              <option value="LIGHT">Lightly active</option>
              <option value="MODERATE">Moderately active</option>
              <option value="ACTIVE">Very active</option>
              <option value="ATHLETE">Athlete / Heavy training</option>
            </select>
          </div>

          <div>
            <label htmlFor="stepTarget" className="lif-label">Daily Step Target</label>
            <input
              id="stepTarget"
              name="stepTarget"
              type="number"
              min={1000}
              max={30000}
              step="500"
              defaultValue={initial.stepTarget}
              className="lif-input"
            />
          </div>

          <div>
            <label htmlFor="waterTargetMl" className="lif-label">Daily Water Target (ml)</label>
            <input
              id="waterTargetMl"
              name="waterTargetMl"
              type="number"
              min={500}
              max={6000}
              step="250"
              defaultValue={initial.waterTargetMl}
              className="lif-input"
            />
          </div>

          <div>
            <label htmlFor="sleepTargetH" className="lif-label">Daily Sleep Target (hours)</label>
            <input
              id="sleepTargetH"
              name="sleepTargetH"
              type="number"
              min={4}
              max={12}
              step="0.5"
              defaultValue={initial.sleepTargetH}
              className="lif-input"
            />
          </div>

          <div>
            <label htmlFor="bloodGroup" className="lif-label">Blood Group (optional)</label>
            <input
              id="bloodGroup"
              name="bloodGroup"
              type="text"
              placeholder="e.g. O+, B+"
              defaultValue={initial.bloodGroup}
              className="lif-input"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="lif-btn-primary disabled:opacity-50"
        >
          {isPending ? "Saving changes..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
