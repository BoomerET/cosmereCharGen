import React from 'react';
import PropTypes from 'prop-types';
import { EXPERTISE_OPTIONS } from '../../globals/constants';

export default function ExpertiseList({ char, onToggle }) {
  // determine which ones come from Culture Expertise
  const locked = new Set(char.cultures);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Expertise</h2>
      <p className="mb-2 font-medium">
        Pick up to {char.intellect} total expertise area(s)
      </p>
      <div className="grid grid-cols-2 gap-2">
        {EXPERTISE_OPTIONS.map(option => {
          const isLocked   = locked.has(option);
          const isSelected = isLocked || char.expertise.includes(option);

          return (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isLocked}
                onChange={() => onToggle(option)}
                className="w-4 h-4 border rounded"
              />
              <span>{option}</span>
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
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired
};
