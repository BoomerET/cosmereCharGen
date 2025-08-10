import React from 'react';
import PropTypes from 'prop-types';
import { EXPERTISE_OPTIONS } from '../../globals/constants';

export default function ExpertiseList({ char, onToggle }) {
  // Map cultures to matching expertise labels (e.g., "Listeners" -> "Listener")
  const normalizeCultureToExpertise = (c) => (c === 'Listeners' ? 'Listener' : c);

  // Determine which options are locked by culture expertise
  const lockedOptions = new Set(
    (char.cultures || [])
      .map(normalizeCultureToExpertise)
      .filter((c) => EXPERTISE_OPTIONS.includes(c))
  );

  // Player-chosen (non-culture) expertise count and cap
  const selectedExtrasCount = (char.expertise || []).length;
  const maxExtras = Math.max(0, Number(char.intellect) || 0);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Expertise</h2>
      <p className="mb-1 font-medium">
        Pick up to {maxExtras} additional expertise (plus your 2 Cultural Expertise)
      </p>
      <p className="mb-3 text-sm text-gray-600">{selectedExtrasCount} / {maxExtras} chosen</p>

      <div className="grid grid-cols-2 gap-2">
        {EXPERTISE_OPTIONS.map((option) => {
          const isLocked = lockedOptions.has(option);
          const isExtraSelected = (char.expertise || []).includes(option);
          const isSelected = isLocked || isExtraSelected;

          // Disable if: locked by culture OR selection cap reached and this option isn't already selected
          const atCap = selectedExtrasCount >= maxExtras;
          const isDisabled = isLocked || (!isSelected && atCap);

          return (
            <label key={option} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {
                  if (isDisabled && !isSelected) return; // block new selection at cap
                  // Toggling only affects extra picks, never culture-locked picks
                  if (!isLocked) onToggle(option);
                }}
                className="w-4 h-4 border rounded"
              />
              <span>{option}{isLocked ? ' (Culture)' : ''}</span>
            </label>
          );
        })}
      </div>
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

