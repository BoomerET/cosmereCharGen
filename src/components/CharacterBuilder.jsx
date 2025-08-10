// ===== Enhanced Fantasy Grounds XML export (ancestry w/o culture) =====
const escapeXML = (s = '') => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const carryMax = (str) => {
  if (str === 0) return 50;
  if (str <= 2) return 100;
  if (str <= 4) return 250;
  if (str <= 6) return 500;
  if (str <= 8) return 2500;
  return 5000;
};
const liftMax = (str) => {
  if (str === 0) return 100;
  if (str <= 2) return 200;
  if (str <= 4) return 500;
  if (str <= 6) return 1000;
  if (str <= 8) return 5000;
  return 10000;
};

const movementFeet = (spd) => {
  if (spd === 0) return 20;
  if (spd <= 2) return 25;
  if (spd <= 4) return 30;
  if (spd <= 6) return 40;
  if (spd <= 8) return 60;
  return 80;
};
const recoveryDie = (wp) => {
  if (wp === 0) return 'd4';
  if (wp <= 2) return 'd6';
  if (wp <= 4) return 'd8';
  if (wp <= 6) return 'd10';
  if (wp <= 8) return 'd12';
  return 'd20';
};
const sensesString = (aw) => {
  if (aw === 0) return '5 feet';
  if (aw <= 2) return '10 feet';
  if (aw <= 4) return '20 feet';
  if (aw <= 6) return '50 feet';
  if (aw <= 8) return '100 feet';
  return 'Unaffected';
};

const sumSkillRanks = () =>
  SKILL_LIST.reduce((sum, { name }) => sum + (Number(char.skills[name]) || 0), 0);

// normalize “Listeners” -> “Listener” for culture labels if you ever surface them elsewhere
const normalizeCulture = (c) => (c === 'Listeners' ? 'Listener' : c);

const buildFGXML = () => {
  const name = char.characterName || 'Unnamed Character';
  const path = char.startingPath || '';
  const level = Number(char.level) || 1;

  const physicalDef   = 10 + (Number(char.strength)||0) + (Number(char.speed)||0);
  const cognitiveDef  = 10 + (Number(char.intellect)||0) + (Number(char.willpower)||0);
  const spiritualDef  = 10 + (Number(char.awareness)||0) + (Number(char.presence)||0);

  const hpTotal       = 10 + (Number(char.strength)||0);
  const focusTotal    = (Number(char.willpower)||0) + 2;

  const move          = movementFeet(Number(char.speed)||0);
  const senses        = sensesString(Number(char.awareness)||0);
  const recdie        = recoveryDie(Number(char.willpower)||0);

  const carry         = carryMax(Number(char.strength)||0);
  const lift          = liftMax(Number(char.strength)||0);

  // Skills
  let skillItems = '';
  let sid = 1;
  for (const { name: skName, base } of SKILL_LIST) {
    const rank = Number(char.skills[skName] || 0);
    const total = rank + Number(char[base] || 0);
    skillItems += `
      <id-${String(sid).padStart(5,'0')}>
        <bonus type="number">0</bonus>
        <name type="string">${escapeXML(skName)}</name>
        <rank type="number">${rank}</rank>
        <stat type="string">${base}</stat>
        <total type="number">${total}</total>
      </id-${String(sid).padStart(5,'0')}>`;
    sid++;
  }

  // Expertise (culture + extras)
  const cultureExpertise = (char.cultures || []).map(normalizeCulture);
  const extraExpertise   = char.expertise || [];
  const allExpertise     = [...new Set([...cultureExpertise, ...extraExpertise])];

  let expertiseItems = '';
  let eid = 1;
  for (const label of allExpertise) {
    expertiseItems += `
      <id-${String(eid).padStart(5,'0')}>
        <name type="string">${escapeXML(label)}</name>
      </id-${String(eid).padStart(5,'0')}>`;
    eid++;
  }

  // Paths node
  const pathBlock = path
    ? `
    <paths>
      <${escapeXML(path)}>
        <name type="string">${escapeXML(path)}</name>
        <shortcut type="windowreference">
          <class>reference_path</class>
          <recordname />
        </shortcut>
        <text type="formattedtext">
          <linklist />
        </text>
      </${escapeXML(path)}>
    </paths>`
    : '<paths />';

  // Ancestry name: DO NOT include culture
  const ancestryName = char.ancestry || 'Human';

  const totalsRanks = sumSkillRanks();
  const totalTalents = 0;
  const tier = 1;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<root version="4.8" dataversion="${new Date().toISOString().slice(0,10).replace(/-/g,'')}" release="8.1|CoreRPG:7">
  <character>
    <ancestry>
      <name type="string">${escapeXML(ancestryName)}</name>
      <shortcut type="windowreference">
        <class>reference_ancestry</class>
        <recordname />
      </shortcut>
      <text type="formattedtext">
        <p />
      </text>
    </ancestry>

    <attributes>
      <awareness><score type="number">${Number(char.awareness)||0}</score></awareness>
      <intellect><score type="number">${Number(char.intellect)||0}</score></intellect>
      <presence><score type="number">${Number(char.presence)||0}</score></presence>
      <speed><bonus type="number">0</bonus><score type="number">${Number(char.speed)||0}</score></speed>
      <strength><score type="number">${Number(char.strength)||0}</score></strength>
      <willpower><score type="number">${Number(char.willpower)||0}</score></willpower>
    </attributes>

    <coins>
      <id-00001>
        <amount type="number">0</amount>
        <name type="string">MK</name>
      </id-00001>
    </coins>

    <defenses>
      <cognitivedefense><score type="number">${cognitiveDef}</score></cognitivedefense>
      <physicaldefense><score type="number">${physicalDef}</score></physicaldefense>
      <spiritualdefense><score type="number">${spiritualDef}</score></spiritualdefense>
    </defenses>

    <deflect type="number">0</deflect>

    <encumbrance>
      <carry type="number">${carry}</carry>
      <load type="number">0</load>
      <max type="number">${lift}</max>
    </encumbrance>

    <expertise>${expertiseItems}
    </expertise>

    <focus>
      <bonus type="number">0</bonus>
      <current type="number">0</current>
      <total type="number">${focusTotal}</total>
    </focus>

    <goals />

    <hp>
      <bonus type="number">0</bonus>
      <total type="number">${hpTotal}</total>
      <wounds type="number">0</wounds>
    </hp>

    <inventorylist />

    <investiture>
      <current type="number">0</current>
      <enabled type="number">0</enabled>
      <total type="number">0</total>
    </investiture>

    <level type="number">${level}</level>
    <movement type="number">${move}</movement>
    <name type="string">${escapeXML(name)}</name>
    <path type="string">${escapeXML(path)}</path>
    ${pathBlock}
    <recdie type="dice">${recdie}</recdie>
    <senses type="string">${escapeXML(senses)}</senses>

    <skilllist>${skillItems}
    </skilllist>

    <talent />

    <tier type="number">${tier}</tier>
    <totalskillranks type="number">${totalsRanks}</totalskillranks>
    <totaltalents type="number">${totalTalents}</totaltalents>

    <weaponlist>
      <unarmedattack>
        <ammo type="number">0</ammo>
        <carried type="number">2</carried>
        <damagelist>
          <id-00001>
            <dice type="dice">d4</dice>
            <type type="string">impact</type>
            <weaponskill type="string">Athletics</weaponskill>
          </id-00001>
        </damagelist>
        <damageview type="string">1d4 impact</damageview>
        <experttraits type="string">Momentum, Offhand</experttraits>
        <handling type="number">0</handling>
        <maxammo type="number">0</maxammo>
        <name type="string">Unarmed Attack</name>
        <shortcut type="windowreference">
          <class />
          <recordname />
        </shortcut>
        <traits type="string">Unique</traits>
        <type type="number">0</type>
        <weaponskill type="string">Athletics</weaponskill>
      </unarmedattack>
    </weaponlist>

  </character>
</root>`;
  return xml;
};

const downloadXML = () => {
  const xml = buildFGXML();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(char.characterName || 'character').replace(/[^a-z0-9-_]/gi,'_')}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
