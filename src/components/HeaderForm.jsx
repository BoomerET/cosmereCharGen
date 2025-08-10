import React from "react";
import PropTypes from "prop-types";
import { CULTURE_OPTIONS, STARTING_PATHS } from "../../globals/constants";

export default function HeaderForm({ char, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium mb-1">
          Player Name
        </label>
        <input
          id="playerName"
          name="playerName"
          placeholder="Player Name"
          value={char.playerName}
          onChange={onChange}
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label htmlFor="characterName" className="block text-sm font-medium mb-1">
          Character Name
        </label>
        <input
          id="characterName"
          name="characterName"
          placeholder="Character Name"
          value={char.characterName}
          onChange={onChange}
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label htmlFor="ancestry" className="block text-sm font-medium mb-1">
          Ancestry
        </label>
        <select
          id="ancestry"
          name="ancestry"
          value={char.ancestry}
          onChange={onChange}
          className="border rounded p-2 w-full"
        >
          <option>Human</option>
          <option>Singer</option>
        </select>
      </div>

      <div>
        <label htmlFor="startingPath" className="block text-sm font-medium mb-1">
          Starting Path
        </label>
        <select
          id="startingPath"
          name="startingPath"
          value={char.startingPath}
          onChange={onChange}
          required
          aria-invalid={char.startingPath === ''}
          className="border rounded p-2 w-full"
        >
          <option value="" disabled>— Select a Starting Path —</option>
          {STARTING_PATHS.map((path) => (
            <option key={path} value={path}>{path}</option>
          ))}
        </select>
        {char.startingPath === '' && (
          <p className="mt-1 text-xs text-red-600">Please select a starting path.</p>
        )}
      </div>

      <div>
        <label htmlFor="cultures" className="block text-sm font-medium mb-1">
          Cultural Expertise (Pick 2)
        </label>
        <select
          id="cultures"
          name="cultures"
          multiple
          value={char.cultures}
          onChange={onChange}
          className="border rounded p-2 w-full"
        >
          {CULTURE_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium mb-1">
          Level
        </label>
        <input
          id="level"
          name="level"
          type="number"
          min="1"
          value={char.level}
          onChange={onChange}
          className="border rounded p-2 w-full"
        />
      </div>
    </div>
  );
}

HeaderForm.propTypes = {
  char: PropTypes.shape({
    playerName: PropTypes.string.isRequired,
    characterName: PropTypes.string.isRequired,
    ancestry: PropTypes.string.isRequired,
    cultures: PropTypes.arrayOf(PropTypes.string).isRequired,
    startingPath: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

