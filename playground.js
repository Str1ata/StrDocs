'use strict';

/* Playground do Str.functions.
   Reproduz em JavaScript a lógica de cada função de Str.lua/client.lua sobre um servidor
   SIMULADO (dois jogadores online, itens/veículos/grupos das configs reais). Nenhum Lua real roda.
   Argumentos são escritos como valores Lua: 42, 'texto', true, nil, { chave = 1 }. */
(function () {
    const root = document.getElementById('playground');
    if (!root || typeof serverSections === 'undefined') return;

    const t = (key, vars) => window.StrI18n.t(key, vars);
    const pick = (pair) => window.StrI18n.pick(pair);

    /* =================================================================
       Semântica Lua mínima
       ================================================================= */
    class LuaError extends Error {}
    class ParseError extends Error {}

    class Vec {
        constructor(...c) { this.c = c.map(Number); }
        get x() { return this.c[0]; }
        get y() { return this.c[1]; }
        get z() { return this.c[2]; }
        get w() { return this.c[3]; }
    }

    const isNil = (v) => v === undefined || v === null;
    const truthy = (v) => !isNil(v) && v !== false;
    const or = (a, b) => (truthy(a) ? a : b);

    function luaType(v) {
        if (isNil(v)) return 'nil';
        if (v instanceof Vec) return `vector${v.c.length}`;
        if (typeof v === 'object') return 'table';
        return typeof v;
    }

    function tostr(v) {
        if (isNil(v)) return 'nil';
        if (typeof v === 'object' || typeof v === 'function') return `${luaType(v)}: 0x0`;
        return String(v);
    }

    function toNum(v, what) {
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
        throw new LuaError(`attempt to perform arithmetic on a ${luaType(v)} value${what ? ` (${what})` : ''}`);
    }

    function gt0(v, what) {
        if (typeof v === 'number') return v > 0;
        throw new LuaError(`attempt to compare number with ${luaType(v)}${what ? ` (${what})` : ''}`);
    }

    function index(tbl, key, what) {
        if (isNil(tbl)) throw new LuaError(`attempt to index a nil value${what ? ` (${what})` : ''}`);
        if (typeof tbl !== 'object') {
            if (typeof tbl === 'string') return undefined;
            throw new LuaError(`attempt to index a ${luaType(tbl)} value${what ? ` (${what})` : ''}`);
        }
        if (Array.isArray(tbl)) return typeof key === 'number' ? tbl[key - 1] : undefined;
        return tbl[key];
    }

    function concat(a, b, what) {
        if (isNil(b) || typeof b === 'object' || typeof b === 'boolean') {
            throw new LuaError(`attempt to concatenate a ${luaType(b)} value${what ? ` (${what})` : ''}`);
        }
        return `${a}${b}`;
    }

    /* Tamanho de sequência (#t). */
    function len(tbl) {
        if (Array.isArray(tbl)) {
            let n = 0;
            while (n < tbl.length && tbl[n] !== undefined) n += 1;
            return n;
        }
        if (tbl && typeof tbl === 'object') {
            let n = 0;
            while (tbl[n + 1] !== undefined) n += 1;
            return n;
        }
        if (typeof tbl === 'string') return tbl.length;
        throw new LuaError(`attempt to get length of a ${luaType(tbl)} value`);
    }

    /* pairs(): devolve [chave, valor] respeitando listas 1-based. */
    function pairs(tbl) {
        if (Array.isArray(tbl)) return tbl.map((v, i) => [i + 1, v]).filter(([, v]) => v !== undefined);
        if (tbl && typeof tbl === 'object') return Object.keys(tbl).map((k) => [/^\d+$/.test(k) ? Number(k) : k, tbl[k]]).filter(([, v]) => v !== undefined);
        throw new LuaError(`bad argument #1 to 'for iterator' (table expected, got ${luaType(tbl)})`);
    }

    function tableRemove(list, pos) {
        if (Array.isArray(list)) list.splice(pos - 1, 1);
        else delete list[pos];
    }

    /* json.encode estável, usado nas comparações de metadata. */
    function enc(v) {
        if (isNil(v)) return 'null';
        if (Array.isArray(v)) return `[${v.map(enc).join(',')}]`;
        if (v instanceof Vec) return `[${v.c.join(',')}]`;
        if (typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${enc(v[k])}`).join(',')}}`;
        return JSON.stringify(v);
    }

    function clone(v) {
        if (v instanceof Vec) return new Vec(...v.c);
        if (Array.isArray(v)) return v.map(clone);
        if (v && typeof v === 'object') {
            const out = {};
            Object.keys(v).forEach((k) => { out[k] = clone(v[k]); });
            return out;
        }
        return v;
    }

    /* GetHashKey (joaat), com sinal como no FiveM. */
    function joaat(text) {
        let hash = 0;
        const s = String(text).toLowerCase();
        for (let i = 0; i < s.length; i += 1) {
            hash = (hash + s.charCodeAt(i)) >>> 0;
            hash = (hash + (hash << 10)) >>> 0;
            hash = (hash ^ (hash >>> 6)) >>> 0;
        }
        hash = (hash + (hash << 3)) >>> 0;
        hash = (hash ^ (hash >>> 11)) >>> 0;
        hash = (hash + (hash << 15)) >>> 0;
        return hash | 0;
    }

    /* ---------- Formatação de valores Lua ---------- */
    function luaKey(k) {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : `[${JSON.stringify(k)}]`;
    }

    function fmtNum(n) {
        if (Number.isInteger(n)) return String(n);
        return String(Number(n.toFixed(6)));
    }

    function toLua(v, depth = 0) {
        if (isNil(v)) return 'nil';
        if (typeof v === 'string') return JSON.stringify(v);
        if (typeof v === 'number') return fmtNum(v);
        if (typeof v === 'boolean') return String(v);
        if (typeof v === 'function') return 'function: 0x0';
        if (v instanceof Vec) return `vector${v.c.length}(${v.c.map(fmtNum).join(', ')})`;
        const pad = '    '.repeat(depth + 1);
        const end = '    '.repeat(depth);
        let parts;
        if (Array.isArray(v)) {
            const n = len(v);
            const holes = n !== v.filter((x) => x !== undefined).length;
            parts = holes
                ? v.map((x, i) => (x === undefined ? null : `[${i + 1}] = ${toLua(x, depth + 1)}`)).filter(Boolean)
                : v.map((x) => toLua(x, depth + 1));
        } else {
            parts = Object.keys(v).filter((k) => v[k] !== undefined).map((k) => {
                const val = toLua(v[k], depth + 1);
                return /^\d+$/.test(k) ? `[${k}] = ${val}` : `${luaKey(k)} = ${val}`;
            });
        }
        if (!parts.length) return '{}';
        const oneLine = `{ ${parts.join(', ')} }`;
        if (oneLine.length <= 60 && !oneLine.includes('\n')) return oneLine;
        return `{\n${pad}${parts.join(`,\n${pad}`)}\n${end}}`;
    }

    /* ---------- Parser de valores Lua ---------- */
    function parseLuaList(src) {
        let i = 0;
        const s = src;

        function ws() {
            while (i < s.length) {
                if (/\s/.test(s[i])) i += 1;
                else if (s.startsWith('--', i)) { while (i < s.length && s[i] !== '\n') i += 1; }
                else break;
            }
        }

        function fail(msg) { throw new ParseError(msg); }

        function ident() {
            const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
            if (!m) return null;
            i += m[0].length;
            return m[0];
        }

        function str() {
            const q = s[i];
            i += 1;
            let out = '';
            while (i < s.length && s[i] !== q) {
                if (s[i] === '\\') {
                    const n = s[i + 1];
                    out += { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'" }[n] ?? n;
                    i += 2;
                } else {
                    out += s[i];
                    i += 1;
                }
            }
            if (s[i] !== q) fail(t('pg.parse.string'));
            i += 1;
            return out;
        }

        function num() {
            const m = /^-?(0x[0-9a-f]+|\d+\.?\d*(e[+-]?\d+)?|\.\d+(e[+-]?\d+)?)/i.exec(s.slice(i));
            if (!m) fail(t('pg.parse.unexpected', { near: s.slice(i, i + 12) }));
            i += m[0].length;
            return Number(m[0]);
        }

        function table() {
            i += 1;
            const positional = [];
            const keyed = {};
            let hasKeys = false;
            for (;;) {
                ws();
                if (s[i] === '}') { i += 1; break; }
                if (i >= s.length) fail(t('pg.parse.table'));
                if (s[i] === '[') {
                    i += 1;
                    const k = value();
                    ws();
                    if (s[i] !== ']') fail(t('pg.parse.table'));
                    i += 1;
                    ws();
                    if (s[i] !== '=') fail(t('pg.parse.table'));
                    i += 1;
                    keyed[String(k)] = value();
                    hasKeys = true;
                } else {
                    const save = i;
                    const id = ident();
                    ws();
                    if (id && s[i] === '=' && s[i + 1] !== '=') {
                        i += 1;
                        keyed[id] = value();
                        hasKeys = true;
                    } else {
                        i = save;
                        positional.push(value());
                    }
                }
                ws();
                if (s[i] === ',' || s[i] === ';') i += 1;
                else if (s[i] !== '}') fail(t('pg.parse.table'));
            }
            if (!hasKeys) return positional;
            positional.forEach((v, n) => { keyed[String(n + 1)] = v; });
            const keys = Object.keys(keyed);
            if (keys.every((k) => /^\d+$/.test(k))) {
                const nums = keys.map(Number).sort((a, b) => a - b);
                if (nums.every((n, j) => n === j + 1)) return nums.map((n) => keyed[String(n)]);
            }
            return keyed;
        }

        function value() {
            ws();
            const c = s[i];
            if (c === undefined) fail(t('pg.parse.end'));
            if (c === '{') return table();
            if (c === '"' || c === "'") return str();
            if (/[-0-9.]/.test(c)) return num();
            const id = ident();
            if (id === 'nil') return undefined;
            if (id === 'true') return true;
            if (id === 'false') return false;
            if (id === 'vector3' || id === 'vector4' || id === 'vec3' || id === 'vec4') {
                ws();
                if (s[i] !== '(') fail(t('pg.parse.unexpected', { near: id }));
                i += 1;
                const comps = [];
                for (;;) {
                    ws();
                    if (s[i] === ')') { i += 1; break; }
                    comps.push(num());
                    ws();
                    if (s[i] === ',') i += 1;
                }
                return new Vec(...comps);
            }
            fail(t('pg.parse.unexpected', { near: id || s.slice(i, i + 12) }));
            return undefined;
        }

        const values = [];
        ws();
        if (i >= s.length) return values;
        for (;;) {
            values.push(value());
            ws();
            if (s[i] === ',') { i += 1; continue; }
            if (i < s.length) fail(t('pg.parse.unexpected', { near: s.slice(i, i + 12) }));
            break;
        }
        return values;
    }

    function parseLuaValue(src) {
        const list = parseLuaList(src);
        if (list.length > 1) throw new ParseError(t('pg.parse.single'));
        return list[0];
    }

    /* "function() return <valores> end" vira um handler que devolve esses valores. */
    function parseLuaFunction(src) {
        const m = /^function\s*\([^)]*\)\s*(?:return\s+([\s\S]*?))?\s*end\s*$/.exec(src.trim());
        if (!m) throw new ParseError(t('pg.parse.function'));
        const values = m[1] ? parseLuaList(m[1]) : [];
        const fn = () => clone(values);
        fn.luaSource = src.trim();
        return fn;
    }

    /* =================================================================
       Dados: trechos fiéis das configs reais (configuration/*.json)
       ================================================================= */
    const noWeapon = { isWeapon: false, weaponModel: '', ammoItem: '' };
    const ITEMS = {
        backpackS: { label: 'Backpack pequena', description: 'Uma mochila pequena que aumenta a capacidade de carga do jogador', weight: 1, capacity: 20, type: 'use', icon: 'fa-box', maxStack: 100, fabricate: { enabled: true, items: { line: 1, needle: 1, cloth: 5 } }, repair: { items: [{ name: 'line', quantity: 1, chanceNeeded: 100 }, { name: 'needle', quantity: 1, chanceNeeded: 100 }, { name: 'cloth', quantity: 3, chanceNeeded: 100 }], groups: { Tailor: 1 } }, recyclable: true, defaultMetadata: {}, durability: { enabled: true, minutes: 43200, life: 100 }, weapon: noWeapon },
        backpackM: { label: 'Backpack media', description: 'Uma mochila média que aumenta a capacidade de carga do jogador', weight: 2, capacity: 40, type: 'use', icon: 'fa-box', maxStack: 100, fabricate: { enabled: true, items: { line: 2, needle: 1, cloth: 10 } }, repair: { items: [{ name: 'cloth', quantity: 5, chanceNeeded: 100 }], groups: { Tailor: 1 } }, recyclable: true, defaultMetadata: {}, durability: { enabled: true, minutes: 43200, life: 100 }, weapon: noWeapon },
        glockPistol: { label: 'Glock', description: 'Uma pistola Glock de 9mm', weight: 1, capacity: 0, type: 'weapon', icon: 'fa-box', maxStack: 100, fabricate: { enabled: true, items: { pistolMagazine: 1, slide: 1, frame: 1, barrel: 1, spring: 1, recoilSpringGuide: 1 } }, repair: { items: [{ name: 'pistolMagazine', quantity: 1, chanceNeeded: 50 }, { name: 'slide', quantity: 1, chanceNeeded: 50 }, { name: 'spring', quantity: 1, chanceNeeded: 100 }], groups: { GroveStreet: 3 } }, recyclable: true, defaultMetadata: {}, durability: { enabled: true, minutes: -1, life: 300 }, weapon: { isWeapon: true, weaponModel: 'WEAPON_PISTOL', ammoItem: '9mmAmmo' } },
        '9mmAmmo': { label: 'Munição 9mm', description: 'Munição 9mm compatível com a pistola Glock', weight: 0.1, capacity: 0, type: 'bullet', icon: 'fa-box', maxStack: 100, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon },
        line: { label: 'Linha', description: 'Linha de costura', weight: 0.1, capacity: 0, type: 'use', icon: 'fa-box', maxStack: 100, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon },
        needle: { label: 'Agulha', description: 'Agulha de costura', weight: 0.1, capacity: 0, type: 'use', icon: 'fa-box', maxStack: 100, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon },
        cloth: { label: 'Tecido', description: 'Tecido para costura', weight: 0.2, capacity: 0, type: 'use', icon: 'fa-box', maxStack: 100, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon },
        clothingShirt: { label: 'Camisa', description: 'Roupa guardada no inventário', weight: 0, capacity: 0, type: 'clothing', icon: 'fa-vest', maxStack: 1, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon },
        clothingJacket: { label: 'Jaqueta', description: 'Roupa guardada no inventário', weight: 0, capacity: 0, type: 'clothing', icon: 'fa-shirt', maxStack: 1, fabricate: { enabled: false, items: {} }, repair: { items: [], groups: {} }, recyclable: false, defaultMetadata: {}, durability: { enabled: false, minutes: -1, life: 0 }, weapon: noWeapon }
    };

    const VEHICLES = {
        adder: { exhibitionName: 'Adder', weight: { trunk: 20, gloveBox: 2 }, engine: { engineLabel: 'V12', engineType: 8, horsePower: 1000 }, fuel: { fuelCapacity: 80, fuelType: 'gasoline' }, prices: { price: { buy: 1000000, rent: 100 }, coin: { buy: 1000, rent: 100 } }, rentalTimeDays: 10, vehicleCategory: 'super', vehicleType: 'civilian', vehicleClass: 'car' },
        fq2: { exhibitionName: 'FQ2', weight: { trunk: 15, gloveBox: 2 }, engine: { engineLabel: 'V6', engineType: 6, horsePower: 300 }, fuel: { fuelCapacity: 60, fuelType: 'gasoline' }, prices: { price: { buy: 500000, rent: 50 }, coin: { buy: 500, rent: 50 } }, rentalTimeDays: 10, vehicleCategory: 'sedan', vehicleType: 'civilian', vehicleClass: 'car' },
        panto: { exhibitionName: 'Panto', weight: { trunk: 10, gloveBox: 2 }, engine: { engineLabel: 'I4', engineType: 4, horsePower: 100 }, fuel: { fuelCapacity: 40, fuelType: 'gasoline' }, prices: { price: { buy: 100000, rent: 10 }, coin: { buy: 100, rent: 10 } }, rentalTimeDays: 10, vehicleCategory: 'compact', vehicleType: 'civilian', vehicleClass: 'car' }
    };

    const GROUPS = {
        Citizen: { hierarchies: ['Citizen'] },
        Staff: { hierarchies: ['Owner', 'Manager', 'Admin', 'Moderator', 'Support'] },
        Police: { hierarchies: ['Chief', 'Captain', 'Lieutenant', 'Sergeant', 'Officer'] },
        Mechanic: { hierarchies: ['Master Mechanic', 'Senior Mechanic', 'Junior Mechanic', 'Apprentice'] },
        Tailor: { hierarchies: ['Tailor'] },
        GroveStreet: { hierarchies: ['Leader', 'Lieutenant', 'Soldier', 'Recruit'] }
    };

    /* getConfig retorna configuration/framework.json e os catálogos de idioma. */
    const CONFIG = {
        language: 'en-us',
        whitelist: { enable: true, hdwidBan: true },
        garage: { initialSlots: 3 },
        defaultPositions: { fivem: [-1037.71, -2738.01, 20.17, 330.0], redm: [-275.0868, 799.9835, 119.3745, 186.6775] },
        health: { healthRegenerationMultiplier: 0.0, healthRegenerationRate: 1000, maxHealth: 300 },
        hungerSystem: { enable: true, decayAmountPerSecond: 0.009 },
        thirstSystem: { enable: true, decayAmountPerSecond: 0.007 },
        stressSystem: { enable: true, decayAmountPerSecond: 0.0 }
    };
    const LANGUAGE = {
        Str: {
            checking_identifiers: 'Checking identifiers...',
            checking_ban_status: 'Checking ban status...'
        }
    };

    /* script_config.inventoryItems do Str_style. */
    const STYLE_ITEMS = {
        fivem: {
            comp_1: { itemId: 'clothingMask', label: 'Máscara', icon: 'fa-mask' },
            comp_11: { itemId: 'clothingJacket', label: 'Jaqueta', icon: 'fa-shirt' },
            comp_8: { itemId: 'clothingShirt', label: 'Camisa', icon: 'fa-vest' },
            comp_4: { itemId: 'clothingPants', label: 'Calça', icon: 'fa-person-walking' },
            comp_6: { itemId: 'clothingShoes', label: 'Calçados', icon: 'fa-shoe-prints' }
        },
        redm: {
            hats: { itemId: 'clothingHat', label: 'Chapéu', icon: 'fa-hat-cowboy' },
            coats: { itemId: 'clothingCoat', label: 'Casaco', icon: 'fa-shirt' },
            pants: { itemId: 'clothingPants', label: 'Calça', icon: 'fa-person-walking' },
            boots: { itemId: 'clothingBoots', label: 'Botas', icon: 'fa-shoe-prints' }
        }
    };

    const ADDER_HASH = joaat('adder');

    function freshWorld() {
        const w = {
            users: {
                7: { user_id: 7, whitelist: 1, banned: 0, ban_reason: null, ban_time: null, steamid: '110000112345678', license: '2f6c1d4e9a7b3c5d8e0f', license2: '9a8b7c6d5e4f3a2b1c0d', discordid: '281234567890123456', fivem: '1234567' },
                8: { user_id: 8, whitelist: 1, banned: 0, ban_reason: null, ban_time: null, steamid: null, license: '7c3e9f1a2b4d6e8f0a1b', license2: null, discordid: '391234567890123456', fivem: '7654321' },
                9: { user_id: 9, whitelist: 0, banned: 1, ban_reason: 'Uso de cheat', ban_time: null, steamid: null, license: 'ffee00112233445566aa', license2: null, discordid: null, fivem: null }
            },
            playersIds: {
                1: { userId: 7, identifiers: { steam: '110000112345678', license: '2f6c1d4e9a7b3c5d8e0f', license2: '9a8b7c6d5e4f3a2b1c0d', clientIp: '127.0.0.1', discord: '281234567890123456', fivemId: '1234567', hdwids: ['2:4f1c9a0e7d3b', '3:8b2e6d1f0c9a', '5:0a1b2c3d4e5f'] } },
                2: { userId: 8, identifiers: { steam: 'not found', license: '7c3e9f1a2b4d6e8f0a1b', license2: 'not found', clientIp: '127.0.0.2', discord: '391234567890123456', fivemId: '7654321', hdwids: ['2:77aa88bb99cc', '3:1d2e3f4a5b6c'] } }
            },
            playersData: {
                1: {
                    userId: 7,
                    characterId: 42,
                    identity: { name: 'João', middleName: '', lastName: 'Silva', document: 'RG', documentNumber: '123456789', photo: '', age: 27, gender: 'M', activePhoneNumber: '555-0142' },
                    groups: { Staff: 3, Mechanic: 4 },
                    inventory: [
                        { name: 'backpackS', amount: 1 },
                        { name: '9mmAmmo', amount: 30 },
                        { name: 'glockPistol', amount: 1, metadata: { serial: 'GLK-0042', durability: 300 } },
                        { name: 'cloth', amount: 5 }
                    ],
                    economy: { cash: 125, bankMoney: 2400, coins: 10, crypto: { BTC: 0.5 } },
                    vehicles: {
                        17: { model: 'fq2', lastGarage: 'pillbox', lastLocation: { x: 215.3, y: -810.1, z: 30.7 }, state: 1, tunings: {}, fuelLevel: 72.5, taxesDueAt: null, odometer: 1530.4, damages: { body: 0, engine: 0 }, rentalExpiresAt: null, inventory: {}, arrested: false, dismantled: false }
                    },
                    clothes: {
                        faceData: { selections: { nose: 3, eyes: 1 } },
                        clothesData: {
                            selections: { comp_11: { drawable: 4, texture: 0 }, comp_4: { drawable: 10, texture: 2 } },
                            outfits: { Trabalho: { name: 'Trabalho', selections: { comp_11: { drawable: 55, texture: 0 } } } }
                        }
                    },
                    position: new Vec(-1037.71, -2738.01, 20.17, 330.0),
                    status: { health: 200, armor: 25, hunger: 82, thirst: 74, stress: 6 }
                },
                2: {
                    userId: 8,
                    characterId: 51,
                    identity: { name: 'Maria', middleName: '', lastName: 'Souza', document: 'RG', documentNumber: '987654321', photo: '', age: 31, gender: 'F', activePhoneNumber: '555-0151' },
                    groups: { Police: 5 },
                    inventory: [{ name: 'line', amount: 2 }],
                    economy: { cash: 40, bankMoney: 900, coins: 0, crypto: {} },
                    vehicles: {},
                    clothes: { faceData: {}, clothesData: {} },
                    position: new Vec(441.2, -982.1, 30.7, 90.0),
                    status: { health: 180, armor: 50, hunger: 60, thirst: 55, stress: 12 }
                }
            },
            peds: {
                1: { health: 200, armor: 25, coords: new Vec(-1031.4, -2731.9, 20.17) },
                2: { health: 180, armor: 50, coords: new Vec(441.2, -982.1, 30.7) }
            },
            states: {},
            global: {
                'Str:language': 'en-us',
                'Str:scripts': '["Str_admin","Str_bank","Str_chat","Str_creator","Str_hud","Str_identity","Str_inputs","Str_inventory","Str_mobilities","Str_notifications","Str_phone","Str_style","Str_target"]'
            },
            serverTunnel: {},
            clientTunnel: {},
            fx: []
        };
        Object.keys(w.playersData).forEach((key) => {
            const pd = w.playersData[key];
            const st = {
                characterId: pd.characterId,
                identity: clone(pd.identity),
                health: pd.status.health,
                armor: pd.status.armor,
                hunger: pd.status.hunger,
                thirst: pd.status.thirst,
                stress: pd.status.stress,
                cash: pd.economy.cash,
                bankMoney: pd.economy.bankMoney,
                coins: pd.economy.coins,
                cryptos: clone(pd.economy.crypto),
                seatbelt: false,
                'Str:phase': 'playing'
            };
            Object.keys(pd.groups).forEach((g) => { st[`group_${g}`] = pd.groups[g]; });
            w.states[key] = st;
        });
        return w;
    }

    let W = freshWorld();

    /* ---------- efeitos colaterais visíveis na saída ---------- */
    function fx(kind, text) { W.fx.push({ kind, text }); }

    function setState(source, key, value, replicated) {
        const k = tostr(source);
        if (!W.states[k]) W.states[k] = {};
        if (isNil(value)) delete W.states[k][key];
        else W.states[k][key] = clone(value);
        fx('state', `Player(${k}).state:set(${JSON.stringify(key)}, ${toLua(value)}${replicated === undefined ? '' : `, ${replicated}`})${replicated ? '' : ` — ${t('pg.fx.notReplicated')}`}`);
    }

    function stateOf(source) { return W.states[tostr(source)] || {}; }

    function sql(text) { fx('sql', `MySQL: ${text}`); }

    /* =================================================================
       Implementações (portadas de Str.lua / client.lua)
       ================================================================= */
    const S = {}; /* server */
    const C = {}; /* client */
    const vehicleModels = {};
    const vehicleHashes = {};
    Object.keys(VEHICLES).forEach((model) => {
        const hash = joaat(model);
        vehicleModels[hash] = model;
        vehicleHashes[model] = hash;
    });

    const pd = (sourceKey) => W.playersData[sourceKey];
    const keyOf = (source) => tostr(source);
    const keyByChar = (characterId) => keyOf(srcByChar(characterId));

    /* Tunnel */
    const CORE_SERVER_TUNNEL = {
        getConfig: () => [{ config: clone(CONFIG), language: clone(LANGUAGE) }],
        getGroupsConfig: () => [clone(GROUPS)],
        getVehiclesConfig: () => [clone(VEHICLES)],
        getItemsConfig: () => [clone(ITEMS)]
    };
    const NOT_SIMULATED_SERVER = ['getInventoryConfig', 'getTargetConfig', 'getMobilitiesConfig'];

    function callServerHandler(name, args) {
        const handler = W.serverTunnel[name] || CORE_SERVER_TUNNEL[name];
        if (handler) return handler(...args);
        if (NOT_SIMULATED_SERVER.includes(name)) {
            fx('warn', t('pg.fx.notSimulated', { name }));
            return [];
        }
        fx('warn', t('pg.fx.noHandler', { name }));
        return [];
    }

    function callClientHandler(source, name, args) {
        const handler = W.clientTunnel[name];
        if (handler) return handler(...args);
        fx('warn', t('pg.fx.noHandler', { name }));
        return [];
    }

    S.getTunnelFunction = (async, source, functionName, ...args) => {
        if (!W.peds[tostr(source)]) return [undefined];
        if (!truthy(async)) {
            fx('event', `TriggerClientEvent("Str:duplicityClientVersion", ${tostr(source)}, "Str:tempEvent:N…", ${toLua(functionName)})`);
            return callClientHandler(source, functionName, args);
        }
        fx('event', `TriggerClientEvent("Str:duplicityClientVersion", ${tostr(source)}, nil, ${toLua(functionName)})`);
        if (W.clientTunnel[functionName]) W.clientTunnel[functionName](...args);
        return [];
    };
    S.syncTunnelFunction = (...args) => S.getTunnelFunction(false, ...args);
    S.asyncTunnelFunction = (...args) => { S.getTunnelFunction(true, ...args); return []; };
    S.registerTunnelFunction = (funcName, func) => {
        W.serverTunnel[funcName] = func;
        fx('info', t('pg.fx.registered', { name: tostr(funcName), side: 'server' }));
        return [];
    };

    S.updatePlayersData = (source) => {
        const data = pd(keyOf(source));
        if (!data) return [];
        const characterId = data.characterId;
        if (!characterId) return [];
        if (data.inventory) sql(`INSERT INTO inventories (inventory_id, inventory_data) VALUES (${characterId}, '${enc(data.inventory)}') ON DUPLICATE KEY UPDATE …`);
        if (data.economy) sql(`INSERT INTO banks (character_id, cash, bank_money, coins, crypto) VALUES (${characterId}, ${data.economy.cash || 0}, ${data.economy.bankMoney || 0}, ${data.economy.coins || 0}, '${enc(data.economy.crypto || {})}') ON DUPLICATE KEY UPDATE …`);
        if (data.groups) sql(t('pg.fx.groupsSave', { id: characterId }));
        if (data.vehicles) pairs(data.vehicles).forEach(([id]) => sql(`UPDATE vehicles SET … WHERE vehicle_id = ${id} AND character_id = ${characterId}`));
        if (data.clothes) sql(`INSERT INTO closets (character_id, face_data, clothes_data) VALUES (${characterId}, …) ON DUPLICATE KEY UPDATE …`);
        if (data.position) sql(`UPDATE characters SET position = '${enc(data.position)}' WHERE character_id = ${characterId}`);
        return [];
    };

    /* Veículos (configuração) */
    S.getVehicleHash = (model) => [vehicleHashes[model]];
    S.getVehicleModel = (hash) => [vehicleModels[hash]];
    S.getVehicleConfig = (m) => {
        if (typeof m === 'string') return [VEHICLES[m]];
        if (typeof m === 'number') return [VEHICLES[vehicleModels[m]]];
        return [undefined];
    };
    const vcfg = (m) => S.getVehicleConfig(m)[0];
    S.getVehicleName = (m) => { const c = vcfg(m); return [c && c.exhibitionName ? c.exhibitionName : undefined]; };
    S.getVehicleTrunkCapacity = (m) => { const c = vcfg(m); return [c && truthy(index(c.weight, 'trunk', "field 'weight'")) ? c.weight.trunk : undefined]; };
    S.getVehicleGloveBoxCapacity = (m) => { const c = vcfg(m); return [c && truthy(index(c.weight, 'gloveBox', "field 'weight'")) ? c.weight.gloveBox : undefined]; };
    S.getVehicleEngineSpecs = (m) => { const c = vcfg(m); return [c && c.engine ? c.engine : undefined]; };
    S.getVehicleFuelCapacity = (m) => { const c = vcfg(m); return [c && c.fuel && c.fuel.fuelCapacity ? c.fuel.fuelCapacity : undefined]; };
    S.getVehicleFuelType = (m) => { const c = vcfg(m); return [c && c.fuel && c.fuel.fuelType ? c.fuel.fuelType : undefined]; };
    S.getVehicleBuyMoneyPrice = (m) => { const c = vcfg(m); return [c && c.prices && c.prices.price && c.prices.price.buy ? c.prices.price.buy : undefined]; };
    S.getVehicleBuyCoinPrice = (m) => { const c = vcfg(m); return [c && c.prices && c.prices.coin && c.prices.coin.buy ? c.prices.coin.buy : undefined]; };
    S.getVehicleRentalMoneyPrice = (m) => { const c = vcfg(m); return [c && c.prices && c.prices.price && c.prices.price.rent ? c.prices.price.rent : undefined]; };
    S.getVehicleRentalCoinPrice = (m) => { const c = vcfg(m); return [c && c.prices && c.prices.coin && c.prices.coin.rent ? c.prices.coin.rent : undefined]; };
    S.getVehicleRentalTimeDays = (m) => { const c = vcfg(m); return [c && c.rentalTimeDays ? c.rentalTimeDays : undefined]; };
    S.getVehicleCategory = (m) => { const c = vcfg(m); return [c && c.vehicleCategory ? c.vehicleCategory : undefined]; };
    S.getVehicleType = (m) => { const c = vcfg(m); return [c && c.vehicleType ? c.vehicleType : undefined]; };
    S.getVehicleClass = (m) => { const c = vcfg(m); return [c && c.vehicleClass ? c.vehicleClass : undefined]; };

    /* Itens (configuração) */
    const icfg = (item) => (typeof item === 'string' ? ITEMS[item] : undefined);
    function normalizeItemRequirements(ingredients) {
        if (isNil(ingredients) || typeof ingredients !== 'object') return undefined;
        const out = [];
        const addIngredient = (name, ing) => {
            if (ing && typeof ing === 'object') out.push({ name: or(ing.name, name), quantity: ing.quantity, chanceNeeded: or(ing.chanceNeeded, 100) });
            else out.push({ name, quantity: ing, chanceNeeded: 100 });
        };
        if (len(ingredients) > 0) pairs(ingredients).forEach(([k, v]) => addIngredient(k, v));
        else pairs(ingredients).forEach(([k, v]) => addIngredient(k, v));
        return out;
    }
    S.getItemConfig = (item) => [icfg(item)];
    S.getItemLabel = (item) => { const c = icfg(item); return [c ? or(c.label, undefined) : undefined]; };
    S.getItemDescription = (item) => { const c = icfg(item); return [c ? or(c.description, undefined) : undefined]; };
    S.getItemWeight = (item) => { const c = icfg(item); return [c ? or(c.weight, undefined) : undefined]; };
    S.getItemCapacity = (item) => { const c = icfg(item); return [c ? or(c.capacity, undefined) : undefined]; };
    S.getItemType = (item) => { const c = icfg(item); return [c ? or(c.type, undefined) : undefined]; };
    S.getItemFabrication = (item) => { const c = icfg(item); return [c ? or(c.fabricate, undefined) : undefined]; };
    S.isItemFabricationEnabled = (item) => { const f = S.getItemFabrication(item)[0]; return [!isNil(f) && f.enabled === true]; };
    S.getItemFabricationItems = (item) => { const f = S.getItemFabrication(item)[0]; return [normalizeItemRequirements(f && f.items)]; };
    S.getItemRepair = (item) => { const c = icfg(item); return [c ? or(c.repair, undefined) : undefined]; };
    S.getItemRepairItems = (item) => { const r = S.getItemRepair(item)[0]; return [normalizeItemRequirements(r && r.items)]; };
    S.getItemRepairGroups = (item) => { const r = S.getItemRepair(item)[0]; return [r ? or(r.groups, undefined) : undefined]; };
    S.isItemRepairable = (item) => { const ing = S.getItemRepairItems(item)[0]; return [!isNil(ing) && len(ing) > 0]; };
    S.isItemRecyclable = (item) => { const c = icfg(item); return [!isNil(c) && c.recyclable === true]; };
    S.getItemDefaultMetadata = (item) => { const c = icfg(item); return [c ? or(c.defaultMetadata, undefined) : undefined]; };
    S.getItemDurability = (item) => { const c = icfg(item); return [c ? or(c.durability, undefined) : undefined]; };
    S.isItemDurabilityEnabled = (item) => { const d = S.getItemDurability(item)[0]; return [!isNil(d) && d.enabled === true]; };
    S.getItemDurabilityMinutes = (item) => { const d = S.getItemDurability(item)[0]; return [d ? or(d.minutes, undefined) : undefined]; };
    S.getItemDurabilityLife = (item) => { const d = S.getItemDurability(item)[0]; return [d ? or(d.life, undefined) : undefined]; };
    S.getItemWeaponConfig = (item) => { const c = icfg(item); return [c ? or(c.weapon, undefined) : undefined]; };
    S.isItemWeapon = (item) => { const w = S.getItemWeaponConfig(item)[0]; return [!isNil(w) && w.isWeapon === true]; };
    S.getItemWeaponModel = (item) => { const w = S.getItemWeaponConfig(item)[0]; return [w ? or(w.weaponModel, undefined) : undefined]; };
    S.getItemAmmoItem = (item) => { const w = S.getItemWeaponConfig(item)[0]; return [w ? or(w.ammoItem, undefined) : undefined]; };

    /* Jogadores e contas */
    S.getPlayers = () => [pairs(W.playersData).map(([key, data]) => ({
        source: Number(key),
        userId: data.userId,
        characterId: data.characterId,
        identifiers: W.playersIds[key] ? W.playersIds[key].identifiers : undefined
    }))];
    S.getUserIdByIdentifiers = (identifiers) => {
        const norm = (v) => (v !== 'not found' ? v : undefined);
        const q = {
            steamid: norm(index(identifiers, 'steam', "local 'identifiers'")),
            license: norm(identifiers.license),
            license2: norm(identifiers.license2),
            discordid: norm(identifiers.discord),
            fivem: norm(identifiers.fivemId)
        };
        sql(`SELECT * FROM users WHERE steamid = ${toLua(q.steamid)} OR license = ${toLua(q.license)} OR license2 = ${toLua(q.license2)} OR discordid = ${toLua(q.discordid)} OR fivem = ${toLua(q.fivem)} LIMIT 1`);
        const row = Object.values(W.users).find((u) => Object.keys(q).some((k) => !isNil(q[k]) && !isNil(u[k]) && u[k] === q[k]));
        return [row ? row.user_id : undefined];
    };
    S.getUserId = (source) => { const p = W.playersIds[keyOf(source)]; return [p && p.userId ? p.userId : undefined]; };
    S.getUserSource = (userId) => {
        const hit = pairs(W.playersIds).find(([, p]) => p.userId === userId);
        return [hit ? Number(hit[0]) : undefined];
    };
    S.activeCharacter = (source, characterId) => {
        const data = pd(keyOf(source));
        if (!data) return [false];
        data.characterId = characterId;
        if (stateOf(source).characterId !== characterId) setState(source, 'characterId', characterId, true);
        return [true];
    };
    S.getCharacterId = (source) => { const data = pd(keyOf(source)); return [data && data.characterId ? data.characterId : undefined]; };
    S.getUserIdByCharacterId = (characterId) => {
        if (truthy(characterId)) {
            const hit = pairs(W.playersData).find(([, data]) => data.characterId === characterId);
            if (hit) return S.getUserId(Number(hit[0]));
        }
        return [undefined];
    };
    function srcByChar(characterId) {
        if (truthy(characterId)) {
            const hit = pairs(W.playersData).find(([, data]) => tostr(data.characterId) === tostr(characterId));
            if (hit) return Number(hit[0]);
        }
        return undefined;
    }
    S.getUserSourceByCharacterId = (characterId) => [srcByChar(characterId)];
    S.getPlayerData = (userId) => {
        const src = S.getUserSource(userId)[0];
        if (isNil(src)) return [undefined];
        return [pd(keyOf(src))];
    };
    S.getPlayerIdentifiers = (userId) => {
        const src = S.getUserSource(userId)[0];
        if (isNil(src)) return [undefined];
        const p = W.playersIds[keyOf(src)];
        return [p ? p.identifiers : undefined];
    };
    S.getPlayerHdwids = (userId) => {
        const src = S.getUserSource(userId)[0];
        if (isNil(src)) return [undefined];
        const p = W.playersIds[keyOf(src)];
        return [p ? or(p.identifiers.hdwids, undefined) : undefined];
    };
    S.getWhitelistStatus = (userId) => {
        sql(`SELECT whitelist FROM users WHERE user_id = ${toLua(userId)}`);
        const row = W.users[userId];
        const v = row ? row.whitelist : undefined;
        return [v === 1 || v === true];
    };
    S.setWhitelistStatus = (userId, status) => {
        const value = truthy(status) ? 1 : 0;
        sql(`UPDATE users SET whitelist = ${value} WHERE user_id = ${toLua(userId)}`);
        if (W.users[userId]) W.users[userId].whitelist = value;
        return [];
    };
    S.getBanStatus = (userId) => {
        sql(`SELECT banned, ban_reason, ban_time FROM users WHERE user_id = ${toLua(userId)}`);
        const row = W.users[userId];
        if (!row) return [undefined];
        return [{ banned: row.banned === 1 || row.banned === true, reason: or(row.ban_reason, undefined), expiresAt: or(row.ban_time, undefined) }];
    };
    S.setBanStatus = (userId, status, reason, expiresAt) => {
        if (!truthy(userId)) return [];
        const row = W.users[userId];
        if (status === true) {
            sql(`UPDATE users SET banned = 1, ban_reason = ${toLua(reason)}, ban_time = ${toLua(expiresAt)} WHERE user_id = ${toLua(userId)}`);
            if (row) { row.banned = 1; row.ban_reason = isNil(reason) ? null : reason; row.ban_time = isNil(expiresAt) ? null : expiresAt; }
            const src = S.getUserSource(userId)[0];
            if (!isNil(src)) fx('warn', t('pg.fx.drop', { source: src, reason: tostr(reason) }));
        } else {
            sql(`UPDATE users SET banned = ${truthy(status) ? 1 : 0}, ban_reason = NULL, ban_time = NULL WHERE user_id = ${toLua(userId)}`);
            if (row) { row.banned = truthy(status) ? 1 : 0; row.ban_reason = null; row.ban_time = null; }
        }
        return [];
    };

    /* Posição e status */
    S.updatePositions = (characterId) => {
        if (truthy(characterId)) {
            const src = srcByChar(characterId);
            const data = pd(keyOf(src));
            if (data) {
                data.position = clone(W.peds[keyOf(src)].coords);
                return [true];
            }
        }
        return [false];
    };
    S.getPosition = (characterId) => {
        if (truthy(characterId)) {
            const data = pd(keyByChar(characterId));
            if (data) return [data.position];
        }
        return [undefined];
    };
    S.updateStatus = (characterId, syncAll, health, armor, hunger, thirst, stress) => {
        if (truthy(characterId)) {
            const src = srcByChar(characterId);
            const data = pd(keyOf(src));
            if (data) {
                const ped = W.peds[keyOf(src)];
                if (syncAll === true || truthy(health)) setState(src, 'health', ped.health);
                if (syncAll === true || truthy(armor)) setState(src, 'armor', ped.armor);
                const st = stateOf(src);
                data.status = {
                    health: or(health, st.health),
                    armor: or(armor, st.armor),
                    hunger: or(hunger, st.hunger),
                    thirst: or(thirst, st.thirst),
                    stress: or(stress, st.stress)
                };
                return [true];
            }
        }
        return [false];
    };
    S.getStatus = (characterId) => {
        if (truthy(characterId)) {
            const data = pd(keyByChar(characterId));
            if (data) {
                S.updateStatus(characterId, true);
                return [data.status];
            }
        }
        return [undefined];
    };

    /* Identidade e aparência */
    S.updateIdentities = (characterId, identity, data) => {
        if (truthy(characterId) && truthy(identity) && truthy(data)) {
            const p = pd(keyByChar(characterId));
            if (p && p.identity && truthy(p.identity[identity])) p.identity[identity] = data;
        }
        return [];
    };
    S.getCharacterIdentities = (characterId) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p) return [p.identity];
        }
        return [undefined];
    };
    function ensureEntry(characterId) {
        const key = keyByChar(characterId);
        if (!W.playersData[key]) {
            W.playersData[key] = {};
            fx('warn', t('pg.fx.stub', { key }));
        }
        return W.playersData[key];
    }
    const dig = (obj, ...path) => path.reduce((acc, k) => (acc && typeof acc === 'object' ? acc[k] : undefined), obj);
    S.getCharacterClothes = (characterId) => (truthy(characterId) ? [dig(pd(keyByChar(characterId)), 'clothes', 'clothesData', 'selections')] : [undefined]);
    S.setCharacterClothes = (characterId, clothes) => {
        if (!truthy(characterId)) return [false];
        const p = ensureEntry(characterId);
        p.clothes = p.clothes || {};
        p.clothes.clothesData = p.clothes.clothesData || {};
        p.clothes.clothesData.selections = clothes;
        return [true];
    };
    S.getCharacterFace = (characterId) => (truthy(characterId) ? [dig(pd(keyByChar(characterId)), 'clothes', 'faceData', 'selections')] : [undefined]);
    S.setCharacterFace = (characterId, face) => {
        if (!truthy(characterId)) return [false];
        const p = ensureEntry(characterId);
        p.clothes = p.clothes || {};
        p.clothes.faceData = face;
        return [true];
    };
    S.getCharacterOutfits = (characterId) => (truthy(characterId) ? [dig(pd(keyByChar(characterId)), 'clothes', 'clothesData', 'outfits')] : [undefined]);
    S.setCharacterOutfit = (characterId, outfitData) => {
        if (!truthy(characterId)) return [false];
        const p = ensureEntry(characterId);
        const outfits = dig(p, 'clothes', 'clothesData', 'outfits') || {};
        for (const [k, data] of pairs(outfits)) {
            if (data.name === index(outfitData, 'name', "local 'outfitData'")) {
                if (Array.isArray(outfits)) outfits[k - 1] = outfitData; else outfits[k] = outfitData;
                return [true];
            }
        }
        const name = index(outfitData, 'name', "local 'outfitData'");
        p.clothes = p.clothes || {};
        p.clothes.clothesData = p.clothes.clothesData || {};
        p.clothes.clothesData.outfits = p.clothes.clothesData.outfits || {};
        if (isNil(name)) throw new LuaError('table index is nil');
        p.clothes.clothesData.outfits[name] = outfitData;
        return [true];
    };

    /* Grupos */
    S.addCharacterGroup = (characterId, group, hierarchy) => {
        if (truthy(characterId) && truthy(group)) {
            const src = srcByChar(characterId);
            const p = pd(keyOf(src));
            if (p) {
                const userGroups = p.groups || {};
                const hierarchies = index(GROUPS[group], 'hierarchies', "field '?'");
                let level = len(hierarchies);
                if (typeof hierarchy === 'number') level = hierarchy;
                else if (typeof hierarchy === 'string') {
                    const found = hierarchies.indexOf(hierarchy);
                    if (found >= 0) level = found + 1;
                }
                userGroups[group] = level;
                p.groups = userGroups;
                setState(src, concat('group_', group), level, true);
                return [true];
            }
        }
        return [false];
    };
    S.removeCharacterGroup = (characterId, group) => {
        if (truthy(characterId)) {
            const src = srcByChar(characterId);
            const p = pd(keyOf(src));
            if (p) {
                const userGroups = p.groups || {};
                if (isNil(group)) throw new LuaError('table index is nil');
                delete userGroups[group];
                p.groups = userGroups;
                setState(src, concat('group_', group, "local 'group'"), undefined, true);
                return [true];
            }
        }
        return [false];
    };
    S.getCharacterGroups = (characterId) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p) return [p.groups];
        }
        return [undefined];
    };
    S.getCharacterGroupHierarchy = (characterId, group) => {
        if (truthy(characterId) && truthy(group)) {
            const p = pd(keyByChar(characterId));
            if (p) {
                const number = (p.groups || {})[group];
                const hierarchies = index(GROUPS[group], 'hierarchies', "field '?'");
                const name = isNil(number) ? undefined : index(hierarchies, number);
                return [number, name];
            }
        }
        return [undefined];
    };
    S.hasCharacterGroup = (characterId, group) => {
        if (truthy(characterId) && truthy(group)) {
            const p = pd(keyByChar(characterId));
            if (p) return [(p.groups || {})[group]];
        }
        return [false];
    };
    S.getUsersByGroup = (group) => [pairs(W.playersData)
        .filter(([, data]) => (data.groups || {})[group] !== undefined)
        .map(([key, data]) => ({ source: Number(key), userId: data.userId, characterId: data.characterId, hierarchyLevel: data.groups[group] }))];

    /* Inventário */
    const sameMeta = (a, b) => truthy(a) && truthy(b) && enc(a) === enc(b);
    function invSlot(inv, slot) { return typeof slot === 'number' ? inv[slot - 1] : undefined; }

    S.getCharacterInventory = (characterId) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p && p.inventory) return [p.inventory];
        }
        return [[]];
    };
    S.addItemToCharacterInventory = (characterId, item, quantity, slot, metadata) => {
        if (!(truthy(characterId) && truthy(item) && truthy(quantity) && gt0(quantity, "local 'quantity'"))) return [];
        const p = pd(keyByChar(characterId));
        if (!p) return [];
        const inv = p.inventory;
        if (truthy(slot)) {
            const entry = invSlot(inv, slot);
            if (entry && entry.name === item) {
                if (truthy(metadata) && sameMeta(entry.metadata, metadata)) { entry.amount = entry.amount + toNum(quantity); return [true]; }
                if (!truthy(metadata) && !truthy(entry.metadata)) { entry.amount = entry.amount + toNum(quantity); return [true]; }
            } else if (!entry) {
                if (typeof slot !== 'number') throw new LuaError(t('pg.err.slotType'));
                inv[slot - 1] = isNil(metadata) ? { name: item, amount: quantity } : { name: item, amount: quantity, metadata };
                return [true];
            }
        } else {
            for (const [, data] of pairs(inv)) {
                if (data.name === item) {
                    if (truthy(metadata) && sameMeta(data.metadata, metadata)) { data.amount = data.amount + toNum(quantity); return [true]; }
                    if (!truthy(metadata) && !truthy(data.metadata)) { data.amount = data.amount + toNum(quantity); return [true]; }
                }
            }
            inv.splice(len(inv), 0, isNil(metadata) ? { name: item, amount: quantity } : { name: item, amount: quantity, metadata });
            return [true];
        }
        return [false];
    };
    S.removeItemFromCharacterInventory = (characterId, item, quantity, slot, metadata) => {
        if (!(truthy(characterId) && truthy(item) && truthy(quantity) && gt0(quantity, "local 'quantity'"))) return [];
        const p = pd(keyByChar(characterId));
        if (!p) return [];
        const inv = p.inventory;
        const take = (entry, pos) => {
            entry.amount = entry.amount - toNum(quantity);
            if (entry.amount <= 0) tableRemove(inv, pos);
            return [true];
        };
        if (truthy(slot)) {
            const entry = invSlot(inv, slot);
            if (entry && entry.name === item) {
                if (truthy(metadata) && sameMeta(entry.metadata, metadata)) return take(entry, slot);
                if (!truthy(metadata) && !truthy(entry.metadata)) return take(entry, slot);
            }
        } else {
            for (const [pos, data] of pairs(inv)) {
                if (data.name === item) {
                    if (truthy(metadata) && sameMeta(data.metadata, metadata)) return take(data, pos);
                    if (!truthy(metadata) && !truthy(data.metadata)) return take(data, pos);
                }
            }
        }
        return [];
    };
    S.getItemFromCharacterInventory = (characterId, item, slot, metadata) => {
        if (truthy(characterId) && truthy(item)) {
            const p = pd(keyByChar(characterId));
            if (p) {
                const candidates = truthy(slot) ? [invSlot(p.inventory, slot)] : pairs(p.inventory).map(([, v]) => v);
                for (const data of candidates) {
                    if (data && data.name === item) {
                        if (truthy(metadata) && sameMeta(data.metadata, metadata)) return [data];
                        if (!truthy(metadata) && !truthy(data.metadata)) return [data];
                    }
                }
            }
        }
        return [undefined];
    };
    S.getCharacterInventorySlots = (characterId) => {
        const slots = { amount: 0, inUse: 0, available: 0 };
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p && p.inventory) {
                slots.amount = len(p.inventory);
                pairs(p.inventory).forEach(([, d]) => { if (d.amount > 0) slots.inUse += 1; });
                slots.available = slots.amount - slots.inUse;
            }
        }
        return [slots];
    };
    S.getCharacterInventoryWeight = (characterId) => {
        const weight = { total: 0, used: 0, available: 0 };
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p) {
                pairs(p.inventory || []).forEach(([, d]) => {
                    const w = S.getItemWeight(d.name)[0];
                    if (truthy(w)) weight.used += w * d.amount;
                });
                throw new LuaError('No such export getInventoryDefaultWeight in resource Str');
            }
        }
        return [weight];
    };

    /* Economia */
    S.getCharacterEconomyData = (characterId) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p && p.economy) return [p.economy];
        }
        return [undefined];
    };
    S.setCharacterEconomyData = (characterId, economyData) => {
        if (truthy(characterId) && truthy(economyData)) {
            const p = pd(keyByChar(characterId));
            if (p) { p.economy = economyData; return [true]; }
        }
        return [false];
    };
    S.addCharacterMoney = (characterId, amount, moneyType, criptoName) => {
        if (truthy(characterId) && truthy(amount) && truthy(moneyType)) {
            const economy = S.getCharacterEconomyData(characterId)[0] || {};
            const src = srcByChar(characterId);
            if (moneyType === 'crypto' && truthy(criptoName)) {
                economy.crypto = economy.crypto || {};
                economy.crypto[criptoName] = toNum(or(economy.crypto[criptoName], 0)) + toNum(amount, "local 'amount'");
                if (!isNil(src)) setState(src, 'crypto', economy.crypto, true);
            } else {
                const current = or(economy[moneyType], 0);
                if (typeof current === 'object') throw new LuaError("attempt to perform arithmetic on a table value (field '?')");
                economy[moneyType] = toNum(current) + toNum(amount, "local 'amount'");
                if (!isNil(src)) setState(src, moneyType, economy[moneyType], true);
            }
            S.setCharacterEconomyData(characterId, economy);
            return [true];
        }
        return [false];
    };
    S.removeCharacterMoney = (characterId, amount, moneyType, criptoName) => S.addCharacterMoney(characterId, -toNum(amount, "local 'amount'"), moneyType, criptoName);
    S.getCharacterMoneyAmount = (characterId, moneyType, criptoName) => {
        if (truthy(characterId) && truthy(moneyType)) {
            const economy = S.getCharacterEconomyData(characterId)[0] || {};
            if (moneyType === 'crypto' && truthy(criptoName)) {
                economy.crypto = economy.crypto || {};
                return [or(economy.crypto[criptoName], 0)];
            }
            return [or(economy[moneyType], 0)];
        }
        return [0];
    };

    /* Veículos do personagem */
    S.getCharacterVehiclesData = (characterId) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p) return [p.vehicles || {}];
        }
        return [{}];
    };
    S.setCharacterVehiclesData = (characterId, vehicleData) => {
        if (truthy(characterId)) {
            const p = pd(keyByChar(characterId));
            if (p) p.vehicles = or(vehicleData, {});
        }
        return [];
    };
    S.setCharacterVehicleData = (characterId, vehicleId, vehicleData) => {
        if (!truthy(characterId) || !truthy(vehicleId) || !vehicleData || typeof vehicleData !== 'object') return [false];
        const vehicles = S.getCharacterVehiclesData(characterId)[0];
        const vehicle = vehicles[vehicleId] || vehicles[String(vehicleId)];
        if (!vehicle) return [false];
        Object.assign(vehicle, clone(vehicleData));
        S.setCharacterVehiclesData(characterId, vehicles);
        return [true];
    };
    S.addCharacterVehicle = (characterId, vehicleModel, data) => {
        if (!truthy(characterId) || !truthy(vehicleModel) || !VEHICLES[vehicleModel]) return [false];
        const vehicles = S.getCharacterVehiclesData(characterId)[0];
        const numericIds = Object.keys(vehicles).map(Number).filter((id) => Number.isInteger(id) && id > 0);
        const vehicleId = Math.max(0, ...numericIds) + 1;
        const record = Object.assign({
            model: vehicleModel,
            lastGarage: null,
            lastLocation: {},
            state: 0,
            locked: 1,
            tunings: {},
            fuelLevel: 10,
            taxesDueAt: null,
            odometer: 0,
            damages: {},
            rentalExpiresAt: null,
            inventory: {},
            arrested: false,
            dismantled: false
        }, clone(data || {}), { model: vehicleModel });
        vehicles[vehicleId] = record;
        S.setCharacterVehiclesData(characterId, vehicles);
        return [true, vehicleId];
    };
    S.removeCharacterVehicle = (characterId, vehicleIdOrModel) => {
        if (!truthy(characterId) || !truthy(vehicleIdOrModel)) return [false];
        const vehicles = S.getCharacterVehiclesData(characterId)[0];
        let vehicleId = Number(vehicleIdOrModel);
        if (!Number.isInteger(vehicleId) || vehicleId < 1) {
            vehicleId = Object.keys(vehicles).find((id) => vehicles[id] && vehicles[id].model === vehicleIdOrModel);
        }
        if (!vehicleId || !vehicles[vehicleId]) return [false];
        delete vehicles[vehicleId];
        delete vehicles[String(vehicleId)];
        S.setCharacterVehiclesData(characterId, vehicles);
        return [true];
    };
    S.getCharacterVehicles = (characterId) => (truthy(characterId) ? S.getCharacterVehiclesData(characterId) : [{}]);
    S.getCharacterVehicle = (characterId, vehicleIdOrModel) => {
        if (!truthy(characterId) || !truthy(vehicleIdOrModel)) return [undefined];
        const vehicles = S.getCharacterVehiclesData(characterId)[0];
        const numericId = Number(vehicleIdOrModel);
        const vehicle = Number.isInteger(numericId) && numericId > 0
            ? vehicles[numericId] || vehicles[String(numericId)]
            : Object.values(vehicles).find((entry) => entry && entry.model === vehicleIdOrModel);
        return [vehicle];
    };
    S.getVehicleTunings = (characterId, vehicleId) => {
        const vehicle = S.getCharacterVehicle(characterId, vehicleId)[0];
        return [vehicle && vehicle.tunings || {}];
    };
    S.setVehicleTunings = (characterId, vehicleId, tunings) => {
        if (!tunings || typeof tunings !== 'object') return [false];
        return S.setCharacterVehicleData(characterId, vehicleId, { tunings });
    };
    S.getVehicleLockedStatus = (characterId, vehicleId) => {
        const vehicle = S.getCharacterVehicle(characterId, vehicleId)[0];
        return [vehicle ? vehicle.locked === true || Number(vehicle.locked) === 1 : undefined];
    };
    S.setVehicleLockedStatus = (characterId, vehicleId, locked) => {
        if (typeof locked !== 'boolean') return [false];
        return S.setCharacterVehicleData(characterId, vehicleId, { locked });
    };
    S.getVehicleInventory = (characterId, vehicleId) => {
        const vehicle = S.getCharacterVehicle(characterId, vehicleId)[0];
        return [vehicle && vehicle.inventory || {}];
    };
    S.updateVehicleInventory = (characterId, vehicleId, inventory) => {
        if (!inventory || typeof inventory !== 'object') return [false];
        return S.setCharacterVehicleData(characterId, vehicleId, { inventory });
    };

    /* Adicionadas por módulos */
    S.getStyleInventoryClothingItems = (framework) => {
        const configured = STYLE_ITEMS[framework] || {};
        const out = {};
        pairs(configured).forEach(([k, item]) => { out[k] = { itemId: item.itemId, label: item.label, icon: tostr(or(item.icon, 'fa-shirt')) }; });
        return [out];
    };
    S.applyStyleClothingPurchase = (playerSource, changes) => {
        const data = pd(keyOf(playerSource));
        if (!data || !data.characterId || isNil(changes) || typeof changes !== 'object') {
            return [false, 'Não foi possível identificar o personagem para guardar as roupas.'];
        }
        const items = STYLE_ITEMS.fivem;
        for (const [category, change] of pairs(changes)) {
            if (!items[category] || isNil(change) || typeof change !== 'object') {
                return [false, 'A roupa selecionada não está configurada no inventário.'];
            }
        }
        sql(`UPDATE inventories SET inventory_data = … WHERE inventory_id = ${data.characterId}`);
        fx('event', `TriggerClientEvent("Str:style:applyInventoryClothing", ${tostr(playerSource)}, ${toLua(changes)})`);
        return [true];
    };

    /* Client: roda como o jogador source 1 */
    const CLIENT_SOURCE = 1;
    C.getTunnelFunction = (async, functionName, ...args) => {
        if (!truthy(async)) {
            fx('event', `TriggerServerEvent("Str:duplicityServerVersion", "Str:tempEvent:N…", ${toLua(functionName)})`);
            return callServerHandler(functionName, args);
        }
        fx('event', `TriggerServerEvent("Str:duplicityServerVersion", nil, ${toLua(functionName)})`);
        const handler = W.serverTunnel[functionName] || CORE_SERVER_TUNNEL[functionName];
        if (handler) handler(...args);
        return [];
    };
    C.syncTunnelFunction = (...args) => C.getTunnelFunction(false, ...args);
    C.asyncTunnelFunction = (...args) => { C.getTunnelFunction(true, ...args); return []; };
    C.registerTunnelFunction = (funcName, func) => {
        W.clientTunnel[funcName] = func;
        fx('info', t('pg.fx.registered', { name: tostr(funcName), side: 'client' }));
        return [];
    };

    /* =================================================================
       Argumentos: valores padrão e atalhos por parâmetro
       ================================================================= */
    const itemChips = ["'backpackS'", "'glockPistol'", "'9mmAmmo'", "'cloth'", "'itemInexistente'"];
    const PARAM_DEFAULTS = {
        source: { def: '1', chips: ['1', '2', '5'] },
        playerSource: { def: '1', chips: ['1', '2', '5'] },
        userId: { def: '7', chips: ['7', '8', '9', '99'] },
        characterId: { def: '42', chips: ['42', '51', "'42'", '99'] },
        item: { def: "'backpackS'", chips: itemChips },
        quantity: { def: '1', chips: ['1', '5', '30', '-1'] },
        slot: { def: '', chips: ['1', '3', '10'] },
        metadata: { def: '', chips: ["{ serial = 'GLK-0042', durability = 300 }", "{ serial = 'GLK-9999' }"] },
        amount: { def: '25', chips: ['25', '1000', '-50', "'10'"] },
        moneyType: { def: "'cash'", chips: ["'cash'", "'bankMoney'", "'coins'", "'crypto'"] },
        criptoName: { def: '', chips: ["'BTC'", "'ETH'"] },
        group: { def: "'Staff'", chips: ["'Staff'", "'Police'", "'Mechanic'", "'Tailor'", "'GrupoInexistente'"] },
        hierarchy: { def: '', chips: ['1', '2', "'Moderator'", "'Officer'"] },
        onlineOnly: { def: '', chips: ['true', 'false'] },
        vehicleModelOrHash: { def: "'adder'", chips: ["'adder'", "'fq2'", "'panto'", String(ADDER_HASH), "'blista'"] },
        vehicleModel: { def: "'adder'", chips: ["'adder'", "'fq2'", "'panto'", "'blista'"] },
        vehicleHash: { def: String(ADDER_HASH), chips: [String(ADDER_HASH), String(joaat('fq2')), String(joaat('panto')), '123'] },
        vehicleId: { def: '17', chips: ['17', '18', '999'] },
        vehicleIdOrModel: { def: '17', chips: ['17', '18', "'fq2'", '999'] },
        vehicleData: { def: '{}', chips: ['{}', '{ fuelLevel = 50 }'] },
        tunings: { def: '{ mods = {} }', chips: ['{ mods = {} }', '{ mods = { engine = 2 } }'] },
        inventory: { def: '{}', chips: ['{}', '{ trunk = { items = {} } }'] },
        identifiers: { def: "{ license = '2f6c1d4e9a7b3c5d8e0f' }", chips: ["{ license = '2f6c1d4e9a7b3c5d8e0f' }", "{ discord = '391234567890123456' }", "{ steam = 'not found' }"] },
        status: { def: 'true', chips: ['true', 'false'] },
        reason: { def: "'Uso de cheat'", chips: ["'Uso de cheat'", "'Toxicidade'"] },
        expiresAt: { def: '', chips: ['{ year = 2026, month = 12, day = 31, hour = 23 }'] },
        identity: { def: "'lastName'", chips: ["'name'", "'lastName'", "'age'", "'nickname'"] },
        clothes: { def: '{ comp_11 = { drawable = 15, texture = 0 } }', chips: ['{ comp_11 = { drawable = 15, texture = 0 } }'] },
        face: { def: '{ selections = { nose = 5 } }', chips: ['{ selections = { nose = 5 } }', '{ nose = 5 }'] },
        outfitData: { def: "{ name = 'Festa', selections = { comp_11 = { drawable = 31, texture = 1 } } }", chips: ["{ name = 'Festa', selections = {} }", "{ name = 'Trabalho', selections = {} }"] },
        economyData: { def: '{ cash = 500, bankMoney = 0, coins = 0, crypto = {} }', chips: ['{ cash = 500, bankMoney = 0, coins = 0, crypto = {} }'] },
        syncAll: { def: 'true', chips: ['true', 'false', 'nil'] },
        health: { def: '', chips: ['150', '200'] },
        armor: { def: '', chips: ['0', '100'] },
        hunger: { def: '', chips: ['50', '100'] },
        thirst: { def: '', chips: ['50', '100'] },
        stress: { def: '', chips: ['0', '40'] },
        async: { def: 'false', chips: ['false', 'true'] },
        functionName: { def: "'getItemsConfig'", chips: ["'getConfig'", "'getGroupsConfig'", "'getVehiclesConfig'", "'getItemsConfig'"] },
        funcName: { def: "'ping'", chips: ["'ping'", "'getHello'"] },
        func: { def: "function() return 'pong' end", chips: ["function() return 'pong' end", 'function() return 1, 2, 3 end'] },
        '...args': { def: '', chips: ["'a', 2", '{ x = 1 }'] },
        framework: { def: "'fivem'", chips: ["'fivem'", "'redm'", "'sixm'"] },
        changes: { def: '{ comp_11 = { selected = { drawable = 15, texture = 0 } } }', chips: ['{ comp_11 = { selected = { drawable = 15, texture = 0 } } }', '{ comp_99 = { selected = {} } }'] },
        data: { def: '', chips: ['{ fuelLevel = 30 }'] }
    };
    const FN_OVERRIDES = {
        updateIdentities: { data: { def: "'Souza'", chips: ["'Souza'", '30', "'Apelido'"] } },
        getCharacterGroupHierarchy: { group: { def: "'Staff'" } },
        addCharacterGroup: { group: { def: "'Police'" }, hierarchy: { def: '2' } },
        removeCharacterGroup: { group: { def: "'Mechanic'" } },
        getUsersByGroup: { group: { def: "'Staff'" } },
        removeItemFromCharacterInventory: { item: { def: "'9mmAmmo'" }, quantity: { def: '5' } },
        getItemFromCharacterInventory: { item: { def: "'glockPistol'" }, metadata: { def: "{ serial = 'GLK-0042', durability = 300 }" } },
        addCharacterVehicle: { vehicleModel: { def: "'panto'" } },
        removeCharacterVehicle: { vehicleIdOrModel: { def: '17' } },
        getCharacterVehicle: { vehicleIdOrModel: { def: '17' } },
        getVehicleLockedStatus: { vehicleId: { def: '17' } },
        setVehicleLockedStatus: { vehicleId: { def: '17' } },
        getVehicleInventory: { vehicleId: { def: '17' } },
        updateVehicleInventory: { vehicleId: { def: '17' } },
        getUserIdByCharacterId: { characterId: { def: '42' } },
        setBanStatus: { userId: { def: '8' } },
        getBanStatus: { userId: { def: '9' } },
        getPlayerData: { userId: { def: '7' } },
        getItemFabricationItems: { item: { def: "'glockPistol'" } },
        getItemWeaponConfig: { item: { def: "'glockPistol'" } },
        isItemWeapon: { item: { def: "'glockPistol'" } },
        getItemWeaponModel: { item: { def: "'glockPistol'" } },
        getItemAmmoItem: { item: { def: "'glockPistol'" } },
        removeCharacterMoney: { amount: { def: '500' } },
        'server:syncTunnelFunction': { functionName: { def: "'ping'", chips: ["'ping'", "'abrirMenu'"] } },
        'server:asyncTunnelFunction': { functionName: { def: "'ping'", chips: ["'ping'"] } },
        'server:getTunnelFunction': { functionName: { def: "'ping'", chips: ["'ping'"] } }
    };
    const MULTI_RETURNS = {
        getCharacterGroupHierarchy: ['level', 'name'],
        applyStyleClothingPurchase: ['ok', 'message'],
        addCharacterVehicle: ['ok', 'vehicleId']
    };

    /* "characterId: number, slot?: number, ...args" → lista de parâmetros. */
    function parseSignature(sig) {
        if (!sig || sig === '—') return [];
        return sig.split(/,(?![^{(]*[})])/).map((part) => {
            const [rawName, ...typeParts] = part.split(':');
            const name = rawName.trim();
            const optional = name.endsWith('?') || name.startsWith('...');
            const clean = name.replace(/\?$/, '');
            const type = typeParts.join(':').trim();
            return { n: clean, type, optional, varargs: clean.startsWith('...'), isFunction: type === 'function' };
        });
    }

    function buildCatalog() {
        const list = [];
        const add = (sections, side) => sections.forEach((section, si) => {
            section.functions.forEach(([name, sig]) => {
                const impl = side === 'server' ? S[name] : C[name];
                if (!impl) return;
                list.push({ id: `${side}:${name}`, name, side, group: section.title, groupIndex: `${side}-${si}`, sig, params: parseSignature(sig), impl });
            });
        });
        add(serverSections, 'server');
        add(clientSections, 'client');
        return list;
    }

    const CATALOG = buildCatalog();

    function paramDefaults(fn, param) {
        const base = PARAM_DEFAULTS[param.n] || { def: '', chips: [] };
        const over = (FN_OVERRIDES[fn.id] || FN_OVERRIDES[fn.name] || {})[param.n] || {};
        return { def: over.def ?? base.def, chips: over.chips || base.chips || [] };
    }

    /* =================================================================
       Interface
       ================================================================= */
    const el = {
        segmented: root.querySelector('.segmented'),
        modeButtons: Array.from(root.querySelectorAll('[data-pg-mode]')),
        fnPane: root.querySelector('#pg-fn-pane'),
        bagPane: root.querySelector('#pg-bag-pane'),
        fnSelect: root.querySelector('#pg-fn-select'),
        fnArgs: root.querySelector('#pg-fn-args'),
        fnSide: root.querySelector('#pg-fn-side'),
        fnDoc: root.querySelector('#pg-fn-doc'),
        bagHolder: root.querySelector('#pg-bag-holder'),
        bagKey: root.querySelector('#pg-bag-key'),
        bagKeys: root.querySelector('#pg-bag-keys'),
        bagAction: root.querySelector('#pg-bag-action'),
        bagValueWrap: root.querySelector('#pg-bag-value-wrap'),
        bagValue: root.querySelector('#pg-bag-value'),
        bagChips: root.querySelector('#pg-bag-chips'),
        code: root.querySelector('#pg-code'),
        out: root.querySelector('#pg-output'),
        run: root.querySelector('#pg-run'),
        reset: root.querySelector('#pg-reset'),
        clear: root.querySelector('#pg-clear'),
        keep: root.querySelector('#pg-keep'),
        terminal: root.querySelector('.pg-terminal')
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mode = 'fn';
    let running = false;
    let runToken = 0;

    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    const currentFn = () => CATALOG.find((f) => f.id === el.fnSelect.value) || CATALOG[0];

    function renderFnSelect() {
        const selected = el.fnSelect.value || 'server:addCharacterMoney';
        const groups = [];
        CATALOG.forEach((fn) => {
            let g = groups.find((x) => x.key === fn.groupIndex);
            if (!g) { g = { key: fn.groupIndex, title: fn.group, side: fn.side, fns: [] }; groups.push(g); }
            g.fns.push(fn);
        });
        el.fnSelect.innerHTML = groups.map((g) => `<optgroup label="${esc(`${g.side === 'client' ? 'CLIENT · ' : ''}${pick(g.title)}`)}">${
            g.fns.map((f) => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('')
        }</optgroup>`).join('');
        el.fnSelect.value = selected;
        if (!el.fnSelect.value) el.fnSelect.value = 'server:addCharacterMoney';
    }

    function returnDoc(fn) {
        const sections = fn.side === 'server' ? serverSections : clientSections;
        for (const section of sections) {
            const hit = section.functions.find(([name]) => name === fn.name);
            if (hit) return pick(hit[2]);
        }
        return '';
    }

    function renderFnArgs(keepValues) {
        const fn = currentFn();
        const previous = {};
        if (keepValues) {
            root.querySelectorAll('[data-arg]').forEach((input) => { previous[input.dataset.arg] = input.value; });
        }
        el.fnSide.textContent = fn.side.toUpperCase();
        el.fnSide.className = `pill pill-${fn.side}`;
        el.fnDoc.textContent = returnDoc(fn);
        if (!fn.params.length) {
            el.fnArgs.innerHTML = `<p class="pg-hint pg-noargs">${esc(t('pg.noArgs'))}</p>`;
            updateCode();
            return;
        }
        el.fnArgs.innerHTML = fn.params.map((p, i) => {
            const d = paramDefaults(fn, p);
            const value = previous[p.n] !== undefined ? previous[p.n] : d.def;
            const big = /table|function/.test(p.type) && !/string|number/.test(p.type);
            const input = big
                ? `<textarea class="pg-input pg-lua" id="pg-arg-${i}" data-arg="${esc(p.n)}" rows="2" spellcheck="false" placeholder="nil">${esc(value)}</textarea>`
                : `<input class="pg-input pg-lua" id="pg-arg-${i}" data-arg="${esc(p.n)}" type="text" value="${esc(value)}" placeholder="nil" spellcheck="false" autocomplete="off">`;
            const chips = d.chips.length ? `<div class="pg-chips">${d.chips.map((c) => `<button type="button" class="pg-chip" data-chip-for="pg-arg-${i}" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : '';
            return `<div class="pg-field pg-field-in" style="--i:${i}">
                <label class="pg-label" for="pg-arg-${i}">${esc(p.n)}<span class="pg-type">${esc(p.type)}</span>${p.optional ? `<em>${esc(t('pg.optional'))}</em>` : ''}</label>
                ${input}${chips}
            </div>`;
        }).join('');
        updateCode();
    }

    function readRawArgs(fn) {
        return fn.params.map((p, i) => {
            const input = root.querySelector(`#pg-arg-${i}`);
            return input ? input.value.trim() : '';
        });
    }

    /* Converte os textos Lua em valores; varargs pode virar vários valores. */
    function readArgs(fn) {
        const raws = readRawArgs(fn);
        const values = [];
        fn.params.forEach((p, i) => {
            const raw = raws[i];
            try {
                if (p.varargs) values.push(...parseLuaList(raw));
                else if (p.isFunction) values.push(raw === '' ? undefined : parseLuaFunction(raw));
                else values.push(raw === '' ? undefined : parseLuaValue(raw));
            } catch (err) {
                if (err instanceof ParseError) throw new ParseError(t('pg.parse.inParam', { param: p.n, msg: err.message }));
                throw err;
            }
        });
        return values;
    }

    function callSource(fn) {
        const raws = readRawArgs(fn);
        while (raws.length && raws[raws.length - 1] === '') raws.pop();
        const args = raws.map((r) => (r === '' ? 'nil' : r.replace(/\s*\n\s*/g, ' '))).join(', ');
        const lhs = (MULTI_RETURNS[fn.name] || ['result']).join(', ');
        return `local ${lhs} = Str.functions.${fn.name}(${args})`;
    }

    /* ---------- Statebags ---------- */
    function holderLabel(holder) {
        return holder === 'global' ? 'GlobalState' : `Player(${holder}).state`;
    }

    function holderStore(holder) {
        if (holder === 'global') return W.global;
        if (!W.states[holder]) W.states[holder] = {};
        return W.states[holder];
    }

    function renderBagHolders() {
        const selected = el.bagHolder.value || '1';
        el.bagHolder.innerHTML = ['1', '2', 'global'].map((h) => `<option value="${h}">${esc(holderLabel(h))}</option>`).join('');
        el.bagHolder.value = selected;
    }

    function renderBagKeys() {
        const known = el.bagHolder.value === 'global'
            ? Object.keys(W.global).concat(['strMobilitiesVehicleEntities'])
            : Object.keys(holderStore(el.bagHolder.value)).concat(['isTargeting', 'targetActive', 'Str:pendingCharacter', 'crypto']);
        el.bagKeys.innerHTML = [...new Set(known)].map((k) => `<option value="${esc(k)}"></option>`).join('');
        el.bagChips.innerHTML = [...new Set(known)].slice(0, 12).map((k) => `<button type="button" class="pg-chip" data-chip-for="pg-bag-key" data-chip="${esc(k)}">${esc(k)}</button>`).join('');
    }

    function bagPath() {
        const key = el.bagKey.value.trim() || 'cash';
        const holder = holderLabel(el.bagHolder.value);
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${holder}.${key}` : `${holder}[${JSON.stringify(key)}]`;
    }

    function bagSource() {
        const key = el.bagKey.value.trim() || 'cash';
        if (el.bagAction.value === 'set') {
            const raw = el.bagValue.value.trim() || 'nil';
            if (el.bagHolder.value === 'global') return `GlobalState[${JSON.stringify(key)}] = ${raw}`;
            return `Player(${el.bagHolder.value}).state:set(${JSON.stringify(key)}, ${raw}, true)`;
        }
        return `local value = ${bagPath()}`;
    }

    function updateBagControls() {
        el.bagValueWrap.hidden = el.bagAction.value !== 'set';
        updateCode();
    }

    function updateCode() {
        el.code.textContent = mode === 'fn' ? callSource(currentFn()) : bagSource();
    }

    /* ---------- Saída ---------- */
    function line(kind, icon, html) {
        const node = document.createElement('div');
        node.className = `pg-line pg-${kind}`;
        node.innerHTML = `<span class="pg-arrow">${icon}</span><span class="pg-body">${html}</span>`;
        el.out.appendChild(node);
        return node;
    }

    const wait = (ms) => new Promise((r) => window.setTimeout(r, reduceMotion ? 0 : ms));

    async function typeInto(node, text, token) {
        if (reduceMotion || text.length > 400) { node.textContent = text; return; }
        const step = Math.max(1, Math.ceil(text.length / 36));
        for (let i = 0; i <= text.length; i += step) {
            if (token !== runToken) return;
            node.textContent = text.slice(0, i);
            await wait(12);
        }
        node.textContent = text;
    }

    const FX_ICON = { state: '◆', sql: '⛁', event: '⇄', warn: '⚠', info: 'i' };

    async function present(cmd, result, token) {
        line('cmd', '&gt;', esc(cmd));
        line('meta', '●', esc(el.keep.checked ? t('pg.keptRun') : t('pg.freshRun'))).classList.add('pg-dim');
        const spinner = line('run', '<span class="pg-spinner"></span>', esc(t('pg.running')));
        await wait(280);
        if (token !== runToken) return;
        spinner.remove();
        for (const item of result.fx) {
            if (token !== runToken) return;
            line(`fx-${item.kind}`, FX_ICON[item.kind] || '↳', esc(item.text));
            await wait(60);
        }
        if (result.error) {
            line('err', '✕', `<pre>${esc(result.error)}</pre>`);
            return;
        }
        const ret = line('ret', '⇒', '<pre></pre>');
        await typeInto(ret.querySelector('pre'), result.text, token);
        if (result.note) line('meta', '·', esc(result.note)).classList.add('pg-dim');
    }

    function execute() {
        W.fx = [];
        if (mode === 'fn') {
            const fn = currentFn();
            const cmd = callSource(fn);
            try {
                const args = readArgs(fn);
                const values = fn.impl(...args) || [];
                const names = MULTI_RETURNS[fn.name];
                let text;
                let note = '';
                if (!values.length) {
                    text = 'nil';
                    note = t('pg.noReturn');
                } else if (names && values.length > 1) {
                    text = values.map((v, i) => `${names[i] || `#${i + 1}`} = ${toLua(v)}`).join('\n');
                } else {
                    text = values.map((v) => toLua(v)).join(', ');
                }
                return { cmd, text, note, fx: W.fx };
            } catch (err) {
                if (err instanceof ParseError) return { cmd, error: err.message, fx: [] };
                if (err instanceof LuaError) return { cmd, error: `SCRIPT ERROR: @Str/Str.lua: ${err.message}`, fx: W.fx };
                return { cmd, error: String(err && err.message ? err.message : err), fx: W.fx };
            }
        }
        const cmd = bagSource();
        const key = el.bagKey.value.trim() || 'cash';
        const store = holderStore(el.bagHolder.value);
        try {
            if (el.bagAction.value === 'set') {
                const value = el.bagValue.value.trim() === '' ? undefined : parseLuaValue(el.bagValue.value.trim());
                if (el.bagHolder.value === 'global') {
                    if (isNil(value)) delete store[key]; else store[key] = clone(value);
                    fx('state', `GlobalState[${JSON.stringify(key)}] = ${toLua(value)}`);
                } else {
                    setState(el.bagHolder.value, key, value, true);
                }
                return { cmd, text: `${key} = ${toLua(store[key])}`, note: t('pg.bagSetNote'), fx: W.fx };
            }
            return { cmd, text: toLua(store[key]), note: store[key] === undefined ? t('pg.bagMissing') : '', fx: W.fx };
        } catch (err) {
            if (err instanceof ParseError) return { cmd, error: t('pg.parse.inParam', { param: 'value', msg: err.message }), fx: [] };
            throw err;
        }
    }

    async function run() {
        const token = ++runToken;
        running = true;
        el.run.classList.add('is-running');
        el.terminal.classList.remove('flash');
        void el.terminal.offsetWidth;
        el.terminal.classList.add('flash');

        el.out.innerHTML = '';
        if (!el.keep.checked) W = freshWorld();
        const result = execute();
        if (mode === 'bag') renderBagKeys();

        await present(result.cmd, result, token);
        if (token === runToken) {
            running = false;
            el.run.classList.remove('is-running');
        }
    }

    function setMode(next) {
        mode = next;
        el.segmented.dataset.active = mode;
        el.modeButtons.forEach((b) => {
            const on = b.dataset.pgMode === mode;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', String(on));
        });
        el.fnPane.hidden = mode !== 'fn';
        el.bagPane.hidden = mode !== 'bag';
        const pane = mode === 'fn' ? el.fnPane : el.bagPane;
        pane.classList.remove('pane-in');
        void pane.offsetWidth;
        pane.classList.add('pane-in');
        if (mode === 'bag') { renderBagKeys(); updateBagControls(); } else updateCode();
    }

    function ready() {
        el.out.innerHTML = '';
        line('fx-info', 'i', esc(t('pg.ready')));
    }

    /* ---------- Eventos ---------- */
    el.modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.pgMode)));
    el.fnSelect.addEventListener('change', () => renderFnArgs(false));
    el.fnArgs.addEventListener('input', updateCode);
    root.addEventListener('click', (e) => {
        const chip = e.target.closest('.pg-chip');
        if (!chip) return;
        const target = root.querySelector(`#${chip.dataset.chipFor}`);
        if (!target) return;
        target.value = chip.dataset.chip;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.focus();
    });
    el.bagHolder.addEventListener('change', () => { renderBagKeys(); updateCode(); });
    el.bagKey.addEventListener('input', updateCode);
    el.bagAction.addEventListener('change', updateBagControls);
    el.bagValue.addEventListener('input', updateCode);
    el.run.addEventListener('click', run);
    el.clear.addEventListener('click', () => { runToken += 1; el.out.innerHTML = ''; el.run.classList.remove('is-running'); running = false; });
    el.reset.addEventListener('click', () => {
        runToken += 1;
        running = false;
        el.run.classList.remove('is-running');
        W = freshWorld();
        el.out.innerHTML = '';
        line('fx-info', '↺', esc(t('pg.restored')));
        el.reset.classList.remove('spin');
        void el.reset.offsetWidth;
        el.reset.classList.add('spin');
        if (mode === 'bag') renderBagKeys();
    });
    root.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    });

    window.StrI18n.onChange(() => {
        renderFnSelect();
        renderFnArgs(true);
        renderBagHolders();
        if (!running) ready();
    });

    renderFnSelect();
    renderFnArgs(false);
    renderBagHolders();
    el.bagKey.value = 'cash';
    renderBagKeys();
    setMode('fn');
    ready();
})();
