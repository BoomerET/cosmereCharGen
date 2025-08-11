import React, { useEffect, useMemo, useState } from "react";

/**
 * HeaderForm.jsx
 *
 * - Highlights Awareness, Intellect, and Speed when Chosen Path is "Agent"
 * - Auto-populates Key Talent from Chosen Path
 * - Exposes derived `totalTalents` (1 if Key Talent exists, else 0) via onChange
 *
 * Props (optional):
 *  - initialValues: {
 *      name, level, path, keyTalent,
 *      attributes: { Strength, Speed, Intellect, Willpower, Awareness, Presence }
 *    }
 *  - onChange(formState) -> void  (called whenever form state changes)
 */

const PATH_TO_KEY_TALENT = {
  Agent: "Opportunist",
  Envoy: "Rousing Presence",
  Hunter: "Seek Quarry",
  Leader: "Decisive Command",
  Scholar: "Erudition",
  Warrior: "Vigilant Stance",
};

const DEFAULT_ATTRIBUTES = {
  Strength: 0,
  Speed: 0,
  Intellect: 0,
  Willpower: 0,
  Awareness: 0,
  Presence: 0,
};

export default function HeaderForm({
  initialValues,
  onChange,
}) {
  const [form, setForm] = useState(() => ({
    name: initialValues?.name ?? "",
    level: Number.isFinite(Number(initialValues?.level))
      ? Number(initialValues.level)
      : 1,
    path: initialValues?.path ?? "",
    keyTalent: initialValues?.keyTalent ?? "",
    attributes: { ...DEFAULT_ATTRIBUTES, ...(initialValues?.attributes || {}) },
  }));

  const isAgent = form.path === "Agent";
  const agentHighlights = useMemo(
    () => new Set(["Awareness", "Intellect", "Speed"]),
    []
  );

  // Keep Key Talent in sync with Chosen Path
  useEffect(() => {
    const mapped = PATH_TO_KEY_TALENT[form.path] || "";
    if (mapped !== form.keyTalent) {
      setForm((prev) => ({ ...prev, keyTalent: mapped }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.path]);

  // Derived: totalTalents (for FG XML export elsewhere)
  const totalTalents = form.keyTalent ? 1 : 0;

  // Bubble state upward whenever it changes
  useEffect(() => {
    if (typeof onChange === "function") {
      onChange?.({ ...form, totalTalents });
    }
  }, [form, totalTalents, onChange]);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateAttr = (attr, value) =>
    setForm((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: Number(value) || 0 },
    }));

  const attributeInput = (attrName) => {
    const highlight = isAgent && agentHighlights.has(attrName);
    return (
      <label
        key={attrName}
        className={`flex items-center justify-between gap-3 rounded-xl border p-3
        ${highlight ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50" : "border-gray-300"}
      `}
      >
        <span className="text-sm font-medium">{attrName}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="w-24 rounded-md border border-gray-300 p-2 text-right"
          value={form.attributes[attrName]}
          onChange={(e) => updateAttr(attrName, e.target.value)}
        />
      </label>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Character Name</span>
          <input
            type="text"
            className="rounded-md border border-gray-300 p-2"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Kael Thorn"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Level</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            className="rounded-md border border-gray-300 p-2"
            value={form.level}
            onChange={(e) => updateField("level", Number(e.target.value) || 1)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Chosen Path</span>
          <select
            className="rounded-md border border-gray-300 p-2"
            value={form.path}
            onChange={(e) => updateField("path", e.target.value)}
          >
            <option value="">Select a path…</option>
            <option value="Agent">Agent</option>
            <option value="Envoy">Envoy</option>
            <option value="Hunter">Hunter</option>
            <option value="Leader">Leader</option>
            <option value="Scholar">Scholar</option>
            <option value="Warrior">Warrior</option>
          </select>
        </label>
      </div>

      {/* Key Talent (auto) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-1 md:col-span-1">
          <span className="text-sm font-medium">Key Talent</span>
          <input
            type="text"
            className="rounded-md border border-gray-300 p-2 bg-gray-50"
            value={form.keyTalent}
            onChange={(e) => updateField("keyTalent", e.target.value)}
            placeholder="Auto-set from Chosen Path"
          />
          <span className="text-xs text-gray-500">
            Auto-filled based on Chosen Path (editable if needed).
          </span>
        </label>

        {/* Derived field (hidden in UI but available to parent via onChange) */}
        <div className="hidden">
          <input type="number" value={totalTalents} readOnly />
        </div>
      </div>

      {/* Attributes */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">Attributes</h3>
          {isAgent && (
            <span className="text-xs font-medium text-amber-700">
              Agent path selected — Awareness, Intellect, and Speed highlighted
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Awareness",
            "Intellect",
            "Speed",
            "Strength",
            "Willpower",
            "Presence",
          ].map(attributeInput)}
        </div>
      </section>
    </div>
  );
}

