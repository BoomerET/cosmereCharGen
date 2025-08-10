// constants.js
export const CULTURE_OPTIONS = [
  'Alethi','Azish','Herdazian','Iriali','Kharbranthian',
  'Listeners','Natan','Reshi','Shin','Thaylen','Unkalaki','Veden'
];

export const STARTING_PATHS = ['Agent','Envoy','Hunter','Leader','Scholar','Warrior'];

// Centralized attribute list + points
export const ATTRIBUTES = ['strength','speed','intellect','willpower','awareness','presence'];
export const MAX_ATTRIBUTE_POINTS = 12;

// Centralized mapping: starting path -> free starting skill
export const PATH_DEFAULT_SKILL_MAP = {
  Agent:   'Insight',
  Envoy:   'Discipline',
  Hunter:  'Perception',
  Leader:  'Leadership',
  Scholar: 'Lore',
  Warrior: 'Athletics',
};

export const SKILL_LIST = [
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

// Expertise options additional to culture expertise
export const ARMOR_EXPERTISE_OPTIONS = [
  'Breastplate','Chain Armor','Half Plate','Leather','Shardplate'
];

export const CULTURAL_EXPERTISE_OPTIONS = [
  'Alethi', 'Azish', 'Herdazian', 'High Society', 'Iriali', 'Kharbranthian',
  'Listener', 'Military Life', 'Natan', 'Reshi', 'Shin', 'Thaylen',
  'Underworld', 'Unkalaki', 'Veden', 'Wayfarer'
]

export const UTILILTY_EXPERTISE_OPTIONS = [
'Animal Care','Armor Crafting','Culinary Arts','Engineering',
'Equipment','History','Literature','Military','Religion',
  'Riding Horses','Stormwardens','Visual Arts','Weapon Crafting'
]

export const WEAPON_EXPERTISE_OPTIONS = [
  'Axe', 'Crossbow', 'Grandbow', 'Greatsword', 'Half-Shard', 'Hammer',
  'Javelin', 'Knife', 'Longbow', 'Longspear', 'Longsword', 'Mace',
  'Poleaxe','Rapier','Shardblade','Shield','Shortbow','Shortspear',
  'Sidesword', 'Sling', 'Staff', 'Unarmed Attacks', 'Warhammer'
]

export const PATH_KEY_TALENT_MAP = {
  Agent: 'Opportunist',
  Envoy: 'Rousing Presence',
  Hunter: 'Seek Quarry',
  Leader: 'Decisive Command',
  Scholar: 'Erudition',
  Warrior: 'Vigilant Stance',
};
