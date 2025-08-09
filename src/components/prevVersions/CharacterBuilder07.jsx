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
  strength: 'STR',
  speed: 'SPD',
  intellect: 'INT',
  willpower: 'WIL',
  awareness: 'AWS',
  presence: 'PRE'
};

const defaultCharacter = {
  playerName: '',
  characterName: '',
  ancestry: 'Human',
  cultures: [],
  startingPath: 'Agent',
  strength: 0, speed: 0, intellect: 0,
  willpower: 0, awareness: 0, presence: 0,
  skills: SKILL_LIST.reduce((o,{name})=>({...o,[name]:0}),{}),
  surges: [],
  radiancePowers: []
};

export default function CharacterBuilder() {
  const [char, setChar] = useState(defaultCharacter);
  const [tab, setTab] = useState('stats');
  const stats = ['strength','speed','intellect','willpower','awareness','presence'];
  const totalAllocated = stats.reduce((sum,s)=>sum+char[s],0);
  const remainingPoints = 12 - totalAllocated;

  const computeLifting = str=> str===0?'100 lbs':str<=2?'200 lbs':str<=4?'500 lbs':str<=6?'1000 lbs':str<=8?'5000 lbs':'10,000 lbs';
  const computeCarrying = str=> str===0?'50 lbs':str<=2?'100 lbs':str<=4?'250 lbs':str<=6?'500 lbs':str<=8?'2,500 lbs':'5,000 lbs';
  const computeMovementRate = spd=> spd===0?'20 ft':spd<=2?'25 ft':spd<=4?'30 ft':spd<=6?'40 ft':spd<=8?'60 ft':'80 ft';
  const computeRecoveryDie = wp=> wp===0?'1d4':wp<=2?'1d6':wp<=4?'1d8':wp<=6?'1d10':wp<=8?'1d12':'1d20';
  const computeSensesRange = aw=> aw===0?'5 ft':aw<=2?'10 ft':aw<=4?'20 ft':aw<=6?'50 ft':aw<=8?'100 ft':'Unaffected';

  const handleHeaderChange=(e)=>{const{name,value}=e.target;setChar(p=>({...p,[name]:value}));};
  const changeStat=(s,d)=>setChar(p=>{const v=Math.min(3,Math.max(0,p[s]+d));const tot=stats.reduce((sum,x)=>sum+(x===s?v:p[x]),0);return tot<=12?{...p,[s]:v}:p;});
  const handleCulture=e=>{const sel=Array.from(e.target.selectedOptions).map(o=>o.value);setChar(p=>({...p,cultures:sel.slice(0,2)}));};
  const changeSkillRank=(nm,rk,chk)=>setChar(p=>{const cur=p.skills[nm];let nr=cur;if(chk&&rk===cur+1)nr=rk;else if(!chk&&rk===cur)nr=cur-1;else return p;return{...p,skills:{...p.skills,[nm]:nr}};});
  const addList=f=>setChar(p=>({...p,[f]:[...p[f],'']}));
  const updateList=(f,i,v)=>setChar(p=>{const a=[...p[f]];a[i]=v;return{...p,[f]:a};});
  const removeList=(f,i)=>setChar(p=>({...p,[f]:p[f].filter((_,j)=>j!==i)}));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Build Your Player Character</h1>
      {/* Header Inputs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input name="playerName" placeholder="Player Name" value={char.playerName} onChange={handleHeaderChange} className="border rounded p-2"/>
        <input name="characterName" placeholder="Character Name" value={char.characterName} onChange={handleHeaderChange} className="border rounded p-2"/>
        <select name="ancestry" value={char.ancestry} onChange={handleHeaderChange} className="border rounded p-2">
          <option>Human</option><option>Singer</option>
        </select>
        <select name="startingPath" value={char.startingPath} onChange={handleHeaderChange} className="border rounded p-2">
          {STARTING_PATHS.map(p=><option key={p}>{p}</option>)}
        </select>
        <select multiple value={char.cultures} onChange={handleCulture} className="border rounded p-2">
          {CULTURE_OPTIONS.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button onClick={()=>setTab('stats')} className={`${tab==='stats'?'border-b-2 border-blue-500':''} px-4 py-2`}>Attributes/Derived Stats</button>
        <button onClick={()=>setTab('abilities')} className={`${tab==='abilities'?'border-b-2 border-blue-500':''} px-4 py-2`}>Skills</button>
      </div>
      {/* Tab Content */}
      {tab==='stats' ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Attributes</h2>
            {stats.map(s=>(
              <div key={s} className="flex items-center mb-2">
                <span className="w-32 capitalize font-medium">{s}</span>
                <button onClick={()=>changeStat(s,-1)} disabled={char[s]===0} className="px-2 border rounded">-</button>
                <span className="mx-2 w-6 text-center">{char[s]}</span>
                <button onClick={()=>changeStat(s,1)} disabled={char[s]===3||remainingPoints===0} className="px-2 border rounded">+</button>
              </div>
            ))}
            <p className="mt-2 font-medium">Remaining Points: {remainingPoints}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Derived Stats</h2>
            <p><strong>Lifting Capacity:</strong> {computeLifting(char.strength)}</p>
            <p><strong>Carrying Capacity:</strong> {computeCarrying(char.strength)}</p>
            <p><strong>Movement Rate:</strong> {computeMovementRate(char.speed)} per action</p>
            <p><strong>Recovery Die:</strong> {computeRecoveryDie(char.willpower)}</p>
            <p><strong>Senses Range:</strong> {computeSensesRange(char.awareness)}</p>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            {SKILL_LIST.map(({name,base})=>{const rk=char.skills[name];return(
              <div key={name} className="flex justify-between items-center mb-2">
                <span className="font-medium">{name} ({ATTR_ABBREV[base]}: {char[base]})</span>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i=>(
                    <input key={i} type="checkbox" checked={i<=rk} disabled={!((i===rk+1&&rk<5)||(i===rk&&rk>0))} onChange={e=>changeSkillRank(name,i,e.target.checked)} className={`w-4 h-4 border rounded ${i<=rk?'bg-blue-500':''}`}/>
                  ))}
                </div>
              </div>
            );})}
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Surges</h2>
            {char.surges.map((s,i)=>(<div key={i} className="flex items-center mb-2"><input value={s} onChange={e=>updateSurge(i,e.target.value)} placeholder="Surge Name" className="flex-1 border rounded p-1"/><button onClick={()=>removeSurge(i)} className="ml-2 text-red-500">×</button></div>))}
            <button onClick={()=>addList('surges')} className="px-3 py-1 bg-blue-500 text-white rounded">Add Surge</button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Radiant Powers</h2>
            {char.radiancePowers.map((p,i)=>(<div key={i} className="flex items-center mb-2"><input value={p} onChange={e=>updateRadiance(i,e.target.value)} placeholder="Power Name" className="flex-1 border rounded p-1"/><button onClick={()=>removeRadiance(i)} className="ml-2 text-red-500">×</button></div>))}
            <button onClick={()=>addList('radiancePowers')} className="px-3 py-1 bg-blue-500 text-white rounded">Add Radiant Power</button>
          </div>
        </>
      )}
      <div className="mt-8 p-4 border rounded bg-gray-800 text-white">
        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(char,null,2)}</pre>
      </div>
    </div>
  );
}

