import React from "react";
import PropTypes from "prop-types";
import {
  PATH_KEY_TALENT_MAP,
  PATH_TALENT_CHOICES,
  KEY_TALENT_SPECIALTY_PICKS,
} from "../../globals/constants";

export default function KeyTalentTab({ startingPath, value, onSelect, skills, pick, onSelectPick }) {
  const options = PATH_TALENT_CHOICES[startingPath] || [];
  const keyTalent = PATH_KEY_TALENT_MAP[startingPath] || "";

  // helpers
  const reqText = (req = {}) =>
    Object.entries(req).map(([skill, min]) => `${skill} ≥ ${min}`).join(", ");

  const meets = (req = {}) =>
    Object.entries(req).every(([skill, min]) => (skills?.[skill] || 0) >= min);

  const pickDefs =
    KEY_TALENT_SPECIALTY_PICKS[startingPath]?.[value] || [];

  // If current pick no longer eligible (skills changed), clear it
  const eligibleNames = new Set(pickDefs.filter(d => meets(d.requires)).map(d => d.name));
  if (pick && !eligibleNames.has(pick)) {
    onSelectPick?.("");
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Key Talent - {keyTalent}</h2>

      {!startingPath ? (
        <p className="text-sm text-gray-600">Select a starting path to choose a Key Talent.</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-600">No Key Talent options defined for this path.</p>
      ) : (
        <>
          {/* Specialty */}
          <fieldset className="space-y-2 mb-4">
            <legend className="text-sm text-gray-600 mb-1">Choose your Specialty</legend>
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="key-talent-specialty"
                  value={opt}
                  checked={value === opt}
                  onChange={() => onSelect(opt)}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            ))}
          </fieldset>

          {/* Sub-pick (gated) */}
          {pickDefs.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-sm text-gray-600 mb-1">Choose one option</legend>
              {pickDefs.map(({ name, requires }) => {
                const ok = meets(requires);
                return (
                  <label key={name} className={`flex items-center gap-2 ${ok ? "" : "opacity-60"}`} title={reqText(requires)}>
                    <input
                      type="radio"
                      name="key-talent-pick"
                      value={name}
                      checked={pick === name}
                      onChange={() => onSelectPick(name)}
                      disabled={!ok}
                      className="w-4 h-4"
                    />
                    <span>{name}{requires && ` (req: ${reqText(requires)})`}</span>
                  </label>
                );
              })}
              {pickDefs.every(({ requires }) => !meets(requires)) && (
                <p className="text-xs text-amber-700 mt-1">
                  No eligible options yet. Raise {reqText(
                    pickDefs.reduce((acc, d) => ({ ...acc, ...d.requires }), {})
                  )}.
                </p>
              )}
            </fieldset>
          )}
        </>
      )}
    </div>
  );
}

KeyTalentTab.propTypes = {
  startingPath: PropTypes.string.isRequired,
  value: PropTypes.string,                 // selected specialty (e.g., "Investigator")
  onSelect: PropTypes.func.isRequired,     // (specialty) => void
  skills: PropTypes.object,                // { Deduction: 0..5, Insight: 0..5, ... }
  pick: PropTypes.string,                  // selected sub-pick (e.g., "Watchful Eye")
  onSelectPick: PropTypes.func,            // (pick) => void
};
