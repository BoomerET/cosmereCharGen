import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  PATH_KEY_TALENT_MAP,
  PATH_TALENT_CHOICES,
  KEY_TALENT_SPECIALTY_PICKS,
  SKILL_LIST,
} from "../../globals/constants";

const BASE_BY_SKILL = Object.fromEntries(
  SKILL_LIST.map(({ name, base }) => [name, base])
);

export default function KeyTalentTab({ startingPath, value, onSelect, pick, onSelectPick, char, }) {
  const options = PATH_TALENT_CHOICES[startingPath] || [];
  const keyTalent = PATH_KEY_TALENT_MAP[startingPath] || "";

  // helpers
  const pickDefs =
    KEY_TALENT_SPECIALTY_PICKS[startingPath]?.[value] || [];

  // If current pick no longer eligible (skills changed), clear it
  const getSkillMod = (skillName) => {
    const base = BASE_BY_SKILL[skillName];         // e.g., Deduction -> 'intellect'
    const ranks = char?.skills?.[skillName] || 0;  // ranks from SkillsList
    const stat = base ? (char?.[base] || 0) : 0;  // attribute value
    return ranks + stat;                            // <-- MOD
  };

  const reqText = (req = {}) =>
    Object.entries(req).map(([skill, min]) => `${skill} mod ≥ ${min}`).join(", ");

  const meets = (req = {}) =>
    Object.entries(req).every(([skill, min]) => getSkillMod(skill) >= min);

  useEffect(() => {
    const eligible = new Set(
      (pickDefs || []).filter(d => meets(d.requires)).map(d => d.name)
    );
    if (pick && !eligible.has(pick)) onSelectPick?.("");
  }, [pick, pickDefs, char, onSelectPick]); // re-check when char or pickDefs change


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
<fieldset className="flex flex-wrap gap-2 mb-4">
  <legend className="basis-full text-sm text-gray-600 mb-1">
    Choose your Specialty
  </legend>
  {options.map((opt) => {
    const checked = value === opt;
    return (
      <label
        key={opt}
        className={`flex items-center gap-2 p-2 rounded-lg border ${
          checked ? "hl-card" : "border-gray-300"
        }`}
      >
        <input
          type="radio"
          name="key-talent-specialty"
          value={opt}
          checked={checked}
          onChange={() => onSelect(opt)}
          className="w-4 h-4"
        />
        <span className={checked ? "hl-label" : ""}>{opt}</span>
      </label>
    );
  })}
</fieldset>
          {/* Sub-pick (gated) */}
          {pickDefs.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-sm text-gray-600 mb-1">Choose one option</legend>
              {pickDefs.map(({ name, requires }) => {
                const ok = meets(requires);
                const checked = pick === name;
                return (
                  <label
                    key={name}
                    title={reqText(requires)}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${checked ? "hl-card" : "border-gray-300"
                      } ${ok ? "" : "opacity-60"}`}
                  >
                    <input
                      type="radio"
                      name="key-talent-pick"
                      value={name}
                      checked={checked}
                      onChange={() => onSelectPick(name)}
                      disabled={!ok}
                      className="w-4 h-4"
                    />
                    <span className={checked ? "hl-label" : ""}>
                      {name}{requires && ` (req: ${reqText(requires)})`}
                    </span>
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
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  pick: PropTypes.string,
  onSelectPick: PropTypes.func,
  char: PropTypes.shape({
    skills: PropTypes.object.isRequired,
    strength: PropTypes.number,
    speed: PropTypes.number,
    intellect: PropTypes.number,
    willpower: PropTypes.number,
    awareness: PropTypes.number,
    presence: PropTypes.number,
  }).isRequired,
};
