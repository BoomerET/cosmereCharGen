import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HeaderForm from "./HeaderForm";
import StatsTab from "./StatsTab";
import SkillsList from "./SkillsList";
import ListSection from "./ListSection";
import ExpertiseList from "./ExpertiseList";
import KeyTalentTab from "./KeyTalentTab";
import { SKILL_LIST } from "../../globals/constants";

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
    keyTalent: "",
  });

  const [tab, setTab] = useState("stats");

  const stats = ["strength","speed","intellect","willpower","awareness","presence"];
  const total = stats.reduce((sum, s) => sum + char[s], 0);
  const remaining = 12 - total;
  const hasPath = !!char.startingPath;
  const attrsDone = remaining === 0;

  const isTabAccessible = (id) => {
    if (id === "stats") return true;
    const baseUnlocked = hasPath && attrsDone;
    if (!baseUnlocked) return false;
    return true;
  };

  useEffect(() => {
    if (!isTabAccessible(tab)) setTab("stats");
  }, [tab, hasPath, attrsDone]);

  // Accepts either a DOM-like event or a plain object from HeaderForm
  const handleHeaderChange = (arg) => {
    const mergeFromPayload = (payload) => {
      if (!payload || typeof payload !== "object") return;

      setChar((prev) => {
        let changed = false;
        const next = { ...prev };

        // Names / level
        if (payload.name != null && payload.name !== prev.characterName) {
          next.characterName = payload.name;
          changed = true;
        }
        if (payload.characterName != null && payload.characterName !== prev.characterName) {
          next.characterName = payload.characterName;
          changed = true;
        }
        if (payload.level != null) {
          const lvl = Number(payload.level) || 1;
          if (lvl !== prev.level) {
            next.level = lvl;
            changed = true;
          }
        }

        // Path normalization
        const newPath = payload.startingPath ?? payload.path;
        if (newPath != null && newPath !== prev.startingPath) {
          next.startingPath = newPath;
          next.strength = 0;
          next.speed = 0;
          next.intellect = 0;
          next.willpower = 0;
          next.awareness = 0;
          next.presence = 0;

          // reset skills (all to 0)
          next.skills = SKILL_LIST.reduce((acc, { name }) => {
            acc[name] = 0;
            return acc;
          }, {});

          // reset culture & extra expertise
          next.cultures  = [];
          next.expertise = [];         

          changed = true;
        }

        // Ancestry & attributes
        if (typeof payload.ancestry === "string" && payload.ancestry !== prev.ancestry) {
          next.ancestry = payload.ancestry;
          changed = true;
        }

        const clamp = (n) => Math.max(0, Math.min(3, Number(n) || 0));
        const setAttr = (key, raw) => {
          if (raw == null) return;
          const v = clamp(raw);
          if (v !== prev[key]) {
            next[key] = v;
            changed = true;
          }
        };

  // when path changes (in handleHeaderChange), clear keyTalent if it no longer applies:
if (newPath != null && newPath !== prev.startingPath) {
  next.startingPath = newPath;
  next.keyTalent = "";      // reset selection on path change
  changed = true;
}


        setAttr("strength", payload.strength);
        setAttr("speed", payload.speed);
        setAttr("intellect", payload.intellect);
        setAttr("willpower", payload.willpower);
        setAttr("awareness", payload.awareness);
        setAttr("presence", payload.presence);

        if (payload.attributes && typeof payload.attributes === "object") {
          const map = {
            Strength: "strength",
            Speed: "speed",
            Intellect: "intellect",
            Willpower: "willpower",
            Awareness: "awareness",
            Presence: "presence",
          };
          for (const [k, v] of Object.entries(payload.attributes)) {
            if (map[k]) setAttr(map[k], v);
          }
        }

        if ("headerForm" in next) {
          delete next.headerForm;
          changed = true;
        }

        return changed ? next : prev;
      });
    };

    // DOM-like event path
    if (arg && arg.target) {
      const { name, value, multiple, selectedOptions } = arg.target;

      if (name === "headerForm") {
        mergeFromPayload(value);
        return;
      }

      const val = multiple
        ? Array.from(selectedOptions).map((o) => o.value).slice(0, 2)
        : value;

      setChar((prev) => {
        const key = name === "path" ? "startingPath" : name; // normalize
        const nextVal = key === "level" ? (Number(val) || 1) : val;
        if (prev[key] === nextVal) return prev; // no-op
        const next = { ...prev, [key]: nextVal };
        if ("headerForm" in next) delete next.headerForm; // keep state clean
        return next;
      });
      return;
    }

    // Plain object payload path
    const payload = arg && arg.target ? arg.target.value : arg;
    if (!payload || typeof payload !== "object") {
      console.warn("Unexpected onChange payload from HeaderForm:", arg);
      return;
    }
    mergeFromPayload(payload);
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

  // Toggle cultural expertise (exactly 2)
  const toggleCulture = (label) => {
    setChar((prev) => {
      const cur = new Set(prev.cultures || []);
      if (cur.has(label)) {
        cur.delete(label);
      } else {
        if (cur.size >= 2) return prev; // enforce cap
        cur.add(label);
      }
      return { ...prev, cultures: Array.from(cur) };
    });
  };

  // Toggle extra expertise (cap = Intellect)
  const toggleExtraExpertise = (label) => {
    setChar((prev) => {
      const has = prev.expertise.includes(label);
      if (has) {
        return { ...prev, expertise: prev.expertise.filter((x) => x !== label) };
      }
      const maxExtras = Math.max(0, Number(prev.intellect) || 0);
      if (prev.expertise.length >= maxExtras) return prev;
      return { ...prev, expertise: [...prev.expertise, label] };
    });
  };

  const TAB_CONFIG = [
    { id: "stats", label: "Attributes" },
    { id: "skills", label: "Skills" },
    { id: "expertise", label: "Expertise" },
    { id: "key", label: "Talents" },
    { id: "surges", label: "Surges" },
    { id: "radiant", label: "Radiant Powers" },
  ];

  const tooltipFor = (id) => {
    if (id === "stats") return undefined;
    if (!hasPath) return "Select a starting path to unlock tabs";
    if (!attrsDone) return `Distribute all attribute points — ${remaining} remaining`;
    return undefined;
  };

  /* ===== FG XML export helpers and download (unchanged behavior) ===== */
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

  const normalizeCulture = (c) => (c === "Listeners" ? "Listener" : c);

  const buildFGXML = () => {
    const name = char.characterName || "Unnamed Character";
    const path = char.startingPath || "";
    const level = Number(char.level) || 1;
    const keyTalent = (char.keyTalent || "").trim();
    const hasKeyTalent = Boolean(keyTalent);

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

    //const keyTalent = PATH_KEY_TALENT_MAP[char.startingPath] || "";
    //const hasKeyTalent = Boolean(keyTalent);

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
      <awareness><score type="number">${Number(char.awareness) || 0}</score></awareness>
      <intellect><score type="number">${Number(char.intellect) || 0}</score></intellect>
      <presence><score type="number">${Number(char.presence) || 0}</score></presence>
      <speed><bonus type="number">0</bonus><score type="number">${Number(char.speed) || 0}</score></speed>
      <strength><score type="number">${Number(char.strength) || 0}</score></strength>
      <willpower><score type="number">${Number(char.willpower) || 0}</score></willpower>
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
      ${hasKeyTalent
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
    a.download = `${(char.characterName || "character").replace(/[^a-z0-9-_]/gi, "_")}.xml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
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
          className={`px-3 py-2 rounded border ${!hasPath || !attrsDone ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}`}
        >
          Export FG XML
        </button>
      </div>

      {/* <HeaderForm onChange={handleHeaderChange} /> */}
      <HeaderForm
  key={char.startingPath} // remount on path change
  initialValues={{
    name: char.characterName,
    level: char.level,
    path: char.startingPath,
    attributes: {
      Strength:  char.strength,
      Speed:     char.speed,
      Intellect: char.intellect,
      Willpower: char.willpower,
      Awareness: char.awareness,
      Presence:  char.presence,
    },
  }}
  onChange={handleHeaderChange}
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
              className={`px-4 py-2 -mb-[2px] border-b-2 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${tab === tabItem.id
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

      {tab === "key" && (
  <KeyTalentTab
    startingPath={char.startingPath}
    value={char.keyTalent}
    onSelect={(opt) => setChar((p) => ({ ...p, keyTalent: opt }))}
  />
)}

      {tab === "expertise" && (
        <ExpertiseList
          char={char}
          onToggleCulture={toggleCulture}
          onToggleExtra={toggleExtraExpertise}
        />
      )}

      {tab === "surges" && (
        <ListSection
          title="Surges"
          items={char.surges}
          onAdd={() => setChar((p) => ({ ...p, surges: [...p.surges, ""] }))}
          onChangeItem={(i, v) =>
            setChar((p) => {
              const arr = [...p.surges];
              arr[i] = v;
              return { ...p, surges: arr };
            })
          }
          onRemove={(i) =>
            setChar((p) => ({ ...p, surges: p.surges.filter((_, idx) => idx !== i) }))
          }
        />
      )}

      {tab === "radiant" && (
        <ListSection
          title="Radiant Powers"
          items={char.radiancePowers}
          onAdd={() => setChar((p) => ({ ...p, radiancePowers: [...p.radiancePowers, ""] }))}
          onChangeItem={(i, v) =>
            setChar((p) => {
              const arr = [...p.radiancePowers];
              arr[i] = v;
              return { ...p, radiancePowers: arr };
            })
          }
          onRemove={(i) =>
            setChar((p) => ({ ...p, radiancePowers: p.radiancePowers.filter((_, idx) => idx !== i) }))
          }
        />
      )}
    </div>
  );
}

CharacterBuilder.propTypes = {
  // no props expected currently
};

