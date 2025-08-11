import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HeaderForm from "./HeaderForm";
import StatsTab from "./StatsTab";
import SkillsList from "./SkillsList";
import ListSection from "./ListSection";
import ExpertiseList from "./ExpertiseList";
import { SKILL_LIST, PATH_KEY_TALENT_MAP } from "../../globals/constants";

export default function CharacterBuilder() {
  const [char, setChar] = useState({
    playerName: "",
    characterName: "",
    ancestry: "Human",
    cultures: [],
    startingPath: "",
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

  const [tab, setTab] = useState("stats");

  const stats = [
    "strength",
    "speed",
    "intellect",
    "willpower",
    "awareness",
    "presence",
  ];
  const total = stats.reduce((sum, s) => sum + char[s], 0);
  const remaining = 12 - total;
  const hasPath = !!char.startingPath;
  const attrsDone = remaining === 0;
  const hasTwoCultures = (char.cultures?.length || 0) === 2;

  const isTabAccessible = (id) => {
    if (id === "stats") return true;
    const baseUnlocked = hasPath && attrsDone;
    if (!baseUnlocked) return false;
    if (id === "expertise") return hasTwoCultures;
    return true;
  };

  useEffect(() => {
    if (!isTabAccessible(tab)) setTab("stats");
  }, [tab, hasPath, attrsDone, hasTwoCultures]);

// Accepts either a DOM-like event ({ target: { name, value } }) or a plain object payload
const handleHeaderChange = (arg) => {
  // 1) DOM event path (keeps your existing multiple-select logic)
  if (arg && arg.target) {
    const { name, value, multiple, selectedOptions } = arg.target;
    const val = multiple
      ? Array.from(selectedOptions).map((o) => o.value).slice(0, 2)
      : value;
    setChar((prev) => ({ ...prev, [name]: val }));
    return;
  }

  // 2) Plain object path (normalize and merge into your current char shape)
  if (arg && typeof arg === "object") {
    setChar((prev) => {
      const next = { ...prev };

      // Path / level
      if (arg.startingPath != null) next.startingPath = arg.startingPath;
      if (arg.path != null) next.startingPath = arg.path; // tolerate "path" from HeaderForm
      if (arg.level != null) next.level = Number(arg.level) || 1;

      // Names
      if (arg.characterName != null) next.characterName = arg.characterName;
      if (arg.name != null) next.characterName = arg.name; // tolerate "name" from HeaderForm

      // Ancestry & cultures (if provided)
      if (typeof arg.ancestry === "string") next.ancestry = arg.ancestry;
      if (Array.isArray(arg.cultures)) next.cultures = arg.cultures.slice(0, 2);

      // Attributes: accept either flat (lowercase) or nested (capitalized) keys
      const clamp = (n) => Math.max(0, Math.min(3, Number(n) || 0));
      const applyAttr = (k, v) => (v == null ? undefined : (next[k] = clamp(v)));

      applyAttr("strength", arg.strength);
      applyAttr("speed", arg.speed);
      applyAttr("intellect", arg.intellect);
      applyAttr("willpower", arg.willpower);
      applyAttr("awareness", arg.awareness);
      applyAttr("presence", arg.presence);

      if (arg.attributes && typeof arg.attributes === "object") {
        const map = {
          Strength: "strength",
          Speed: "speed",
          Intellect: "intellect",
          Willpower: "willpower",
          Awareness: "awareness",
          Presence: "presence",
        };
        for (const [k, v] of Object.entries(arg.attributes)) {
          if (map[k]) applyAttr(map[k], v);
        }
      }

      return next;
    });
    return;
  }

  console.warn("Unexpected onChange payload from HeaderForm:", arg);
};

  const changeStat = (stat, delta) => {
    setChar((prev) => {
      const newVal = Math.min(3, Math.max(0, prev[stat] + delta));
      const newTotal = stats.reduce(
        (sum, s) => sum + (s === stat ? newVal : prev[s]),
        0
      );
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

  const addListItem = (field) =>
    setChar((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  const updateListItem = (field, i, val) =>
    setChar((prev) => {
      const arr = [...prev[field]];
      arr[i] = val;
      return { ...prev, [field]: arr };
    });
  const removeListItem = (field, i) =>
    setChar((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i),
    }));

  const TAB_CONFIG = [
    { id: "stats", label: "Attributes" },
    { id: "skills", label: "Skills" },
    { id: "expertise", label: "Expertise" },
    { id: "surges", label: "Surges" },
    { id: "radiant", label: "Radiant Powers" },
  ];

  const tooltipFor = (id) => {
    if (id === "stats") return undefined;
    if (!hasPath) return "Select a starting path to unlock tabs";
    if (!attrsDone)
      return `Distribute all attribute points — ${remaining} remaining`;
    if (id === "expertise" && !hasTwoCultures)
      return "Choose 2 Cultural Expertise to unlock";
    return undefined;
  };

  // ===== Enhanced Fantasy Grounds XML export (ancestry w/o culture) =====
  const escapeXML = (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

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
    if (wp === 0) return "d4";
    if (wp <= 2) return "d6";
    if (wp <= 4) return "d8";
    if (wp <= 6) return "d10";
    if (wp <= 8) return "d12";
    return "d20";
  };
  const sensesString = (aw) => {
    if (aw === 0) return "5 feet";
    if (aw <= 2) return "10 feet";
    if (aw <= 4) return "20 feet";
    if (aw <= 6) return "50 feet";
    if (aw <= 8) return "100 feet";
    return "Unaffected";
  };

  const sumSkillRanks = () =>
    SKILL_LIST.reduce(
      (sum, { name }) => sum + (Number(char.skills[name]) || 0),
      0
    );

  // normalize “Listeners” -> “Listener” for culture labels if you ever surface them elsewhere
  const normalizeCulture = (c) => (c === "Listeners" ? "Listener" : c);

  const buildFGXML = () => {
    const name = char.characterName || "Unnamed Character";
    const path = char.startingPath || "";
    const level = Number(char.level) || 1;

    const physicalDef =
      10 + (Number(char.strength) || 0) + (Number(char.speed) || 0);
    const cognitiveDef =
      10 + (Number(char.intellect) || 0) + (Number(char.willpower) || 0);
    const spiritualDef =
      10 + (Number(char.awareness) || 0) + (Number(char.presence) || 0);

    const hpTotal = 10 + (Number(char.strength) || 0);
    const focusTotal = (Number(char.willpower) || 0) + 2;

    const move = movementFeet(Number(char.speed) || 0);
    const senses = sensesString(Number(char.awareness) || 0);
    const recdie = recoveryDie(Number(char.willpower) || 0);

    const keyTalent = PATH_KEY_TALENT_MAP[char.startingPath] || "";
    const hasKeyTalent = Boolean(keyTalent);

    const carry = carryMax(Number(char.strength) || 0);
    const lift = liftMax(Number(char.strength) || 0);

    // Skills
    let skillItems = "";
    let sid = 1;
    for (const { name: skName, base } of SKILL_LIST) {
      const rank = Number(char.skills[skName] || 0);
      const total = rank + Number(char[base] || 0);
      skillItems += `
      <id-${String(sid).padStart(5, "0")}>
        <bonus type="number">0</bonus>
        <name type="string">${escapeXML(skName)}</name>
        <rank type="number">${rank}</rank>
        <stat type="string">${base}</stat>
        <total type="number">${total}</total>
      </id-${String(sid).padStart(5, "0")}>`;
      sid++;
    }

    // Expertise (culture + extras)
    const cultureExpertise = (char.cultures || []).map(normalizeCulture);
    const extraExpertise = char.expertise || [];
    const allExpertise = [...new Set([...cultureExpertise, ...extraExpertise])];

    let expertiseItems = "";
    let eid = 1;
    for (const label of allExpertise) {
      expertiseItems += `
      <id-${String(eid).padStart(5, "0")}>
        <name type="string">${escapeXML(label)}</name>
      </id-${String(eid).padStart(5, "0")}>`;
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
      : "<paths />";

    // Ancestry name: DO NOT include culture
    const ancestryName = char.ancestry || "Human";

    const totalsRanks = sumSkillRanks();
    const totalTalents = hasKeyTalent ? 1 : 0;
    const tier = 1;

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<root version="4.8" dataversion="${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}" release="8.1|CoreRPG:7">
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
      <awareness><score type="number">${
        Number(char.awareness) || 0
      }</score></awareness>
      <intellect><score type="number">${
        Number(char.intellect) || 0
      }</score></intellect>
      <presence><score type="number">${
        Number(char.presence) || 0
      }</score></presence>
      <speed><bonus type="number">0</bonus><score type="number">${
        Number(char.speed) || 0
      }</score></speed>
      <strength><score type="number">${
        Number(char.strength) || 0
      }</score></strength>
      <willpower><score type="number">${
        Number(char.willpower) || 0
      }</score></willpower>
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

    <talent>
      ${
        hasKeyTalent
          ? `
      <id-00001>
        <name type="string">${escapeXML(keyTalent)}</name>
        <type type="string">Key</type>
        <text type="formattedtext">
          <p /> 
        </text>
      </id-00001>`
          : ""
      }
    </talent>


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
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(char.characterName || "character").replace(
      /[^a-z0-9-_]/gi,
      "_"
    )}.xml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* <h1 className="text-3xl font-bold mb-4">Cosmere RPG Character Creator</h1> */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Cosmere RPG Character Creator</h1>
        <button
          type="button"
          onClick={downloadXML}
          disabled={!hasPath || !attrsDone}
          title={
            !hasPath
              ? "Select a starting path first"
              : !attrsDone
              ? "Distribute all attribute points first"
              : "Export Fantasy Grounds XML"
          }
          className={`px-3 py-2 rounded border ${
            !hasPath || !attrsDone
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-50"
          }`}
        >
          Export FG XML
        </button>
      </div>

      <HeaderForm
        char={char}
        onChange={handleHeaderChange}
        requirePathSelection
      />

      <div
        className="flex gap-2 border-b mb-2"
        role="tablist"
        aria-label="Character builder tabs"
      >
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
              className={`px-4 py-2 -mb-[2px] border-b-2 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }
                ${
                  tab === tabItem.id
                    ? "border-blue-500 text-blue-800 font-semibold"
                    : "border-transparent text-gray-600 hover:text-blue-700"
                }`}
              title={tooltipFor(tabItem.id)}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {!hasPath && (
        <p className="mb-2 text-sm text-gray-600">
          Select a starting path first.
        </p>
      )}
      {hasPath && !attrsDone && (
        <p className="mb-2 text-sm text-gray-600">
          Distribute all attribute points —{" "}
          <span className="font-medium">{remaining}</span> remaining.
        </p>
      )}
      {hasPath && attrsDone && !hasTwoCultures && (
        <p className="mb-2 text-sm text-gray-600">
          Pick exactly two items in{" "}
          <span className="font-medium">Cultural Expertise</span> to unlock the
          Expertise tab.
        </p>
      )}

      {tab === "stats" && (
        <StatsTab
          char={char}
          stats={stats}
          remainingPoints={remaining}
          onIncrement={(s) => changeStat(s, 1)}
          onDecrement={(s) => changeStat(s, -1)}
          showHealth
        />
      )}

      {tab === "skills" && (
        <SkillsList
          char={char}
          startingPath={char.startingPath}
          onChangeRank={changeSkillRank}
        />
      )}

      {tab === "expertise" && (
        <ExpertiseList
          char={char}
          onToggle={(opt) => {
            const has = char.expertise.includes(opt);
            setChar((prev) => ({
              ...prev,
              expertise: has
                ? prev.expertise.filter((x) => x !== opt)
                : [...prev.expertise, opt],
            }));
          }}
        />
      )}

      {tab === "surges" && (
        <ListSection
          title="Surges"
          items={char.surges}
          onAdd={() => addListItem("surges")}
          onChangeItem={(i, v) => updateListItem("surges", i, v)}
          onRemove={(i) => removeListItem("surges", i)}
        />
      )}

      {tab === "radiant" && (
        <ListSection
          title="Radiant Powers"
          items={char.radiancePowers}
          onAdd={() => addListItem("radiancePowers")}
          onChangeItem={(i, v) => updateListItem("radiancePowers", i, v)}
          onRemove={(i) => removeListItem("radiancePowers", i)}
        />
      )}
    </div>
  );
}

CharacterBuilder.propTypes = {
  // no props expected currently, but defining for potential future
};
