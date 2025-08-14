import React from 'react';
import PropTypes from 'prop-types';
import {
  ARMOR_EXPERTISE_OPTIONS,
  CULTURAL_EXPERTISE_OPTIONS,
  UTILILTY_EXPERTISE_OPTIONS,
  WEAPON_EXPERTISE_OPTIONS,
} from '../../globals/constants';

export default function ExpertiseList({ char, onToggleCulture, onToggleExtra }) {
  const selectedCultures = new Set(char.cultures || []);
  const culturesCount = selectedCultures.size;
  const cultureCap = 2;

  const selectedExtras = new Set(char.expertise || []);
  const selectedExtrasCount = selectedExtras.size;
  const maxExtras = Math.max(0, Number(char.intellect) || 0);
  const atExtraCap = selectedExtrasCount >= maxExtras;

  const renderGroup = (title, options, type) => (
    <div key={title} className="mb-5">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {type === 'culture' && (
        <p className="mb-2 text-sm text-gray-600">
          {culturesCount} / {cultureCap} selected
        </p>
      )}
      {type === 'extra' && (
        <p className="mb-2 text-sm text-gray-600">
          {selectedExtrasCount} / {maxExtras} extra selected
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isCulture = type === 'culture';
          const isSelected = isCulture
            ? selectedCultures.has(opt)
            : selectedExtras.has(opt);

          const isDisabled = isCulture
            ? (!isSelected && culturesCount >= cultureCap)
            : (!isSelected && atExtraCap);

          const onChange = () => {
            if (isCulture) onToggleCulture(opt);
            else onToggleExtra(opt);
          };

          return (
            <label
  key={opt}
  className={`flex items-center space-x-2 p-2 rounded-lg border ${
    isSelected ? "hl-card" : "border-gray-300"
  } ${isDisabled ? "opacity-60" : ""}`}
>
  <input
    type="checkbox"
    checked={isSelected}
    disabled={isDisabled}
    onChange={onChange}
    className="w-4 h-4 border rounded"
  />
  <span className={isSelected ? "hl-label" : ""}>{opt}</span>
</label>

          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Expertise</h2>

      {renderGroup('Cultural Expertise (pick exactly 2)', CULTURAL_EXPERTISE_OPTIONS, 'culture')}
      {renderGroup('Armor Expertise', ARMOR_EXPERTISE_OPTIONS, 'extra')}
      {renderGroup('Utility Expertise', UTILILTY_EXPERTISE_OPTIONS, 'extra')}
      {renderGroup('Weapon Expertise', WEAPON_EXPERTISE_OPTIONS, 'extra')}
    </div>
  );
}

ExpertiseList.propTypes = {
  char: PropTypes.shape({
    intellect: PropTypes.number.isRequired,
    cultures: PropTypes.arrayOf(PropTypes.string).isRequired,
    expertise: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onToggleCulture: PropTypes.func.isRequired,
  onToggleExtra: PropTypes.func.isRequired,
};

