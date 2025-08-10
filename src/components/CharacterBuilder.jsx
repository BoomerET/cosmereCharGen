import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HeaderForm from './HeaderForm';
import StatsTab from './StatsTab';
import SkillsList from './SkillsList';
import ListSection from './ListSection';
import ExpertiseList from './ExpertiseList';
import { SKILL_LIST } from '../../globals/constants';

export default function CharacterBuilder() {
  const [char, setChar] = useState({
    playerName: '',
    characterName: '',
    ancestry: 'Human',
    cultures: [],
    startingPath: '',
    level: 1,
    strength: 0,
    speed: 0,
    intellect: 0,
    willpower: 0,
    awareness: 0,
    presence: 0,
    skills: SKILL_LIST.reduce((o, { name }) => ({ ...o, [name]: 0 }), {}),
    surges: [],
    radiancePowers: [],
    expertise: [],
  });

  const [tab, setTab] = useState('stats');

  const stats = ['strength', 'speed', 'intellect', 'willpower', 'awareness', 'presence'];
  const total = stats.reduce((sum, s) => sum + char[s], 0);
  const remaining = 12 - total;
  const hasPath = !!char.startingPath;
  const attrsDone = remaining === 0;
  const hasTwoCultures = (char.cultures?.length || 0) === 2;

  const isTabAccessible = (id) => {
    if (id === 'stats') return true;
    const baseUnlocked = hasPath && attrsDone;
    if (!baseUnlocked) return false;
    if (id === 'expertise') return hasTwoCultures;
    return true;
  };

  useEffect(() => {
    if (!isTabAccessible(tab)) setTab('stats');
  }, [tab, hasPath, attrsDone, hasTwoCultures]);

  const handleHeaderChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;
    const val = multiple
      ? Array.from(selectedOptions).map((o) => o.value).slice(0, 2)
      : value;
    setChar((prev) => ({ ...prev, [name]: val }));
  };

  const changeStat = (stat, delta) => {
    setChar((prev) => {
      const newVal = Math.min(3, Math.max(0, prev[stat] + delta));
      const newTotal = stats.reduce((sum, s) => sum + (s === stat ? newVal : prev[s]), 0);
      return newTotal <= 12 ? { ...prev, [stat]: newVal } : prev;
    });
  };

  const changeSkillRank = (name, rank, checked) => {
    setChar((prev) => {
      const cur = prev.skills[name];
      let newRank = cur;
      if (checked && rank === cur + 1) newRank = rank;
      else if (!checked && rank === cur) newRank = cur - 1;
      else return prev;
      return { ...prev, skills: { ...prev.skills, [name]: newRank } };
    });
  };

  const addListItem = (field) => setChar((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  const updateListItem = (field, i, val) =>
    setChar((prev) => {
      const arr = [...prev[field]];
      arr[i] = val;
      return { ...prev, [field]: arr };
    });
  const removeListItem = (field, i) =>
    setChar((prev) => ({ ...prev, [field]: prev[field].filter((_, idx) => idx !== i) }));

  const TAB_CONFIG = [
    { id: 'stats', label: 'Attributes' },
    { id: 'skills', label: 'Skills' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'surges', label: 'Surges' },
    { id: 'radiant', label: 'Radiant Powers' },
  ];

  const tooltipFor = (id) => {
    if (id === 'stats') return undefined;
    if (!hasPath) return 'Select a starting path to unlock tabs';
    if (!attrsDone) return `Distribute all attribute points — ${remaining} remaining`;
    if (id === 'expertise' && !hasTwoCultures) return 'Choose 2 Cultural Expertise to unlock';
    return undefined;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cosmere RPG Character Creator</h1>
      <HeaderForm char={char} onChange={handleHeaderChange} requirePathSelection />

      <div className="flex gap-2 border-b mb-2" role="tablist" aria-label="Character builder tabs">
        {TAB_CONFIG.map((tabItem) => {
          const disabled = !isTabAccessible(tabItem.id);
          return (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              aria-selected={tab === tabItem.id}
              aria-controls={`${tabItem.id}-panel`}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setTab(tabItem.id);
              }}
              className={`px-4 py-2 -mb-[2px] border-b-2 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${tab === tabItem.id
                  ? 'border-blue-500 text-blue-800 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-blue-700'}`}
              title={tooltipFor(tabItem.id)}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {!hasPath && (
        <p className="mb-2 text-sm text-gray-600">Select a starting path first.</p>
      )}
      {hasPath && !attrsDone && (
        <p className="mb-2 text-sm text-gray-600">Distribute all attribute points — <span className="font-medium">{remaining}</span> remaining.</p>
      )}
      {hasPath && attrsDone && !hasTwoCultures && (
        <p className="mb-2 text-sm text-gray-600">Pick exactly two items in <span className="font-medium">Cultural Expertise</span> to unlock the Expertise tab.</p>
      )}

      {tab === 'stats' && (
        <StatsTab
          char={char}
          stats={stats}
          remainingPoints={remaining}
          onIncrement={(s) => changeStat(s, 1)}
          onDecrement={(s) => changeStat(s, -1)}
          showHealth
        />
      )}

      {tab === 'skills' && (
        <SkillsList
          char={char}
          startingPath={char.startingPath}
          onChangeRank={changeSkillRank}
        />
      )}

      {tab === 'expertise' && (
        <ExpertiseList
          char={char}
          onToggle={(opt) => {
            const has = char.expertise.includes(opt);
            setChar((prev) => ({
              ...prev,
              expertise: has ? prev.expertise.filter((x) => x !== opt) : [...prev.expertise, opt],
            }));
          }}
        />
      )}

      {tab === 'surges' && (
        <ListSection
          title="Surges"
          items={char.surges}
          onAdd={() => addListItem('surges')}
          onChangeItem={(i, v) => updateListItem('surges', i, v)}
          onRemove={(i) => removeListItem('surges', i)}
        />
      )}

      {tab === 'radiant' && (
        <ListSection
          title="Radiant Powers"
          items={char.radiancePowers}
          onAdd={() => addListItem('radiancePowers')}
          onChangeItem={(i, v) => updateListItem('radiancePowers', i, v)}
          onRemove={(i) => removeListItem('radiancePowers', i)}
        />
      )}
    </div>
  );
}

CharacterBuilder.propTypes = {
  // no props expected currently, but defining for potential future
};

