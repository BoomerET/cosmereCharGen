import React from 'react';
import PropTypes from 'prop-types';
import {
  ARMOR_EXPERTISE_OPTIONS,
  CULTURAL_EXPERTISE_OPTIONS,
  UTILILTY_EXPERTISE_OPTIONS,
  WEAPON_EXPERTISE_OPTIONS,
} from '../../globals/constants';

// Normalize culture "Listeners" -> expertise label "Listener"
const normalizeCultureToExpertise = (c) => (c === 'Listeners' ? 'Listener' : c);

export default function ExpertiseList({ char, onToggle }) {
  // Locked by culture: exactly the cultures selected (normalized),
  // but only if that normalized value exists in the CULTURAL_EXPERTISE_OPTIONS list.
  const lockedSet = new Set(
    (char.cultures || [])
      .map(normalizeCultureToExpertise)
      .filter((c) => CULTURAL_EXPERTISE_OPTIONS.includes(c))
  );

  // Player-chosen extras and cap
  const selectedExtras = new Set(char.expertise || []);
  const selectedExtrasCount = selectedExtras.size;
  const maxExtras = Math.max(0, Number(char.intellect) || 0);
  const atCap = selectedExtrasCount >= maxExtras;

  const renderGroup = (title, options, markCultureLocked = false) => (
    <div key={title} className="mb-5">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isLocked = markCultureLocked && lockedSet.has(opt);
          const isSelected = isLocked || selectedExtras.has(opt);
          const isDisabled = isLocked || (!isSelected && atCap);

          return (
            <label key={opt} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {
                  if (isDisabled && !isSelected) return; // block at cap
                  if (!isLocked) onToggle(opt);
                }}
                className="w-4 h-4 border rounded"
              />
              <span>
                {opt}
                {isLocked ? ' (Culture)' : ''}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Expertise</h2>
      <p className="mb-1 font-medium">
        Pick up to {maxExtras} additional expertise (plus your 2 Cultural Expertise)
      </p>
      <p className="mb-3 text-sm text-gray-600">{selectedExtrasCount} / {maxExtras} chosen</p>

      {renderGroup('Armor Expertise', ARMOR_EXPERTISE_OPTIONS)}
      {renderGroup('Cultural Expertise', CULTURAL_EXPERTISE_OPTIONS, true)}
      {renderGroup('Utility Expertise', UTILILTY_EXPERTISE_OPTIONS)}
      {renderGroup('Weapon Expertise', WEAPON_EXPERTISE_OPTIONS)}
    </div>
  );
}

ExpertiseList.propTypes = {
  char: PropTypes.shape({
    intellect: PropTypes.number.isRequired,
    cultures: PropTypes.arrayOf(PropTypes.string).isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};
