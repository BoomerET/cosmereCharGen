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
  strength: 'str',
  speed: 'spd',
  intellect: 'int',
  willpower: 'wil',
  awareness: 'awr',
  presence: 'pre'
};

const defaultCharacter = {
  name: '',
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
  const stats = ['strength','speed','intellect','willpower','awareness','presence'];
  const totalAllocated = stats.reduce((sum, stat) => sum + char[stat], 0);
  const remainingPoints = 12 - totalAllocated;

  // Derived computations
  const computeLifting = str => {
    if (str === 0) return '100 lbs';
    if (str <= 2) return '200 lbs';
    if (str <= 4) return '500 lbs';
    if (str <= 6) return '1000 lbs';
    if (str <= 8) return '5000 lbs';
    return '10,000 lbs';
  };
  const computeCarrying = str => {
    if (str === 0) return '50 lbs';
    if (str <= 2) return '100 lbs';
    if (str <= 4) return '250 lbs';
    if (str <= 6) return '500 lbs';
    if (str <= 8) return '2,500 lbs';
    return '5,000 lbs';
  };
  const computeMovementRate = spd => {
    if (spd === 0) return '20 ft';
    if (spd <= 2) return '25 ft';
    if (spd <= 4) return '30 ft';
    if (spd <= 6) return '40 ft';
    if (spd <= 8) return '60 ft';
    return '80 ft';
  };
  const computeRecoveryDie = wp => {
    if (wp === 0) return '1d4';
    if (wp <= 2) return '1d6';
    if (wp <= 4) return '1d8';
    if (wp <= 6) return '1d10';
    if (wp <= 8) return '1d12';
    return '1d20';
  };
  const computeSensesRange = aw => {
    if (aw === 0) return '5 ft';
    if (aw <= 2) return '10 ft';
    if (aw <= 4) return '20 ft';
    if (aw <= 6) return '50 ft';
    if (aw <= 8) return '100 ft';
    return 'Unaffected';
  };

  // Handlers
  const changeStat = (stat, delta) => setChar(prev => {
    const newVal = Math.min(3, Math.max(0, prev[stat] + delta));
    const newTotal = stats.reduce((sum, s) => sum + (s === stat ? newVal : prev[s]), 0);
    return newTotal <= 12 ? { ...prev, [stat]: newVal } : prev;
  });
  const handleChange = e => {
    const { name, value, type } = e.target;
    setChar(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };
  const handleCulturesChange = e => {
    const sel = Array.from(e.target.selectedOptions).map(o => o.value);
    setChar(prev => ({ ...prev, cultures: sel.slice(0, 2) }));
  };
  const changeSkillRank = (skillName, rank, checked) => setChar(prev => {
    const current = prev.skills[skillName];
    let newRank = current;
    if (checked && rank === current + 1) newRank = rank;
    else if (!checked && rank === current) newRank = current - 1;
    else return prev;
    return { ...prev, skills: { ...prev.skills, [skillName]: newRank } };
  });
  const addSurge = () => setChar(prev => ({ ...prev, surges: [...prev.surges, ''] }));
  const updateSurge = (i, v) => setChar(prev => { const arr = [...prev.surges]; arr[i] = v; return { ...prev, surges: arr }; });
  const removeSurge = i => setChar(prev => ({ ...prev, surges: prev.surges.filter((_, j) => j !== i) }));
  const addRadiance = () => setChar(prev => ({ ...prev, radiancePowers: [...prev.radiancePowers, ''] }));
  const updateRadiance = (i, v) => setChar(prev => { const arr = [...prev.radiancePowers]; arr[i] = v; return { ...prev, radiancePowers: arr }; });
  const removeRadiance = i => setChar(prev => ({ ...prev, radiancePowers: prev.radiancePowers.filter((_, j) => j !== i) }));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Build Your Player Character</h1>

      {/* Basic Info */}
      <div className="space-y-4">
        <div><label className="block font-medium">Name</label><input type="text" name="name" value={char.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2"/></div>
        <div><label className="block font-medium">Ancestry</label><select name="ancestry" value={char.ancestry} onChange={handleChange} className="mt-1 block w-full border rounded p-2"><option value="Human">Human</option><option value="Singer">Singer</option></select></div>
        <div><label className="block font-medium">Culture (up to 2)</label><select multiple name="cultures" value={char.cultures} onChange={handleCulturesChange} className="mt-1 block w-full border rounded p-2">{CULTURE_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block font-medium">Starting Path</label><select name="startingPath" value={char.startingPath} onChange={handleChange} className="mt-1 block w-full border rounded p-2">{STARTING_PATHS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
      </div>

      {/* Attribute Distribution */}
      <div className="mt-6"><h2 className="text-2xl font-semibold mb-2">Distribute Attributes (0–3, total 12)</h2>{stats.map(stat=><div key={stat} className="flex items-center space-x-4 mb-2"><label className="w-32 font-medium capitalize">{stat}</label><button type="button" onClick={()=>changeStat(stat,-1)} disabled={char[stat]===0} className="px-2 border rounded">-</button><span className="w-8 text-center">{char[stat]}</span><button type="button" onClick={()=>changeStat(stat,1)} disabled={char[stat]===3||remainingPoints===0} className="px-2 border rounded">+</button></div>)}<p className="mt-2 font-medium">Remaining Points: {remainingPoints}</p></div>

      {/* Derived Stats */}
      <div className="mt-6"><h2 className="text-2xl font-semibold mb-2">Derived Stats</h2><p><strong>Lifting Capacity:</strong> {computeLifting(char.strength)}</p><p><strong>Carrying Capacity:</strong> {computeCarrying(char.strength)}</p><p><strong>Movement Rate:</strong> {computeMovementRate(char.speed)} per action</p><p><strong>Recovery Die:</strong> {computeRecoveryDie(char.willpower)}</p><p><strong>Senses Range:</strong> {computeSensesRange(char.awareness)}</p></div>

      {/* Skills */}
      <div className="mt-6"><h2 className="text-2xl font-semibold mb-2">Skills</h2>{SKILL_LIST.map(({name,base})=>{const rank=char.skills[name];return(<div key={name} className="mb-4"><div className="flex justify-between items-center"><span className="font-medium">{name} ({ATTR_ABBREV[base]}: {char[base]})</span><div className="flex space-x-1">{[1,2,3,4,5].map(i=><input key={i} type="checkbox" checked={i<=rank} disabled={!((i===rank+1&&rank<5)||(i===rank&&rank>0))} onChange={e=>changeSkillRank(name,i,e.target.checked)} className={`w-4 h-4 border rounded ${i<=rank?'bg-blue-500':''}`}/>)}</div></div></div>);})}</div>

      {/* Surges */}
      <div className="mt-6"><h2 className="text-2xl font-semibold mb-2">Surges</h2>{char.surges.map((surge,i)=><div key={i} className="flex items-center space-x-2 mb-2"><input type="text" placeholder="Surge Name" value={surge} onChange={e=>updateSurge(i,e.target.value)} className="w-full border rounded p-1"/><button type="button" onClick={()=>removeSurge(i)} className="text-red-500">Remove</button></div>)}<button type="button" onClick={addSurge} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add Surge</button></div>

      {/* Radiant Powers */}
      <div className="mt-6"><h2 className="text-2xl font-semibold mb-2">Radiant Powers</h2>{char.radiancePowers.map((rp,i)=><div key={i} className="flex items-center space-x-2 mb-2"><input type="text" placeholder="Power Name" value={rp} onChange={e=>updateRadiance(i,e.target.value)} className="w-full border rounded p-1"/><button type="button" onClick={()=>removeRadiance(i)} className="text-red-500">Remove</button></div>)}<button type="button" onClick={addRadiance} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add Radiant Power</button></div>

      {/* Summary */}
      <div className="mt-8 p-4 border rounded bg-gray-800 text-white"><h2 className="text-2xl font-semibold mb-2">Character Summary</h2><pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(char,null,2)}</pre></div>
    </div>
  );
}

