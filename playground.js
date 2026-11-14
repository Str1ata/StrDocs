'use strict';

/* Playground: executa exemplos contra um mundo SIMULADO (nada aqui roda Lua de verdade).
   Cada execução limpa a saída e, por padrão, restaura o mundo antes de rodar. */
(function () {
    const root = document.getElementById('playground');
    if (!root) return;

    const t = (key, vars) => window.StrI18n.t(key, vars);
    const pick = (pair) => window.StrI18n.pick(pair);

    const GROUPS = {
        Staff: { 1: 'Helper', 2: 'Mod', 3: 'Admin', 4: 'Dono' },
        Police: { 1: 'Cadete', 2: 'Oficial', 3: 'Comandante' }
    };

    /* label em [pt, en]; resolvido no idioma atual quando a função retorna. */
    const ITEMS = {
        backpackS: { label: ['Backpack pequena', 'Small backpack'], weight: 0.5, type: 'backpack', capacity: 10 },
        water: { label: ['Água', 'Water'], weight: 0.3, type: 'consumable' },
        bread: { label: ['Pão', 'Bread'], weight: 0.2, type: 'consumable' },
        pistol: { label: ['Pistola', 'Pistol'], weight: 1.5, type: 'weapon', weapon: { isWeapon: true, weaponModel: 'WEAPON_PISTOL' } },
        phone: { label: ['Celular', 'Phone'], weight: 0.4, type: 'tool' }
    };

    const VEHICLES = {
        sultan: { name: 'Sultan', fuel: 65 },
        adder: { name: 'Adder', fuel: 80 },
        faggio: { name: 'Faggio', fuel: 8 }
    };

    const INVENTORY_SLOTS = 30;

    function itemConfig(name) {
        const item = ITEMS[name];
        if (!item) return null;
        return { ...item, label: pick(item.label) };
    }

    function allItems() {
        const out = {};
        Object.keys(ITEMS).forEach((k) => { out[k] = itemConfig(k); });
        return out;
    }

    function freshWorld() {
        return {
            source: 1,
            userId: 7,
            characterId: 42,
            identity: { name: 'João', lastName: 'Silva', document: 'RG', documentNumber: '123456789', age: 27, gender: 'M' },
            economy: { cash: 125, bankMoney: 2400, coins: 10, crypto: { BTC: 0.5 } },
            status: { health: 200, armor: 0, hunger: 80, thirst: 75, stress: 10 },
            groups: { Staff: 3 },
            inventory: { 1: { name: 'backpackS', amount: 1, metadata: {} }, 2: { name: 'water', amount: 3, metadata: {} } },
            vehicles: { sultan: { plate: 'STR 001', tunings: {} } },
            seatbelt: false
        };
    }

    let world = freshWorld();

    /* ---------- formatação de valores Lua ---------- */
    function luaKey(k) {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : `["${k}"]`;
    }

    function toLua(v, depth = 0) {
        if (v === undefined || v === null) return 'nil';
        if (typeof v === 'string') return JSON.stringify(v);
        if (typeof v !== 'object') return String(v);
        const pad = '    '.repeat(depth + 1);
        const end = '    '.repeat(depth);
        const keys = Object.keys(v);
        if (!keys.length) return '{}';
        const isSeq = Array.isArray(v);
        const parts = keys.map((k) => {
            const val = toLua(v[k], depth + 1);
            if (isSeq) return val;
            return /^\d+$/.test(k) ? `[${k}] = ${val}` : `${luaKey(k)} = ${val}`;
        });
        const oneLine = `{ ${parts.join(', ')} }`;
        if (oneLine.length <= 56 && !oneLine.includes('\n')) return oneLine;
        return `{\n${pad}${parts.join(`,\n${pad}`)}\n${end}}`;
    }

    function luaArg(param, raw) {
        if (raw === '' || raw === undefined || raw === null) return null;
        if (param.type === 'number') {
            const n = Number(raw);
            return Number.isNaN(n) ? null : n;
        }
        if (param.type === 'boolean') return raw === 'true';
        return String(raw);
    }

    /* ---------- definições das funções jogáveis ---------- */
    const charIdParam = { n: 'characterId', type: 'number', def: 42, hint: 'pg.hint.char' };
    const sourceParam = { n: 'source', type: 'number', def: 1, hint: 'pg.hint.source' };
    const moneyTypeParam = { n: 'moneyType', type: 'select', options: ['cash', 'bankMoney', 'coins', 'crypto'], def: 'cash' };
    const cryptoParam = { n: 'criptoName', type: 'string', optional: true, def: '', hint: 'pg.hint.crypto' };
    const itemParam = { n: 'item', type: 'select', options: Object.keys(ITEMS), def: 'backpackS' };
    const vehicleParam = { n: 'vehicleModelOrHash', type: 'select', options: Object.keys(VEHICLES), def: 'sultan' };
    const groupParam = { n: 'group', type: 'select', options: Object.keys(GROUPS), def: 'Staff' };
    const amountParam = { n: 'amount', type: 'number', def: 25 };
    const qtyParam = { n: 'quantity', type: 'number', def: 1 };

    const isMe = (id) => Number(id) === world.characterId;

    function readMoney(type, crypto) {
        if (type === 'crypto') return world.economy.crypto[crypto] || 0;
        return world.economy[type] || 0;
    }

    function writeMoney(type, delta, crypto) {
        if (type === 'crypto') {
            if (!crypto) return false;
            world.economy.crypto[crypto] = (world.economy.crypto[crypto] || 0) + delta;
            return true;
        }
        if (!(type in world.economy)) return false;
        world.economy[type] += delta;
        return true;
    }

    function findSlot(item) {
        return Object.keys(world.inventory).find((s) => world.inventory[s].name === item);
    }

    const FUNCTIONS = [
        { group: 'players', name: 'getUserId', side: 'server', params: [sourceParam],
            run: ([s]) => ({ ret: [s === world.source ? world.userId : null] }) },
        { group: 'players', name: 'getCharacterId', side: 'server', params: [sourceParam],
            run: ([s]) => ({ ret: [s === world.source ? world.characterId : null] }) },
        { group: 'players', name: 'getCharacterIdentities', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.identity : null] }) },

        { group: 'economy', name: 'getCharacterMoneyAmount', side: 'server', params: [charIdParam, moneyTypeParam, cryptoParam],
            run: ([id, type, c]) => ({ ret: [isMe(id) ? readMoney(type, c) : 0] }) },
        { group: 'economy', name: 'addCharacterMoney', side: 'server', params: [charIdParam, amountParam, moneyTypeParam, cryptoParam],
            run: ([id, a, type, c]) => {
                if (!isMe(id) || typeof a !== 'number') return { ret: [false] };
                const ok = writeMoney(type, a, c);
                return { ret: [ok], fx: ok ? [t('pg.fx.updated', { key: type, value: toLua(readMoney(type, c)) })] : [] };
            } },
        { group: 'economy', name: 'removeCharacterMoney', side: 'server', params: [charIdParam, amountParam, moneyTypeParam, cryptoParam],
            run: ([id, a, type, c]) => {
                if (!isMe(id) || typeof a !== 'number') return { ret: [false] };
                const ok = writeMoney(type, -a, c);
                return { ret: [ok], fx: ok ? [t('pg.fx.noCheck', { key: type, value: toLua(readMoney(type, c)) })] : [] };
            } },
        { group: 'economy', name: 'getCharacterEconomyData', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.economy : null] }) },

        { group: 'inventory', name: 'getCharacterInventory', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.inventory : {}] }) },
        { group: 'inventory', name: 'getItemFromCharacterInventory', side: 'server', params: [charIdParam, itemParam],
            run: ([id, item]) => {
                const slot = isMe(id) ? findSlot(item) : undefined;
                return { ret: [slot ? world.inventory[slot] : null] };
            } },
        { group: 'inventory', name: 'addItemToCharacterInventory', side: 'server', params: [charIdParam, itemParam, qtyParam],
            run: ([id, item, q]) => {
                if (!isMe(id) || !ITEMS[item] || !(q > 0)) return { ret: [null] };
                const slot = findSlot(item);
                if (slot) {
                    world.inventory[slot].amount += q;
                } else {
                    let free = 1;
                    while (world.inventory[free]) free += 1;
                    if (free > INVENTORY_SLOTS) return { ret: [false] };
                    world.inventory[free] = { name: item, amount: q, metadata: {} };
                }
                return { ret: [true] };
            } },
        { group: 'inventory', name: 'removeItemFromCharacterInventory', side: 'server', params: [charIdParam, itemParam, qtyParam],
            run: ([id, item, q]) => {
                const slot = isMe(id) ? findSlot(item) : undefined;
                if (!slot || !(q > 0) || world.inventory[slot].amount < q) return { ret: [null] };
                world.inventory[slot].amount -= q;
                if (world.inventory[slot].amount === 0) delete world.inventory[slot];
                return { ret: [true] };
            } },
        { group: 'inventory', name: 'getCharacterInventorySlots', side: 'server', params: [charIdParam],
            run: ([id]) => {
                const used = isMe(id) ? Object.keys(world.inventory).length : 0;
                return { ret: [{ amount: INVENTORY_SLOTS, inUse: used, available: INVENTORY_SLOTS - used }] };
            } },

        { group: 'groups', name: 'hasCharacterGroup', side: 'server', params: [charIdParam, groupParam],
            run: ([id, g]) => ({ ret: [isMe(id) && world.groups[g] ? world.groups[g] : false] }) },
        { group: 'groups', name: 'getCharacterGroupHierarchy', side: 'server', params: [charIdParam, groupParam],
            run: ([id, g]) => {
                const lvl = isMe(id) ? world.groups[g] : undefined;
                return { ret: lvl ? [lvl, GROUPS[g][lvl]] : [null, null] };
            } },
        { group: 'groups', name: 'addCharacterGroup', side: 'server', params: [charIdParam, { ...groupParam, def: 'Police' }, { n: 'hierarchy', type: 'number', optional: true, def: 2 }],
            run: ([id, g, h]) => {
                if (!isMe(id)) return { ret: [false] };
                const lvl = h || 1;
                if (!GROUPS[g][lvl]) return { ret: [false] };
                world.groups[g] = lvl;
                return { ret: [true], fx: [t('pg.fx.updated', { key: `group_${g}`, value: lvl })] };
            } },
        { group: 'groups', name: 'getStatus', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.status : null] }) },

        { group: 'config', name: 'getItemLabel', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [ITEMS[i] ? pick(ITEMS[i].label) : null] }) },
        { group: 'config', name: 'getItemWeight', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [ITEMS[i] ? ITEMS[i].weight : null] }) },
        { group: 'config', name: 'getItemConfig', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [itemConfig(i)] }) },
        { group: 'config', name: 'getVehicleName', side: 'server', params: [vehicleParam],
            run: ([v]) => ({ ret: [VEHICLES[v] ? VEHICLES[v].name : null] }) },
        { group: 'config', name: 'getVehicleFuelCapacity', side: 'server', params: [vehicleParam],
            run: ([v]) => ({ ret: [VEHICLES[v] ? VEHICLES[v].fuel : null] }) },
        { group: 'config', name: 'getCharacterVehicles', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.vehicles : {}] }) },

        { group: 'tunnel', name: 'syncTunnelFunction', side: 'client',
            params: [{ n: 'functionName', type: 'select', options: ['getItemsConfig'], def: 'getItemsConfig', hint: 'pg.hint.tunnel' }],
            run: () => ({ ret: [allItems()] }) }
    ];

    /* ---------- statebags jogáveis ---------- */
    const BAGS = [
        { key: 'cash', scope: 'Player', get: () => world.economy.cash, set: (v) => { world.economy.cash = v; }, type: 'number' },
        { key: 'bankMoney', scope: 'Player', get: () => world.economy.bankMoney, set: (v) => { world.economy.bankMoney = v; }, type: 'number' },
        { key: 'coins', scope: 'Player', get: () => world.economy.coins, set: (v) => { world.economy.coins = v; }, type: 'number' },
        { key: 'health', scope: 'Player', get: () => world.status.health, set: (v) => { world.status.health = v; }, type: 'number' },
        { key: 'armor', scope: 'Player', get: () => world.status.armor, set: (v) => { world.status.armor = v; }, type: 'number' },
        { key: 'hunger', scope: 'Player', get: () => world.status.hunger, set: (v) => { world.status.hunger = v; }, type: 'number' },
        { key: 'thirst', scope: 'Player', get: () => world.status.thirst, set: (v) => { world.status.thirst = v; }, type: 'number' },
        { key: 'stress', scope: 'Player', get: () => world.status.stress, set: (v) => { world.status.stress = v; }, type: 'number' },
        { key: 'seatbelt', scope: 'Player', get: () => world.seatbelt, set: (v) => { world.seatbelt = v; }, type: 'boolean' },
        { key: 'group_Staff', scope: 'Player', get: () => world.groups.Staff || null, set: (v) => { if (v) world.groups.Staff = v; else delete world.groups.Staff; }, type: 'number' },
        { key: 'characterId', scope: 'Player', get: () => world.characterId, type: 'number', readonly: true },
        { key: 'identity', scope: 'Player', get: () => world.identity, type: 'table', readonly: true },
        { key: 'Str:language', scope: 'GlobalState', get: () => window.StrI18n.lang, type: 'string', readonly: true }
    ];

    /* ---------- DOM ---------- */
    const el = {
        segmented: root.querySelector('.segmented'),
        modeButtons: Array.from(root.querySelectorAll('[data-pg-mode]')),
        fnPane: root.querySelector('#pg-fn-pane'),
        bagPane: root.querySelector('#pg-bag-pane'),
        fnSelect: root.querySelector('#pg-fn-select'),
        fnArgs: root.querySelector('#pg-fn-args'),
        fnSide: root.querySelector('#pg-fn-side'),
        bagSelect: root.querySelector('#pg-bag-select'),
        bagAction: root.querySelector('#pg-bag-action'),
        bagValueWrap: root.querySelector('#pg-bag-value-wrap'),
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

    const currentFn = () => FUNCTIONS.find((f) => f.name === el.fnSelect.value);
    const currentBag = () => BAGS.find((b) => b.key === el.bagSelect.value);
    const bagValueInput = () => root.querySelector('#pg-bag-value');

    function renderFnSelect() {
        const selected = el.fnSelect.value || 'addCharacterMoney';
        const groups = [...new Set(FUNCTIONS.map((f) => f.group))];
        el.fnSelect.innerHTML = groups.map((g) => `<optgroup label="${esc(t(`pg.group.${g}`))}">${
            FUNCTIONS.filter((f) => f.group === g).map((f) => `<option value="${f.name}">${f.name}</option>`).join('')
        }</optgroup>`).join('');
        el.fnSelect.value = selected;
    }

    function renderBagSelect() {
        const selected = el.bagSelect.value || 'cash';
        el.bagSelect.innerHTML = BAGS.map((b) => `<option value="${esc(b.key)}">${esc(b.key)}${b.readonly ? ` · ${esc(t('pg.readonly'))}` : ''}</option>`).join('');
        el.bagSelect.value = selected;
    }

    function renderFnArgs(keepValues) {
        const fn = currentFn();
        const previous = keepValues ? fn.params.map((p, i) => {
            const input = root.querySelector(`#pg-arg-${i}`);
            return input ? input.value : undefined;
        }) : [];
        el.fnSide.textContent = fn.side.toUpperCase();
        el.fnSide.className = `pill pill-${fn.side}`;
        el.fnArgs.innerHTML = fn.params.map((p, i) => {
            const value = previous[i] !== undefined ? previous[i] : (p.def ?? '');
            const label = `<label class="pg-label" for="pg-arg-${i}">${esc(p.n)}${p.optional ? `<em>${esc(t('pg.optional'))}</em>` : ''}</label>`;
            let input;
            if (p.type === 'select') {
                input = `<select class="pg-input" id="pg-arg-${i}">${p.options.map((o) => `<option value="${esc(o)}"${String(o) === String(value) ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
            } else {
                input = `<input class="pg-input" id="pg-arg-${i}" type="${p.type === 'number' ? 'number' : 'text'}" value="${esc(value)}" placeholder="${p.optional ? 'nil' : ''}" autocomplete="off">`;
            }
            return `<div class="pg-field pg-field-in" style="--i:${i}">${label}${input}${p.hint ? `<span class="pg-hint">${esc(t(p.hint))}</span>` : ''}</div>`;
        }).join('');
        updateCode();
    }

    function readArgs(fn) {
        return fn.params.map((p, i) => luaArg(p, root.querySelector(`#pg-arg-${i}`).value));
    }

    function callSource(fn, args) {
        const list = args.slice();
        while (list.length && list[list.length - 1] === null) list.pop();
        return `local result = Str.functions.${fn.name}(${list.map((a) => toLua(a)).join(', ')})`;
    }

    function bagPath(bag) {
        const holder = bag.scope === 'GlobalState' ? 'GlobalState' : 'Player(source).state';
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(bag.key) ? `${holder}.${bag.key}` : `${holder}['${bag.key}']`;
    }

    function parseBagValue(bag) {
        const input = bagValueInput();
        const raw = input ? input.value : '';
        if (bag.type === 'number') return raw === '' ? null : Number(raw);
        if (bag.type === 'boolean') return raw === 'true';
        return raw;
    }

    function isSetting() {
        const bag = currentBag();
        return el.bagAction.value === 'set' && !bag.readonly;
    }

    function bagSource() {
        const bag = currentBag();
        if (isSetting()) return `${bagPath(bag)} = ${toLua(parseBagValue(bag))}`;
        return `local value = ${bagPath(bag)}\nprint(value)`;
    }

    /* Troca o campo de valor conforme o tipo do statebag selecionado. */
    function updateBagControls(resetValue) {
        const bag = currentBag();
        const setOpt = el.bagAction.querySelector('option[value="set"]');
        setOpt.disabled = !!bag.readonly;
        if (bag.readonly) el.bagAction.value = 'get';
        el.bagValueWrap.hidden = !isSetting();

        const wantSelect = bag.type === 'boolean';
        let input = bagValueInput();
        const isSelect = input.tagName === 'SELECT';
        const wantedType = bag.type === 'number' ? 'number' : 'text';
        if (wantSelect !== isSelect || (!wantSelect && input.type !== wantedType)) {
            input.outerHTML = wantSelect
                ? '<select class="pg-input" id="pg-bag-value"><option value="true">true</option><option value="false">false</option></select>'
                : `<input class="pg-input" id="pg-bag-value" type="${wantedType}" autocomplete="off">`;
            input = bagValueInput();
            input.addEventListener('input', updateCode);
            input.addEventListener('change', updateCode);
            resetValue = true;
        }
        if (resetValue) {
            const current = bag.get();
            if (wantSelect) input.value = current ? 'false' : 'true';
            else input.value = typeof current === 'object' && current !== null ? '' : String(current ?? '');
        }
        updateCode();
    }

    function updateCode() {
        if (mode === 'fn') {
            const fn = currentFn();
            el.code.textContent = `${callSource(fn, readArgs(fn))}\nprint(result)`;
        } else {
            el.code.textContent = bagSource();
        }
    }

    /* ---------- saída ---------- */
    function line(kind, icon, html) {
        const node = document.createElement('div');
        node.className = `pg-line pg-${kind}`;
        node.innerHTML = `<span class="pg-arrow">${icon}</span><span class="pg-body">${html}</span>`;
        el.out.appendChild(node);
        return node;
    }

    const wait = (ms) => new Promise((r) => window.setTimeout(r, reduceMotion ? 0 : ms));

    async function typeInto(node, text, token) {
        if (reduceMotion || text.length > 600) { node.textContent = text; return; }
        const step = Math.max(1, Math.ceil(text.length / 40));
        for (let i = 0; i <= text.length; i += step) {
            if (token !== runToken) return;
            node.textContent = text.slice(0, i);
            await wait(14);
        }
        node.textContent = text;
    }

    async function present(cmd, result, token) {
        line('cmd', '&gt;', esc(cmd));
        const meta = line('meta', '●', esc(el.keep.checked ? t('pg.keptRun') : t('pg.freshRun')));
        meta.classList.add('pg-dim');
        const spinner = line('run', '<span class="pg-spinner"></span>', esc(t('pg.running')));
        await wait(320);
        if (token !== runToken) return;
        spinner.remove();
        const ret = line(result.error ? 'err' : 'ret', result.error ? '✕' : '⇒', '<pre></pre>');
        await typeInto(ret.querySelector('pre'), result.text, token);
        for (const fx of result.fx || []) {
            if (token !== runToken) return;
            await wait(90);
            line('fx', '↳', esc(fx));
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
        if (!el.keep.checked) world = freshWorld();

        let cmd;
        let result;
        if (mode === 'fn') {
            const fn = currentFn();
            const args = readArgs(fn);
            cmd = callSource(fn, args);
            const res = fn.run(args);
            result = { text: res.ret.map((v) => toLua(v)).join(', '), fx: res.fx };
        } else {
            const bag = currentBag();
            cmd = bagSource().split('\n')[0];
            if (isSetting()) {
                const value = parseBagValue(bag);
                if (bag.type === 'number' && (value === null || Number.isNaN(value))) {
                    result = { error: true, text: t('pg.err.number') };
                } else {
                    bag.set(value);
                    result = { text: `${bag.key} = ${toLua(bag.get())}`, fx: [t('pg.fx.saved')] };
                }
            } else {
                result = { text: toLua(bag.get()) };
            }
        }

        await present(cmd, result, token);
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
        if (mode === 'bag') updateBagControls(true); else updateCode();
    }

    function ready() {
        el.out.innerHTML = '';
        line('fx', 'i', esc(t('pg.ready')));
    }

    el.modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.pgMode)));
    el.fnSelect.addEventListener('change', () => renderFnArgs(false));
    el.fnArgs.addEventListener('input', updateCode);
    el.fnArgs.addEventListener('change', updateCode);
    el.bagSelect.addEventListener('change', () => updateBagControls(true));
    el.bagAction.addEventListener('change', () => updateBagControls(false));
    bagValueInput().addEventListener('input', updateCode);
    el.run.addEventListener('click', run);
    el.clear.addEventListener('click', () => { runToken += 1; el.out.innerHTML = ''; el.run.classList.remove('is-running'); });
    el.reset.addEventListener('click', () => {
        runToken += 1;
        world = freshWorld();
        el.out.innerHTML = '';
        line('fx', '↺', esc(t('pg.restored')));
        el.reset.classList.remove('spin');
        void el.reset.offsetWidth;
        el.reset.classList.add('spin');
        if (mode === 'bag') updateBagControls(true);
    });
    el.run.addEventListener('keydown', (e) => { if (e.key === 'Enter' && running) e.preventDefault(); });
    root.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    });

    window.StrI18n.onChange(() => {
        renderFnSelect();
        renderBagSelect();
        renderFnArgs(true);
        if (mode === 'bag') updateBagControls(false);
        if (!running) ready();
    });

    renderFnSelect();
    renderBagSelect();
    renderFnArgs(false);
    setMode('fn');
    ready();
})();
