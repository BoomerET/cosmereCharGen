import React, { useEffect } from 'react';
import { SKILL_LIST } from '../../globals/constants';

export default function SkillsList({ char, startingPath, onChangeRank }) {
  // Map startingPath to its free starting skill
  const pathDefault = {
    Agent:    'Insight',
    Envoy:    'Discipline',
    Hunter:   'Perception',
    Leader:   'Leadership',
    Scholar:  'Lore',
    Warrior:  'Athletics',
  };
  const freeSkill = pathDefault[startingPath];

  // Auto-initialize the free skill rank in state
  useEffect(() => {
    if (char.skills[freeSkill] < 1) {
      onChangeRank(freeSkill, 1, true);
    }
  }, [freeSkill]);

  // Calculate extra points spent when level < 2
  const extraSpent = SKILL_LIST.reduce((sum, { name }) => {
    const actual = char.skills[name] || 0;
    const base   = name === freeSkill ? 1 : 0;
    return sum + Math.max(0, actual - base);
  }, 0);
  const maxExtras = 4;
  const remaining = maxExtras - extraSpent;

  // Determine max selectable rank based on level
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
        const actual = char.skills[name] || 0;
        // Effective displayed rank includes free base for that one
        const baseRank = name === freeSkill ? actual : actual;
        const mod = char[base] + baseRank;

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
                  checked={i <= baseRank}
                  disabled={
                    // Never allow unchecking free starter rank 1
                    (i === 1 && name === freeSkill) ||
                    // Disallow ranks above the level-based max
                    (i > maxRank) ||
                    // If level < 2, enforce extraPoints limit
                    (char.level < 2 && i > baseRank && remaining <= 0)
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

