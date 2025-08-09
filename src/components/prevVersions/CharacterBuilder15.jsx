import { useState } from 'react';

const CULTURE_OPTIONS = [
  'Alethi','Azish','Herdazian','Iriali','Kharbranthian',
  'Listeners','Natan','Reshi','Shin','Thaylen','Unkalaki','Veden'
];
const STARTING_PATHS = ['Agent','Envoy','Hunter','Leader','Scholar','Warrior'];
const SKILL_LIST = [
  { name: 'Agility', base: 'speed' },
  { name: 'Athletics', base: 'strength' },
  { name: 'Crafting', base: 'intellect' },
  { name: 'Deception', base: 'presence' },
  { name: 'Deduction', base: 'intellect' },
  { name: 'Discipline', base: 'willpower' },
  { name: 'Heavy Weaponry', base: 'strength' },
  { name: 'Insight', base: 'awareness' },
  { name: 'Intimidation', base: 'willpower' },
  { name: 'Leadership', base: 'presence' },
  { name: 'Light Weaponry', base: 'speed' },
  { name: 'Lore', base: 'intellect' },
  { name: 'Medicine', base: 'intellect' },
  { name: 'Perception', base: 'awareness' },
  { name: 'Persuasion', base: 'presence' },
  { name: 'Stealth', base: 'speed' },
  { name: 'Survival', base: 'awareness' },
  { name: 'Thievery', base: 'speed' }
];
const ATTR_ABBREV = {
  strength: 'STR', speed: 'SPD', intellect: 'INT',
  willpower: 'WIL', awareness: 'AWS', presence: 'PRE'
};

const defaultCharacter = {
  playerName: '',
  characterName: '',
  ancestry: 'Human',
  cultures: [],
  startingPath: 'Agent',
  strength: 0,
  speed: 0,
  intellect: 0,
  willpower: 0,
  awareness: 0,
  presence: 0,
  skills: SKILL_LIST.reduce((obj, { name }) => ({ ...obj, [name]: 0 }), {}),
  surges: [],
  radiancePowers: []
};

export default function CharacterBuilder() {
  const [char, setChar] = useState(defaultCharacter);
  const [tab, setTab] = useState('stats');
  const stats = ['strength','speed','intellect','willpower','awareness','presence'];
  const totalAllocated = stats.reduce((sum, s) => sum + char[s], 0);
  const remainingPoints = 12 - totalAllocated;

  // Derived computations
  const computeLifting = str => str === 0 ? '100 lbs' : str <= 2 ? '200 lbs' : str <= 4 ? '500 lbs' : str <= 6 ? '1000 lbs' : str <= 8 ? '5000 lbs' : '10,000 lbs';
  const computeCarrying = str => str === 0 ? '50 lbs' : str <= 2 ? '100 lbs' : str <= 4 ? '250 lbs' : str <= 6 ? '500 lbs' : str <= 8 ? '2,500 lbs' : '5,000 lbs';
  const computeMovementRate = spd => spd === 0 ? '20 ft' : spd <= 2 ? '25 ft' : spd <= 4 ? '30 ft' : spd <= 6 ? '40 ft' : spd <= 8 ? '60 ft' : '80 ft';
  const computeRecoveryDie = wp => wp === 0 ? '1d4' : wp <= 2 ? '1d6' : wp <= 4 ? '1d8' : wp <= 6 ? '1d10' : wp <= 8 ? '1d12' : '1d20';
  const computeSensesRange = aw => aw === 0 ? '5 ft' : aw <= 2 ? '10 ft' : aw <= 4 ? '20 ft' : aw <= 6 ? '50 ft' : aw <= 8 ? '100 ft' : 'Unaffected';

  // Handlers
  const handleHeaderChange = e => {
    const { name, value } = e.target;
    setChar(prev => ({ ...prev, [name]: value }));
  };
  const changeStat = (stat, delta) => {
    setChar(prev => {
      const newVal = Math.min(3, Math.max(0, prev[stat] + delta));
      const newTotal = stats.reduce((sum, s) => sum + (s === stat ? newVal : prev[s]), 0);
      return newTotal <= 12 ? { ...prev, [stat]: newVal } : prev;
    });
  };
  const handleCulture = e => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setChar(prev => ({ ...prev, cultures: selected.slice(0, 2) }));
  };
  const changeSkillRank = (name, rank, checked) => {
    setChar(prev => {
      const current = prev.skills[name];
      let newRank = current;
      if (checked && rank === current + 1) newRank = rank;
      else if (!checked && rank === current) newRank = current - 1;
      else return prev;
      return { ...prev, skills: { ...prev.skills, [name]: newRank } };
    });
  };
  const addListItem = field => setChar(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  const updateListItem = (field, i, value) => setChar(prev => {
    const arr = [...prev[field]]; arr[i] = value; 
    return { ...prev, [field]: arr };
  });
  const removeListItem = (field, i) => setChar(prev => ({ ...prev, [field]: prev[field].filter((_, idx) => idx !== i) }));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Build Your Player Character</h1>
      {/* Header Inputs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input name="playerName" placeholder="Player Name" value={char.playerName} onChange={handleHeaderChange} className="border rounded p-2" />
        <input name="characterName" placeholder="Character Name" value={char.characterName} onChange={handleHeaderChange} className="border rounded p-2" />
        <select name="ancestry" value={char.ancestry} onChange={handleHeaderChange} className="border rounded p-2"><option>Human</option><option>Singer</option></select>
        <select name="startingPath" value={char.startingPath} onChange={handleHeaderChange} className="border rounded p-2">{STARTING_PATHS.map(path => <option key={path}>{path}</option>)}</select>
        <select multiple value={char.cultures} onChange={handleCulture} className="border rounded p-2">{CULTURE_OPTIONS.map(c => <option key={c}>{c}</option>)}</select>
      </div>
      {/* Tabs */}
      <div className="flex border-b mb-4"><button onClick={() => setTab('stats')} className={`${tab==='stats'?'border-b-2 border-blue-500':''} px-4 py-2`}>Attributes/Derived Stats</button><button onClick={() => setTab('abilities')} className={`${tab==='abilities'?'border-b-2 border-blue-500':''} px-4 py-2`}>Skills</button></div>
      {/* Tab Content */}
      {tab==='stats'? (<div className="flex space-x-8 mb-6"><div className="flex-1"><h2 className="text-xl font-semibold mb-2">Attributes</h2>{stats.map(stat => (<div key={stat} className="flex items-center mb-2"><span className="w-32 capitalize font-medium">{stat}</span><button onClick={()=>changeStat(stat,-1)} disabled={char[stat]===0} className="px-2 border rounded">-</button><span className="mx-2 w-6 text-center">{char[stat]}</span><button onClick={()=>changeStat(stat,1)} disabled={char[stat]===3||remainingPoints===0} className="px-2 border rounded">+</button></div>))}<p className="mt-2 font-medium">Remaining Points: {remainingPoints}</p></div><div className="flex-1"><h2 className="text-xl font-semibold mb-2">Derived Stats</h2><p><strong>Lifting Capacity:</strong> {computeLifting(char.strength)}</p><p><strong>Carrying Capacity:</strong> {computeCarrying(char.strength)}</p><p><strong>Movement Rate:</strong> {computeMovementRate(char.speed)} per action</p><p><strong>Recovery Die:</strong> {computeRecoveryDie(char.willpower)}</p><p><strong>Senses Range:</strong> {computeSensesRange(char.awareness)}</p></div></div>) : (
      <>  {/* Abilities Tab */}
        <div className="mb-6"><h2 className="text-xl font-semibold mb-2">Skills</h2><div className="flex items-center justify-between mb-2 font-semibold"><span className="w-12 text-center mr-2">Mod</span><span className="flex-1">Skill</span><span className="text-center">Ranks</span></div>{SKILL_LIST.map(({ name, base }) => { const rank = char.skills[name]; const mod = char[base] + rank; return (<div key={name} className="flex items-center justify-between mb-2"><input type="text" readOnly value={mod} className="w-12 text-center border rounded p-1 mr-2"/><span className="flex-1 font-medium">{name}</span><div className="flex space-x-1">{[1,2,3,4,5].map(i => (<input key={i} type="checkbox" checked={i<=rank} disabled={!((i===rank+1&&rank<5)||(i===rank&&rank>0))} onChange={e=>changeSkillRank(name,i,e.target.checked)} className={`w-4 h-4 border rounded ${i<=rank?'bg-blue-500':''}`}/>))}</div></div>); })}</div>
        <div className="mb-6"><h2 className="text-xl font-semibold mb-2">Surges</h2>{char.surges.map((s,idx)=>(<div key={idx} className="flex items-center mb-2"><input className="flex-1 border rounded p-1" value={s} onChange={e=>updateListItem('surges',idx,e.target.value)} placeholder="Surge Name"/><button onClick={()=>removeListItem('surges',idx)} className="ml-2 text-red-500">×</button></div>))}<button onClick={()=>addListItem('surges')} className="px-3 py-1 bg-blue-500 text-white rounded">Add Surge</button></div>
        <div><h2 className="text-xl font-semibold mb-2">Radiant Powers</h2>{char.radiancePowers.map((p,idx)=>(<div key={idx} className="flex items-center mb-2"><input className="flex-1 border rounded p-1" value={p} onChange={e=>updateListItem('radiancePowers',idx,e.target.value)} placeholder="Power Name"/><button onClick={()=>removeListItem('radiancePowers',idx)} className="ml-2 text-red-500">×</button></div>))}<button onClick={() => addListItem('radiancePowers')} className="px-3 py-1 bg-blue-500 text-white rounded">Add Radiant Power</button></div>
      </>
      )}
    </div>
)};

