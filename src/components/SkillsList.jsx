import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { SKILL_LIST, PATH_DEFAULT_SKILL_MAP } from '../../globals/constants';

export default function SkillsList({ char, startingPath, onChangeRank }) {
  const freeSkill = PATH_DEFAULT_SKILL_MAP[startingPath];

  useEffect(() => {
    if (freeSkill && char.skills[freeSkill] < 1) {
      onChangeRank(freeSkill, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeSkill]);

  const extraSpent = SKILL_LIST.reduce((sum, { name }) => {
    const actual = char.skills[name] || 0;
    const base   = name === freeSkill ? 1 : 0;
    return sum + Math.max(0, actual - base);
  }, 0);
  const maxExtras = 4;
  const remaining = maxExtras - extraSpent;

  const maxRank = char.level >= 2 ? 5 : 2;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Skills</h2>
      {char.level < 2 && (
        <p className="mb-2 font-medium">Points remaining: {remaining}</p>
      )}
      <div className="flex items-center justify-between mb-2 font-semibold">
        <span className="w-12 text-center mr-2">Mod</span>
        <span className="flex-1">Skill</span>
        <span className="text-center">Ranks</span>
      </div>

      {SKILL_LIST.map(({ name, base }) => {
        const rank = char.skills[name] || 0;
        const mod = (char[base] || 0) + rank;

        return (
          <div key={name} className="flex items-center justify-between mb-2">
            <input
              type="text"
              readOnly
              value={mod}
              className="w-12 text-center border rounded p-1 mr-2"
            />
            <span className="flex-1 font-medium">{name}</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <input
                  key={i}
                  type="checkbox"
                  checked={i <= rank}
                  disabled={
                    (i === 1 && name === freeSkill) ||
                    (i > maxRank) ||
                    (char.level < 2 && i > rank && remaining <= 0)
                  }
                  onChange={e => onChangeRank(name, i, e.target.checked)}
                  className="w-4 h-4 border rounded"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

SkillsList.propTypes = {
  char: PropTypes.shape({
    level: PropTypes.number.isRequired,
    skills: PropTypes.object.isRequired
  }).isRequired,
  startingPath: PropTypes.string.isRequired,
  onChangeRank: PropTypes.func.isRequired
};
