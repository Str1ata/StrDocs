'use strict';

/* Idiomas do site: textos de interface em PT-BR e EN-US.
   Elementos usam data-i18n (texto), data-i18n-html (HTML) e data-i18n-attr="atributo:chave;...". */
(function () {
    const UI = {
        'meta.title': ['Str Framework — Documentação', 'Str Framework — Documentation'],
        'meta.desc': ['Documentação da framework Str para FiveM, SixM e RedM: APIs client/server e statebags.', 'Str framework documentation for FiveM, SixM and RedM: client/server APIs and statebags.'],
        'brand.aria': ['Str Framework, início', 'Str Framework, home'],
        'nav.aria': ['Links externos', 'External links'],
        'lang.aria': ['Idioma do site', 'Site language'],

        'side.eyebrow': ['GUIA DA FRAMEWORK', 'FRAMEWORK GUIDE'],
        'side.overview': ['Visão geral', 'Overview'],
        'side.reference': ['Referência', 'Reference'],
        'side.examples': ['Exemplos práticos', 'Practical examples'],
        'side.playground': ['Execute seu exemplo', 'Run your example'],

        'hero.eyebrow': ['DOCUMENTAÇÃO OFICIAL · PT-BR', 'OFFICIAL DOCUMENTATION · EN-US'],
        'hero.title': ['Construa com a <span>Str</span>&#8288;.', 'Build with <span>Str</span>&#8288;.'],
        'hero.desc': ['Referência das APIs públicas, dos statebags e dos padrões de integração da framework para FiveM, SixM e RedM.', 'Reference for the public APIs, statebags and integration patterns of the framework for FiveM, SixM and RedM.'],
        'hero.cta1': ['Explorar APIs', 'Explore APIs'],
        'hero.cta2': ['Ver statebags', 'View statebags'],

        'notice': [
            'As funções de dados, economia, inventário e identidade são <strong>server-side</strong>. No client, use os helpers de tunnel para chamar funções registradas no server. As funções listadas refletem as definições encontradas em <code>Str.lua</code> e <code>client.lua</code>; módulos podem adicionar statebags próprios.',
            'Data, economy, inventory and identity functions are <strong>server-side</strong>. On the client, use the tunnel helpers to call functions registered on the server. The functions listed reflect the definitions found in <code>Str.lua</code> and <code>client.lua</code>; modules may add their own statebags.'
        ],

        'api.eyebrow': ['REFERÊNCIA DA API', 'API REFERENCE'],
        'api.intro': ['Pesquise por nome ou finalidade. Cada assinatura mostra os argumentos aceitos e o formato do retorno.', 'Search by name or purpose. Each signature shows the accepted arguments and the return shape.'],
        'api.search': ['Buscar função...', 'Search function...'],
        'api.searchAria': ['Buscar função', 'Search function'],
        'api.tabsAria': ['Lado da API', 'API side'],
        'api.serverNote': [
            'Chamadas server-side: <code>Str.functions.nome(...)</code>. Também são registradas como exports pelo núcleo. Argumentos que identificam personagem devem vir de contexto confiável do servidor.',
            'Server-side calls: <code>Str.functions.name(...)</code>. They are also registered as exports by the core. Arguments that identify a character must come from trusted server context.'
        ],
        'api.clientNote': [
            'O client expõe helpers para o tunnel. Use <code>syncTunnelFunction</code> para obter os valores de retorno da função registrada no server; <code>asyncTunnelFunction</code> dispara sem aguardar resposta.',
            'The client exposes tunnel helpers. Use <code>syncTunnelFunction</code> to get the return values of the function registered on the server; <code>asyncTunnelFunction</code> fires without waiting for a reply.'
        ],
        'api.empty': ['Nenhuma função corresponde à busca.', 'No function matches your search.'],
        'api.functions': ['funções', 'functions'],
        'api.function': ['função', 'function'],
        'api.colName': ['Função / assinatura', 'Function / signature'],
        'api.colArgs': ['Variáveis enviadas', 'Arguments'],
        'api.colReturn': ['Retorno', 'Returns'],

        'state.eyebrow': ['DADOS REATIVOS', 'REACTIVE DATA'],
        'state.intro': ['Chaves de estado publicadas pelo núcleo e pelos módulos presentes neste workspace.', 'State keys published by the core and by the modules in this workspace.'],
        'state.body': [
            'Leia estado de jogador por <code>Player(source).state.chave</code> no server ou <code>LocalPlayer.state.chave</code> no client. Para entidades, use <code>Entity(entity).state.chave</code>. A flag <code>replicated</code> controla se a alteração é replicada; <code>true</code> não substitui a validação de dados no server.',
            'Read player state with <code>Player(source).state.key</code> on the server or <code>LocalPlayer.state.key</code> on the client. For entities, use <code>Entity(entity).state.key</code>. The <code>replicated</code> flag controls whether the change is replicated; <code>true</code> does not replace data validation on the server.'
        ],
        'state.code': [
            "-- Client: observar uma mudança replicada no jogador local\nAddStateBagChangeHandler('health', nil, function(bagName, key, value)\n    if bagName == ('player_' .. GetPlayerServerId(PlayerId())) then\n        print(('Novo %s: %s'):format(key, value))\n    end\nend)",
            "-- Client: watch a replicated change on the local player\nAddStateBagChangeHandler('health', nil, function(bagName, key, value)\n    if bagName == ('player_' .. GetPlayerServerId(PlayerId())) then\n        print(('New %s: %s'):format(key, value))\n    end\nend)"
        ],
        'state.footnote': [
            'Chaves temporárias de cache e fila do núcleo que são limpas durante a inicialização não são tratadas como API pública estável. Consulte o código do módulo antes de depender de statebags específicos de uma extensão.',
            'Temporary core cache and queue keys that are cleared during startup are not treated as stable public API. Check the module code before relying on statebags specific to an extension.'
        ],

        'ex.eyebrow': ['DO CÓDIGO AO RESULTADO', 'FROM CODE TO RESULT'],
        'ex.title': ['Exemplos práticos', 'Practical examples'],
        'ex.intro': ['Os comentários mostram o retorno esperado para os valores de exemplo.', 'The comments show the expected return for the sample values.'],
        'ex.c1.title': ['Identidade e saldo', 'Identity and balance'],
        'ex.c1.code': [
            "local characterId = Str.functions.getCharacterId(source)\nif not characterId then return end\n\nlocal balance = Str.functions.getCharacterMoneyAmount(\n    characterId, 'cash'\n)\nprint(balance)\n-- Exemplo de retorno: 125\n\nlocal added = Str.functions.addCharacterMoney(\n    characterId, 25, 'cash'\n)\nprint(added)\n-- Exemplo de retorno: true",
            "local characterId = Str.functions.getCharacterId(source)\nif not characterId then return end\n\nlocal balance = Str.functions.getCharacterMoneyAmount(\n    characterId, 'cash'\n)\nprint(balance)\n-- Example return: 125\n\nlocal added = Str.functions.addCharacterMoney(\n    characterId, 25, 'cash'\n)\nprint(added)\n-- Example return: true"
        ],
        'ex.c2.title': ['Inventário', 'Inventory'],
        'ex.c2.code': [
            "local item = Str.functions.getItemFromCharacterInventory(\n    characterId, 'backpackS'\n)\nprint(json.encode(item))\n-- Exemplo de retorno:\n-- {\"name\":\"backpackS\",\"amount\":1}",
            "local item = Str.functions.getItemFromCharacterInventory(\n    characterId, 'backpackS'\n)\nprint(json.encode(item))\n-- Example return:\n-- {\"name\":\"backpackS\",\"amount\":1}"
        ],
        'ex.c3.title': ['Consultar config no server', 'Query config on the server'],
        'ex.c3.code': [
            "local items = Str.functions.syncTunnelFunction(\n    'getItemsConfig'\n)\nprint(type(items))\n-- Exemplo de retorno: \"table\"\nprint(items.backpackS.label)\n-- Exemplo de retorno na configuração atual: \"Backpack pequena\"",
            "local items = Str.functions.syncTunnelFunction(\n    'getItemsConfig'\n)\nprint(type(items))\n-- Example return: \"table\"\nprint(items.backpackS.label)\n-- Example return with the current config: \"Backpack pequena\""
        ],
        'ex.c4.title': ['Verificar grupo', 'Check group'],
        'ex.c4.code': [
            "local level = Str.functions.hasCharacterGroup(\n    characterId, 'Staff'\n)\nprint(level)\n-- Exemplo de retorno: 3 (nível do grupo)\n\nlocal hierarchy, name =\n    Str.functions.getCharacterGroupHierarchy(\n        characterId, 'Staff'\n    )\nprint(hierarchy, name)\n-- Exemplo de retorno: 3, \"Admin\"",
            "local level = Str.functions.hasCharacterGroup(\n    characterId, 'Staff'\n)\nprint(level)\n-- Example return: 3 (group level)\n\nlocal hierarchy, name =\n    Str.functions.getCharacterGroupHierarchy(\n        characterId, 'Staff'\n    )\nprint(hierarchy, name)\n-- Example return: 3, \"Admin\""
        ],

        'pg.eyebrow': ['TESTE NA HORA', 'TRY IT LIVE'],
        'pg.title': ['Execute seu exemplo', 'Run your example'],
        'pg.intro': [
            'Escolha uma função ou um statebag, ajuste os valores e veja o retorno. É uma simulação com dados fictícios: nenhum Lua real é executado.',
            'Pick a function or a statebag, tweak the values and see the return. It is a simulation with sample data: no real Lua is executed.'
        ],
        'pg.modeAria': ['Tipo de exemplo', 'Example type'],
        'pg.modeFn': ['Função', 'Function'],
        'pg.modeBag': ['Statebag', 'Statebag'],
        'pg.fnLabel': ['Função', 'Function'],
        'pg.bagLabel': ['Statebag', 'Statebag'],
        'pg.action': ['Ação', 'Action'],
        'pg.get': ['Ler valor', 'Read value'],
        'pg.set': ['Definir valor', 'Set value'],
        'pg.readonly': ['somente leitura', 'read-only'],
        'pg.newValue': ['Novo valor', 'New value'],
        'pg.run': ['Executar', 'Run'],
        'pg.reset': ['Restaurar mundo', 'Restore world'],
        'pg.keep': ['Manter estado entre execuções', 'Keep state between runs'],
        'pg.keepHint': ['Desligado: cada execução começa com o mundo restaurado.', 'Off: every run starts from a restored world.'],
        'pg.code': ['código', 'code'],
        'pg.output': ['saída', 'output'],
        'pg.clear': ['limpar', 'clear'],
        'pg.optional': ['opcional', 'optional'],
        'pg.running': ['executando…', 'running…'],
        'pg.hint.char': ['Personagem simulado: 42', 'Simulated character: 42'],
        'pg.hint.source': ['Jogador simulado: source 1', 'Simulated player: source 1'],
        'pg.hint.crypto': ['Só para crypto (ex.: BTC)', 'Crypto only (e.g. BTC)'],
        'pg.hint.tunnel': ['Handler registrado no server', 'Handler registered on the server'],
        'pg.ready': ['Pronto. Escolha uma função ou statebag e clique em Executar.', 'Ready. Pick a function or statebag and click Run.'],
        'pg.restored': ['Mundo simulado restaurado.', 'Simulated world restored.'],
        'pg.freshRun': ['mundo restaurado antes da execução', 'world restored before this run'],
        'pg.keptRun': ['estado mantido da execução anterior', 'state kept from the previous run'],
        'pg.fx.updated': ['Player(source).state.{key} atualizado → {value}', 'Player(source).state.{key} updated → {value}'],
        'pg.fx.noCheck': ['Sem validação de saldo. {key} agora vale {value}', 'No balance check. {key} is now {value}'],
        'pg.fx.saved': ['Valor gravado. Com "Manter estado" ligado, as próximas chamadas enxergam a mudança.', 'Value stored. With "Keep state" on, the next calls see the change.'],
        'pg.err.number': ['Informe um número válido.', 'Enter a valid number.'],
        'pg.group.players': ['Jogadores e identidade', 'Players and identity'],
        'pg.group.economy': ['Economia', 'Economy'],
        'pg.group.inventory': ['Inventário', 'Inventory'],
        'pg.group.groups': ['Grupos e status', 'Groups and status'],
        'pg.group.config': ['Configuração', 'Configuration'],
        'pg.group.tunnel': ['Tunnel (client)', 'Tunnel (client)'],

        'footer.text': ['Str Framework · Documentação comunitária', 'Str Framework · Community documentation'],
        'footer.top': ['Voltar ao topo ↑', 'Back to top ↑']
    };

    const LANGS = ['pt-BR', 'en-US'];
    const listeners = [];

    function detect() {
        try {
            const fromUrl = new URLSearchParams(location.search).get('lang');
            if (fromUrl && LANGS.includes(fromUrl)) return fromUrl;
        } catch (e) { /* ignorado */ }
        try {
            const saved = localStorage.getItem('strdocs-lang');
            if (LANGS.includes(saved)) return saved;
        } catch (e) { /* storage indisponível */ }
        const nav = (navigator.language || 'pt-BR').toLowerCase();
        return nav.startsWith('pt') ? 'pt-BR' : 'en-US';
    }

    let lang = detect();

    function idx() {
        return lang === 'en-US' ? 1 : 0;
    }

    function t(key, vars) {
        const entry = UI[key];
        let text = entry ? entry[idx()] : key;
        if (vars) Object.keys(vars).forEach((k) => { text = text.split(`{${k}}`).join(String(vars[k])); });
        return text;
    }

    /* Escolhe entre [pt, en] em dados que carregam as duas versões. */
    function pick(pair) {
        if (!Array.isArray(pair)) return pair;
        return pair[idx()] ?? pair[0];
    }

    function apply(root) {
        const scope = root || document;
        scope.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
        scope.querySelectorAll('[data-i18n-html]').forEach((node) => { node.innerHTML = t(node.dataset.i18nHtml); });
        scope.querySelectorAll('[data-i18n-attr]').forEach((node) => {
            node.dataset.i18nAttr.split(';').forEach((pair) => {
                const [attr, key] = pair.split(':').map((s) => s.trim());
                if (attr && key) node.setAttribute(attr, t(key));
            });
        });
        document.documentElement.lang = lang;
        document.title = t('meta.title');
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', t('meta.desc'));
        document.querySelectorAll('[data-lang-option]').forEach((btn) => {
            const on = btn.dataset.langOption === lang;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        });
        const sw = document.querySelector('.lang-switch');
        if (sw) sw.dataset.active = lang;
    }

    function set(next) {
        if (!LANGS.includes(next) || next === lang) return;
        lang = next;
        try { localStorage.setItem('strdocs-lang', lang); } catch (e) { /* storage indisponível */ }
        document.body.classList.add('lang-swapping');
        apply();
        listeners.forEach((fn) => fn(lang));
        window.setTimeout(() => document.body.classList.remove('lang-swapping'), 450);
    }

    window.StrI18n = {
        get lang() { return lang; },
        t,
        pick,
        set,
        apply,
        onChange(fn) { listeners.push(fn); }
    };

    document.addEventListener('DOMContentLoaded', () => {
        apply();
        document.querySelectorAll('[data-lang-option]').forEach((btn) => {
            btn.addEventListener('click', () => set(btn.dataset.langOption));
        });
    });
})();
