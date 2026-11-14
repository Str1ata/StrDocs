'use strict';

/* Playground: executa exemplos contra um mundo SIMULADO (nada aqui roda Lua de verdade). */
(function () {
    const GROUPS = {
        Staff: { 1: 'Helper', 2: 'Mod', 3: 'Admin', 4: 'Dono' },
        Police: { 1: 'Cadete', 2: 'Oficial', 3: 'Comandante' }
    };

    const ITEMS = {
        backpackS: { label: 'Backpack pequena', weight: 0.5, type: 'backpack', capacity: 10 },
        water: { label: 'Água', weight: 0.3, type: 'consumable' },
        bread: { label: 'Pão', weight: 0.2, type: 'consumable' },
        pistol: { label: 'Pistola', weight: 1.5, type: 'weapon', weapon: { isWeapon: true, weaponModel: 'WEAPON_PISTOL' } },
        phone: { label: 'Celular', weight: 0.4, type: 'tool' }
    };

    const VEHICLES = {
        sultan: { name: 'Sultan', fuel: 65, fuelType: 'gasoline', trunk: 40 },
        adder: { name: 'Adder', fuel: 80, fuelType: 'gasoline', trunk: 20 },
        faggio: { name: 'Faggio', fuel: 8, fuelType: 'gasoline', trunk: 5 }
    };

    const INVENTORY_SLOTS = 30;

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
        if (oneLine.length <= 60 && !oneLine.includes('\n')) return oneLine;
        return `{\n${pad}${parts.join(`,\n${pad}`)}\n${end}}`;
    }

    function luaArg(param, raw) {
        if (raw === '' || raw === undefined) return null;
        if (param.type === 'number') return Number(raw);
        if (param.type === 'boolean') return raw === 'true';
        return String(raw);
    }

    /* ---------- definições das funções jogáveis ---------- */
    const charIdParam = { n: 'characterId', type: 'number', def: 42, hint: 'Personagem simulado: 42' };
    const moneyTypeParam = { n: 'moneyType', type: 'select', options: ['cash', 'bankMoney', 'coins', 'crypto'], def: 'cash' };
    const cryptoParam = { n: 'criptoName', type: 'string', optional: true, def: '', hint: 'Só para crypto (ex.: BTC)' };
    const itemParam = { n: 'item', type: 'select', options: Object.keys(ITEMS), def: 'backpackS' };
    const vehicleParam = { n: 'vehicleModelOrHash', type: 'select', options: Object.keys(VEHICLES), def: 'sultan' };
    const groupParam = { n: 'group', type: 'select', options: Object.keys(GROUPS), def: 'Staff' };

    const isMe = (id) => Number(id) === world.characterId;

    function readMoney(type, crypto) {
        if (type === 'crypto') return (world.economy.crypto[crypto] || 0);
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
        { group: 'Jogadores e identidade', name: 'getUserId', side: 'server', params: [{ n: 'source', type: 'number', def: 1 }],
            run: ([s]) => ({ ret: [Number(s) === world.source ? world.userId : null] }) },
        { group: 'Jogadores e identidade', name: 'getCharacterId', side: 'server', params: [{ n: 'source', type: 'number', def: 1 }],
            run: ([s]) => ({ ret: [Number(s) === world.source ? world.characterId : null] }) },
        { group: 'Jogadores e identidade', name: 'getCharacterIdentities', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.identity : null] }) },

        { group: 'Economia', name: 'getCharacterMoneyAmount', side: 'server', params: [charIdParam, moneyTypeParam, cryptoParam],
            run: ([id, t, c]) => ({ ret: [isMe(id) ? readMoney(t, c) : 0] }) },
        { group: 'Economia', name: 'addCharacterMoney', side: 'server', params: [charIdParam, { n: 'amount', type: 'number', def: 25 }, moneyTypeParam, cryptoParam],
            run: ([id, a, t, c]) => {
                if (!isMe(id) || typeof a !== 'number') return { ret: [false] };
                const ok = writeMoney(t, a, c);
                return { ret: [ok], fx: ok ? [`Player(source).state.${t === 'crypto' ? 'crypto' : t} atualizado → ${toLua(readMoney(t, c))}`] : [] };
            } },
        { group: 'Economia', name: 'removeCharacterMoney', side: 'server', params: [charIdParam, { n: 'amount', type: 'number', def: 25 }, moneyTypeParam, cryptoParam],
            run: ([id, a, t, c]) => {
                if (!isMe(id) || typeof a !== 'number') return { ret: [false] };
                const ok = writeMoney(t, -a, c);
                return { ret: [ok], fx: ok ? [`Sem validação de saldo. ${t} agora vale ${toLua(readMoney(t, c))}`] : [] };
            } },
        { group: 'Economia', name: 'getCharacterEconomyData', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.economy : null] }) },

        { group: 'Inventário', name: 'getCharacterInventory', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.inventory : {}] }) },
        { group: 'Inventário', name: 'getItemFromCharacterInventory', side: 'server', params: [charIdParam, itemParam],
            run: ([id, item]) => {
                const slot = isMe(id) ? findSlot(item) : undefined;
                return { ret: [slot ? world.inventory[slot] : null] };
            } },
        { group: 'Inventário', name: 'addItemToCharacterInventory', side: 'server', params: [charIdParam, itemParam, { n: 'quantity', type: 'number', def: 1 }],
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
        { group: 'Inventário', name: 'removeItemFromCharacterInventory', side: 'server', params: [charIdParam, itemParam, { n: 'quantity', type: 'number', def: 1 }],
            run: ([id, item, q]) => {
                const slot = isMe(id) ? findSlot(item) : undefined;
                if (!slot || !(q > 0) || world.inventory[slot].amount < q) return { ret: [null] };
                world.inventory[slot].amount -= q;
                if (world.inventory[slot].amount === 0) delete world.inventory[slot];
                return { ret: [true] };
            } },
        { group: 'Inventário', name: 'getCharacterInventorySlots', side: 'server', params: [charIdParam],
            run: ([id]) => {
                const used = isMe(id) ? Object.keys(world.inventory).length : 0;
                return { ret: [{ amount: INVENTORY_SLOTS, inUse: used, available: INVENTORY_SLOTS - used }] };
            } },

        { group: 'Grupos e status', name: 'hasCharacterGroup', side: 'server', params: [charIdParam, groupParam],
            run: ([id, g]) => ({ ret: [isMe(id) && world.groups[g] ? world.groups[g] : false] }) },
        { group: 'Grupos e status', name: 'getCharacterGroupHierarchy', side: 'server', params: [charIdParam, groupParam],
            run: ([id, g]) => {
                const lvl = isMe(id) ? world.groups[g] : undefined;
                return { ret: lvl ? [lvl, GROUPS[g][lvl]] : [null, null] };
            } },
        { group: 'Grupos e status', name: 'addCharacterGroup', side: 'server', params: [charIdParam, groupParam, { n: 'hierarchy', type: 'number', optional: true, def: 1 }],
            run: ([id, g, h]) => {
                if (!isMe(id)) return { ret: [false] };
                const lvl = h || 1;
                if (!GROUPS[g][lvl]) return { ret: [false] };
                world.groups[g] = lvl;
                return { ret: [true], fx: [`Player(source).state.group_${g} → ${lvl}`] };
            } },
        { group: 'Grupos e status', name: 'getStatus', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.status : null] }) },

        { group: 'Configuração', name: 'getItemLabel', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [ITEMS[i] ? ITEMS[i].label : null] }) },
        { group: 'Configuração', name: 'getItemWeight', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [ITEMS[i] ? ITEMS[i].weight : null] }) },
        { group: 'Configuração', name: 'getItemConfig', side: 'server', params: [itemParam],
            run: ([i]) => ({ ret: [ITEMS[i] || null] }) },
        { group: 'Configuração', name: 'getVehicleName', side: 'server', params: [vehicleParam],
            run: ([v]) => ({ ret: [VEHICLES[v] ? VEHICLES[v].name : null] }) },
        { group: 'Configuração', name: 'getVehicleFuelCapacity', side: 'server', params: [vehicleParam],
            run: ([v]) => ({ ret: [VEHICLES[v] ? VEHICLES[v].fuel : null] }) },
        { group: 'Configuração', name: 'getCharacterVehicles', side: 'server', params: [charIdParam],
            run: ([id]) => ({ ret: [isMe(id) ? world.vehicles : {}] }) },

        { group: 'Tunnel (client)', name: 'syncTunnelFunction', side: 'client',
            params: [{ n: 'functionName', type: 'select', options: ['getItemsConfig'], def: 'getItemsConfig', hint: 'Handler registrado no server' }],
            run: () => ({ ret: [ITEMS] }) }
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
        { key: 'characterId', scope: 'Player', get: () => world.characterId, type: 'number', readonly: true },
        { key: 'identity', scope: 'Player', get: () => world.identity, type: 'table', readonly: true },
        { key: 'seatbelt', scope: 'Player', get: () => world.seatbelt, set: (v) => { world.seatbelt = v; }, type: 'boolean' },
        { key: 'group_Staff', scope: 'Player', get: () => world.groups.Staff || null, set: (v) => { if (v) world.groups.Staff = v; else delete world.groups.Staff; }, type: 'number' },
        { key: 'Str:language', scope: 'GlobalState', get: () => 'pt-BR', type: 'string', readonly: true }
    ];

    /* ---------- DOM ---------- */
    const root = document.getElementById('playground');
    if (!root) return;

    const el = {
        modeButtons: Array.from(root.querySelectorAll('[data-pg-mode]')),
        fnPane: root.querySelector('#pg-fn-pane'),
        bagPane: root.querySelector('#pg-bag-pane'),
        fnSelect: root.querySelector('#pg-fn-select'),
        fnArgs: root.querySelector('#pg-fn-args'),
        fnSide: root.querySelector('#pg-fn-side'),
        bagSelect: root.querySelector('#pg-bag-select'),
        bagAction: root.querySelector('#pg-bag-action'),
        bagValueWrap: root.querySelector('#pg-bag-value-wrap'),
        bagValue: root.querySelector('#pg-bag-value'),
        code: root.querySelector('#pg-code'),
        out: root.querySelector('#pg-output'),
        run: root.querySelector('#pg-run'),
        reset: root.querySelector('#pg-reset'),
        clear: root.querySelector('#pg-clear')
    };

    let mode = 'fn';

    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function currentFn() {
        return FUNCTIONS.find((f) => f.name === el.fnSelect.value);
    }

    function currentBag() {
        return BAGS.find((b) => b.key === el.bagSelect.value);
    }

    function renderFnSelect() {
        const groups = [...new Set(FUNCTIONS.map((f) => f.group))];
        el.fnSelect.innerHTML = groups.map((g) => `<optgroup label="${esc(g)}">${
            FUNCTIONS.filter((f) => f.group === g).map((f) => `<option value="${f.name}">${f.name}</option>`).join('')
        }</optgroup>`).join('');
        el.fnSelect.value = 'addCharacterMoney';
    }

    function renderBagSelect() {
        el.bagSelect.innerHTML = BAGS.map((b) => `<option value="${esc(b.key)}">${esc(b.key)}</option>`).join('');
        el.bagSelect.value = 'cash';
    }

    function renderFnArgs() {
        const fn = currentFn();
        el.fnSide.textContent = fn.side.toUpperCase();
        el.fnSide.className = `pill pill-${fn.side}`;
        el.fnArgs.innerHTML = fn.params.map((p, i) => {
            const label = `<label class="pg-label" for="pg-arg-${i}">${esc(p.n)}${p.optional ? '<em>opcional</em>' : ''}</label>`;
            let input;
            if (p.type === 'select') {
                input = `<select class="pg-input" id="pg-arg-${i}">${p.options.map((o) => `<option value="${esc(o)}"${o === p.def ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
            } else {
                input = `<input class="pg-input" id="pg-arg-${i}" type="${p.type === 'number' ? 'number' : 'text'}" value="${esc(p.def ?? '')}" placeholder="${p.optional ? 'nil' : ''}" autocomplete="off">`;
            }
            return `<div class="pg-field">${label}${input}${p.hint ? `<span class="pg-hint">${esc(p.hint)}</span>` : ''}</div>`;
        }).join('');
        updateCode();
    }

    function readArgs(fn) {
        return fn.params.map((p, i) => luaArg(p, root.querySelector(`#pg-arg-${i}`).value));
    }

    function callSource(fn, args) {
        const list = args.slice();
        while (list.length && list[list.length - 1] === null) list.pop();
        const argText = list.map((a) => toLua(a)).join(', ');
        if (fn.side === 'client') return `local result = Str.functions.${fn.name}(${argText})`;
        return `local result = Str.functions.${fn.name}(${argText})`;
    }

    function bagSource() {
        const bag = currentBag();
        const holder = bag.scope === 'GlobalState' ? 'GlobalState' : 'Player(source).state';
        const path = /^[A-Za-z_][A-Za-z0-9_]*$/.test(bag.key) ? `${holder}.${bag.key}` : `${holder}['${bag.key}']`;
        if (el.bagAction.value === 'set' && !bag.readonly) {
            const value = parseBagValue(bag);
            return `${path} = ${toLua(value)}`;
        }
        return `local value = ${path}`;
    }

    function parseBagValue(bag) {
        const raw = el.bagValue.value;
        if (bag.type === 'number') return raw === '' ? null : Number(raw);
        if (bag.type === 'boolean') return raw === 'true';
        return raw;
    }

    function updateBagControls() {
        const bag = currentBag();
        const canSet = !bag.readonly;
        const setOpt = el.bagAction.querySelector('option[value="set"]');
        setOpt.disabled = !canSet;
        if (!canSet) el.bagAction.value = 'get';
        const setting = el.bagAction.value === 'set';
        el.bagValueWrap.hidden = !setting;
        if (setting) {
            if (bag.type === 'boolean') {
                if (el.bagValue.tagName !== 'SELECT') {
                    el.bagValue.outerHTML = '<select class="pg-input" id="pg-bag-value"><option value="true">true</option><option value="false">false</option></select>';
                }
            } else if (el.bagValue.tagName !== 'INPUT' || el.bagValue.type !== (bag.type === 'number' ? 'number' : 'text')) {
                el.bagValue.outerHTML = `<input class="pg-input" id="pg-bag-value" type="${bag.type === 'number' ? 'number' : 'text'}" autocomplete="off">`;
            }
            el.bagValue = root.querySelector('#pg-bag-value');
            el.bagValue.addEventListener('input', updateCode);
            if (el.bagValue.value === '' && bag.get) el.bagValue.value = typeof bag.get() === 'object' ? '' : String(bag.get());
        }
        updateCode();
    }

    function updateCode() {
        let src;
        if (mode === 'fn') {
            const fn = currentFn();
            src = callSource(fn, readArgs(fn));
        } else {
            src = bagSource();
        }
        const extra = mode === 'fn' ? '\nprint(result)' : (el.bagAction.value === 'get' ? '\nprint(value)' : '');
        el.code.textContent = src + extra;
    }

    function log(kind, html) {
        const line = document.createElement('div');
        line.className = `pg-line pg-${kind}`;
        line.innerHTML = html;
        el.out.appendChild(line);
        el.out.scrollTop = el.out.scrollHeight;
    }

    function runFn() {
        const fn = currentFn();
        const args = readArgs(fn);
        log('cmd', `<span class="pg-prompt">&gt;</span> ${esc(callSource(fn, args))}`);
        const res = fn.run(args);
        const text = res.ret.map((v) => toLua(v)).join(', ');
        log('ret', `<span class="pg-arrow">⇒</span> <pre>${esc(text)}</pre>`);
        (res.fx || []).forEach((f) => log('fx', `<span class="pg-arrow">↳</span> ${esc(f)}`));
    }

    function runBag() {
        const bag = currentBag();
        const src = bagSource().split('\n')[0];
        log('cmd', `<span class="pg-prompt">&gt;</span> ${esc(src)}`);
        if (el.bagAction.value === 'set' && !bag.readonly) {
            const value = parseBagValue(bag);
            if (bag.type === 'number' && (value === null || Number.isNaN(value))) {
                log('err', '<span class="pg-arrow">✕</span> informe um número válido');
                return;
            }
            bag.set(value);
            log('ret', `<span class="pg-arrow">⇒</span> <pre>${esc(`${bag.key} = ${toLua(bag.get())}`)}</pre>`);
            log('fx', '<span class="pg-arrow">↳</span> valor gravado; outras chamadas simuladas já enxergam a mudança');
        } else {
            log('ret', `<span class="pg-arrow">⇒</span> <pre>${esc(toLua(bag.get()))}</pre>`);
        }
    }

    function run() {
        if (mode === 'fn') runFn(); else runBag();
        updateBagControls();
        if (mode === 'fn') updateCode();
    }

    function setMode(next) {
        mode = next;
        el.modeButtons.forEach((b) => {
            const on = b.dataset.pgMode === mode;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', String(on));
        });
        el.fnPane.hidden = mode !== 'fn';
        el.bagPane.hidden = mode !== 'bag';
        if (mode === 'bag') updateBagControls(); else updateCode();
    }

    el.modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.pgMode)));
    el.fnSelect.addEventListener('change', renderFnArgs);
    el.fnArgs.addEventListener('input', updateCode);
    el.fnArgs.addEventListener('change', updateCode);
    el.bagSelect.addEventListener('change', () => { el.bagValue.value = ''; updateBagControls(); });
    el.bagAction.addEventListener('change', updateBagControls);
    el.bagValue.addEventListener('input', updateCode);
    el.run.addEventListener('click', run);
    el.clear.addEventListener('click', () => { el.out.innerHTML = ''; });
    el.reset.addEventListener('click', () => {
        world = freshWorld();
        log('fx', '<span class="pg-arrow">↺</span> mundo simulado restaurado');
        updateBagControls();
    });

    renderFnSelect();
    renderBagSelect();
    renderFnArgs();
    setMode('fn');
    log('fx', '<span class="pg-arrow">i</span> Pronto. Escolha uma função ou statebag e clique em Executar.');
})();
