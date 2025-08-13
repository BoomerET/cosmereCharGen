import React from "react";
import PropTypes from "prop-types";
import { PATH_KEY_TALENT_MAP, PATH_TALENT_CHOICES } from "../../globals/constants";

export default function KeyTalentTab({ startingPath, value, onSelect }) {
  const options = PATH_TALENT_CHOICES[startingPath] || [];
  const keyTalent = PATH_KEY_TALENT_MAP[startingPath] || "";

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Key Talent - {keyTalent}</h2>

      {!startingPath ? (
        <p className="text-sm text-gray-600">
          Select a starting path to choose a Key Talent.
        </p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-600">
          No Key Talent options defined for this path.
        </p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-sm text-gray-600 mb-1">
            Choose your Specialty
          </legend>
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="key-talent"
                value={opt}
                checked={value === opt}
                onChange={() => onSelect(opt)}
                className="w-4 h-4"
              />
              <span>{opt}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}

KeyTalentTab.propTypes = {
  startingPath: PropTypes.string.isRequired,
  value: PropTypes.string,           // current selection
  onSelect: PropTypes.func.isRequired,
};

