import React, { useState } from 'react';
import HeaderForm from './HeaderForm';
import StatsTab from './StatsTab';
import SkillsList from './SkillsList';
import ListSection from './ListSection';
import ExpertiseList from './ExpertiseList';
import { SKILL_LIST, ATTRIBUTES, MAX_ATTRIBUTE_POINTS } from '../../globals/constants';

export default function CharacterBuilder() {
  const [char, setChar] = useState({
    playerName: '', characterName: '', ancestry: 'Human',
    cultures: [], startingPath: 'Agent', level: 1,
    strength:0, speed:0, intellect:0, willpower:0, awareness:0, presence:0,
    skills: SKILL_LIST.reduce((o,{name})=>({...o,[name]:0}),{}),
    surges:[], radiancePowers:[], expertise: []
  });

  const [tab, setTab] = useState('stats');

  const total = ATTRIBUTES.reduce((sum,s)=>sum+char[s],0);
  const remaining = MAX_ATTRIBUTE_POINTS - total;

  const handleHeaderChange = e => {
    const {name,value,multiple,selectedOptions} = e.target;
    const val = multiple
      ? Array.from(selectedOptions).map(o=>o.value).slice(0,2)
      : value;
    setChar(prev => ({...prev,[name]:val}));
  };

  const changeStat = (stat,delta) => {
    setChar(prev => {
      const newVal = Math.min(3,Math.max(0,prev[stat]+delta));
      const newTotal = ATTRIBUTES.reduce((sum,s)=>sum + (s===stat?newVal:prev[s]),0);
      return newTotal<=MAX_ATTRIBUTE_POINTS ? {...prev,[stat]:newVal} : prev;
    });
  };

  const changeSkillRank = (name,rank,checked) => {
    setChar(prev => {
      const cur = prev.skills[name]; let newRank = cur;
      if(checked && rank === cur+1) newRank = rank;
      else if(!checked && rank === cur) newRank = cur-1;
      else return prev;
      return {...prev, skills:{...prev.skills,[name]:newRank}};
    });
  };

  const addListItem = field => setChar(prev=>({...prev,[field]:[...prev[field],'']}));
  const updateListItem = (field,i,val) => setChar(prev=>{ const arr=[...prev[field]];arr[i]=val;return{...prev,[field]:arr};});
  const removeListItem = (field,i) => setChar(prev=>({...prev,[field]:prev[field].filter((_,idx)=>idx!==i)}));

  const TAB_CONFIG = [
    { id: 'stats', label: 'Attributes' },
    { id: 'skills', label: 'Skills' },
    { id: 'surges', label: 'Surges' },
    { id: 'radiant', label: 'Radiant Powers' },
    { id: 'expertise', label: 'Expertise' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cosmere RPG Character Creator</h1>
      <HeaderForm char={char} onChange={handleHeaderChange} />

      <div className="flex border-b mb-4">
        {TAB_CONFIG.map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`${tab === tabItem.id ? 'border-b-2 border-blue-500 text-blue-800' : 'text-white'} px-4 py-2`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <StatsTab
          char={char}
          stats={ATTRIBUTES}
          remainingPoints={remaining}
          onIncrement={s => changeStat(s,1)}
          onDecrement={s => changeStat(s,-1)}
        />
      )}

      {tab === 'skills' && (
        <SkillsList
          char={char}
          startingPath={char.startingPath}
          onChangeRank={changeSkillRank}
        />
      )}

      {tab === 'surges' && (
        <ListSection
          title="Surges"
          items={char.surges}
          onAdd={() => addListItem('surges')}
          onChangeItem={(i,v) => updateListItem('surges',i,v)}
          onRemove={i => removeListItem('surges',i)}
        />
      )}

      {tab === 'radiant' && (
        <ListSection
          title="Radiant Powers"
          items={char.radiancePowers}
          onAdd={() => addListItem('radiancePowers')}
          onChangeItem={(i,v) => updateListItem('radiancePowers',i,v)}
          onRemove={i => removeListItem('radiancePowers',i)}
        />
      )}

      {tab==='expertise' && (
        <ExpertiseList
          char={char}
          onToggle={opt => {
            const has = char.expertise.includes(opt);
            setChar(prev => ({
              ...prev,
              expertise: has
                ? prev.expertise.filter(x => x !== opt)
                : [...prev.expertise, opt]
            }));
          }}
        />
      )}
    </div>
  );
}
