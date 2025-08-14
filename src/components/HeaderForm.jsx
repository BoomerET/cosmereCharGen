import React, { useMemo, useState, useEffect } from "react";
import { PATH_ATTRIBUTE_HIGHLIGHTS, ANCESTRIES } from "../../globals/constants";

/**
 * Highlights attributes based on Chosen Path.
 * (Key Talent & Cultural Expertise moved to their own tabs.)
 */
const DEFAULT_ATTRIBUTES = {
  Strength: 0,
  Speed: 0,
  Intellect: 0,
  Willpower: 0,
  Awareness: 0,
  Presence: 0,
};

export default function HeaderForm({ initialValues, onChange }) {
  const [form, setForm] = useState(() => ({
    name: initialValues?.name ?? "",
    level: Number.isFinite(Number(initialValues?.level))
      ? Number(initialValues.level)
      : 1,
    path: initialValues?.path ?? "",
    attributes: { ...DEFAULT_ATTRIBUTES, ...(initialValues?.attributes || {}) },
  }));

  const highlightSet = useMemo(
    () => new Set(PATH_ATTRIBUTE_HIGHLIGHTS[form.path] || []),
    [form.path]
  );

  useEffect(() => {
    onChange?.({ ...form });
  }, [form, onChange]);

  useEffect(() => {
    setForm({
      name: initialValues?.name ?? "",
      level: Number.isFinite(Number(initialValues?.level))
        ? Number(initialValues.level)
        : 1,
      path: initialValues?.path ?? "",
      attributes: { ...DEFAULT_ATTRIBUTES, ...(initialValues?.attributes || {}) },
    });
  }, [initialValues]);


  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateAttr = (attr, value) =>
    setForm((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: Number(value) || 0 },
    }));

  const attributeInput = (attrName) => {
    const highlight = highlightSet.has(attrName);
    return (
      <label
  key={attrName}
  className={`flex items-center justify-between gap-3 rounded-xl border p-3
    ${highlight
      ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50 dark:bg-amber-900/25"
      : "border-gray-300"}
  `}
>
  <span className={`text-sm font-medium ${highlight ? "text-gray-900 dark:text-amber-50" : ""}`}>
    {attrName}
  </span>
  <input
    type="number"
    inputMode="numeric"
    min={0}
    max={3}
    className="w-24 rounded-md border border-gray-300 p-2 text-right bg-background text-foreground"
    value={form.attributes[attrName]}
    onChange={(e) => {
      let val = Number(e.target.value);
      if (Number.isNaN(val)) val = 0;
      const clamped = Math.max(0, Math.min(3, val));
      updateAttr(attrName, clamped);
    }}
  />
</label>

    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
            max={10}
            className="rounded-md border border-gray-300 p-2"
            value={form.level}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (Number.isNaN(val)) {
                val = 0; // reset if non-numeric
              }
              const clamped = Math.max(0, Math.min(3, val));
              updateField("level", clamped);
            }}
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
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Ancestry</span>
          <select
            name="ancestry"
            className="rounded-md border border-gray-300 p-2 bg-background text-foreground"
            value={form.ancestry}
            onChange={(e) => updateField("ancestry", e.target.value)}
          >
            {ANCESTRIES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      {/* Attributes */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">Attributes</h3>
          {/*
           {highlightSet.size > 0 && (
              <span className="text-xs font-medium text-amber-700">
              {form.path} path — highlighted: {Array.from(highlightSet).join(", ")}
            </span>
          )}
          */}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {[
            "Strength",
            "Speed",
            "Intellect",
            "Willpower",
            "Awareness",
            "Presence",
          ].map(attributeInput)}
        </div>
      </section>
    </div>
  );
}

