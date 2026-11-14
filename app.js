'use strict';

const serverSections = [
    {
        title: 'Tunnels e cache',
        note: 'Tunnels transportam chamadas entre client e server. Os callbacks são nomes registrados via registerTunnelFunction.',
        functions: [
            ['syncTunnelFunction', 'source: number, functionName: string, ...args', 'Todos os valores retornados pelo handler client; aguarda a resposta.'],
            ['asyncTunnelFunction', 'source: number, functionName: string, ...args', 'Sem retorno útil; envia a chamada sem aguardar resposta.'],
            ['getTunnelFunction', 'async: boolean, source: number, functionName: string, ...args', 'Modo sync: valores do callback client; modo async: nil.'],
            ['registerTunnelFunction', 'funcName: string, func: function', 'nil; registra um handler server invocável pelo client.'],
            ['updatePlayersData', 'source: number, async?: boolean', 'nil; grava no banco o cache do jogador, se houver dados e personagem ativo.']
        ]
    },
    {
        title: 'Veículos de configuração',
        note: 'vehicleModelOrHash aceita o nome do modelo (string) ou o hash numérico, exceto onde a assinatura indica um único tipo.',
        functions: [
            ['getVehicleHash', 'vehicleModel: string', 'number | nil — hash do modelo.'],
            ['getVehicleModel', 'vehicleHash: number', 'string | nil — nome do modelo.'],
            ['getVehicleConfig', 'vehicleModelOrHash: string | number', 'table | nil — configuração integral em Str.vehicles.'],
            ['getVehicleName', 'vehicleModelOrHash: string | number', 'string | nil — exhibitionName.'],
            ['getVehicleTrunkCapacity', 'vehicleModelOrHash: string | number', 'number | nil — peso máximo do porta-malas.'],
            ['getVehicleGloveBoxCapacity', 'vehicleModelOrHash: string | number', 'number | nil — peso máximo do porta-luvas.'],
            ['getVehicleEngineSpecs', 'vehicleModelOrHash: string | number', 'table | nil — configuração do motor.'],
            ['getVehicleFuelCapacity', 'vehicleModelOrHash: string | number', 'number | nil — capacidade do tanque.'],
            ['getVehicleFuelType', 'vehicleModelOrHash: string | number', 'string | nil — tipo de combustível.'],
            ['getVehicleBuyMoneyPrice', 'vehicleModelOrHash: string | number', 'number | nil — preço de compra em dinheiro.'],
            ['getVehicleBuyCoinPrice', 'vehicleModelOrHash: string | number', 'number | nil — preço de compra em coins.'],
            ['getVehicleRentalMoneyPrice', 'vehicleModelOrHash: string | number', 'number | nil — preço de aluguel em dinheiro.'],
            ['getVehicleRentalCoinPrice', 'vehicleModelOrHash: string | number', 'number | nil — preço de aluguel em coins.'],
            ['getVehicleRentalTimeDays', 'vehicleModelOrHash: string | number', 'number | nil — duração do aluguel em dias.'],
            ['getVehicleCategory', 'vehicleModelOrHash: string | number', 'string | nil — categoria configurada.'],
            ['getVehicleType', 'vehicleModelOrHash: string | number', 'string | nil — tipo configurado.'],
            ['getVehicleClass', 'vehicleModelOrHash: string | number', 'string | nil — classe configurada.']
        ]
    },
    {
        title: 'Itens de configuração',
        note: 'item é a chave string de Str.items. Campos opcionais não configurados retornam nil; os predicados retornam boolean.',
        functions: [
            ['getItemConfig', 'item: string', 'table | nil — configuração integral do item.'],
            ['getItemLabel', 'item: string', 'string | nil — label configurado.'],
            ['getItemDescription', 'item: string', 'string | nil — descrição.'],
            ['getItemWeight', 'item: string', 'number | nil — peso unitário.'],
            ['getItemCapacity', 'item: string', 'number | nil — capacidade configurada.'],
            ['getItemType', 'item: string', 'string | nil — tipo do item.'],
            ['getItemFabrication', 'item: string', 'table | nil — bloco fabricate.'],
            ['isItemFabricationEnabled', 'item: string', 'boolean — true somente quando fabricate.enabled == true.'],
            ['getItemFabricationItems', 'item: string', 'array | nil — ingredientes normalizados em {name, quantity, chanceNeeded}.'],
            ['getItemRepair', 'item: string', 'table | nil — bloco repair.'],
            ['getItemRepairItems', 'item: string', 'array | nil — ingredientes normalizados em {name, quantity, chanceNeeded}.'],
            ['getItemRepairGroups', 'item: string', 'table | nil — grupos autorizados para reparo.'],
            ['isItemRepairable', 'item: string', 'boolean — true se houver pelo menos um ingrediente de reparo.'],
            ['isItemRecyclable', 'item: string', 'boolean — true somente se recyclable == true.'],
            ['getItemDefaultMetadata', 'item: string', 'table | nil — metadata padrão.'],
            ['getItemDurability', 'item: string', 'table | nil — bloco durability.'],
            ['isItemDurabilityEnabled', 'item: string', 'boolean — true somente quando durability.enabled == true.'],
            ['getItemDurabilityMinutes', 'item: string', 'number | nil — duração em minutos.'],
            ['getItemDurabilityLife', 'item: string', 'number | nil — valor de life configurado.'],
            ['getItemWeaponConfig', 'item: string', 'table | nil — bloco weapon.'],
            ['isItemWeapon', 'item: string', 'boolean — true somente quando weapon.isWeapon == true.'],
            ['getItemWeaponModel', 'item: string', 'string | number | nil — weaponModel.'],
            ['getItemAmmoItem', 'item: string', 'string | nil — item de munição.']
        ]
    },
    {
        title: 'Jogadores e identidade',
        note: 'source é o ID de sessão do jogador; userId identifica a conta e characterId identifica o personagem ativo. getUserIdByIdentifiers recebe um mapa como {license: "valor-sem-prefixo", discord: "valor"}; chaves aceitas: steam, license, license2, discord e fivemId.',
        functions: [
            ['getPlayers', '—', 'array de {source, userId, characterId, identifiers} para jogadores no cache.'],
            ['getUserIdByIdentifiers', 'identifiers: table', 'number | nil — user_id encontrado no banco.'],
            ['getUserId', 'source: number', 'number | nil — ID da conta conectada.'],
            ['getUserSource', 'userId: number', 'number | nil — source online, se existir.'],
            ['activeCharacter', 'source: number, characterId: number | nil', 'boolean — true se o jogador estiver no cache.'],
            ['getCharacterId', 'source: number', 'number | nil — personagem ativo.'],
            ['getUserIdByCharacterId', 'characterId: number', 'number | nil — conta associada, apenas para personagem online.'],
            ['getUserSourceByCharacterId', 'characterId: number', 'number | nil — source online do personagem.'],
            ['getPlayerData', 'userId: number', 'table | nil — cache completo do jogador online.'],
            ['getPlayerIdentifiers', 'userId: number', 'table | nil — identificadores da conta online.'],
            ['getPlayerHdwids', 'userId: number', 'array | nil — tokens de hardware da conta online.'],
            ['getCharacterIdentities', 'characterId: number', 'table | nil — identidade em cache do personagem online.'],
            ['updateIdentities', 'characterId: number, identity: string, data: any', 'nil; atualiza um campo já existente da identidade em cache.'],
            ['getCharacterClothes', 'characterId: number', 'table | nil — seleções de roupas.'],
            ['setCharacterClothes', 'characterId: number, clothes: table', 'boolean — indica se o cache aceitou a atualização.'],
            ['getCharacterFace', 'characterId: number', 'table | nil — seleções faciais.'],
            ['setCharacterFace', 'characterId: number, face: table', 'boolean — indica se o cache aceitou a atualização.'],
            ['getCharacterOutfits', 'characterId: number', 'table | nil — outfits salvos.'],
            ['setCharacterOutfit', 'characterId: number, outfitData: table', 'boolean — insere ou substitui outfit pelo nome.']
        ]
    },
    {
        title: 'Whitelist, banimento, prisão e multas',
        note: 'Operações de banimento e status da conta consultam ou atualizam o banco. Prisão e multas alteram o cache do personagem online. Atenção: o carregamento inicial cria a chave fine, mas as funções de multas leem fines; confirme/corrija essa divergência no núcleo antes de depender delas.',
        functions: [
            ['getWhitelistStatus', 'userId: number', 'boolean — status de whitelist.'],
            ['setWhitelistStatus', 'userId: number, status: boolean', 'nil; persiste o status no banco.'],
            ['getBanStatus', 'userId: number', 'table | nil — {banned, reason, expiresAt}.'],
            ['setBanStatus', 'userId: number, status: boolean, reason?: string, expiresAt?: number', 'nil; atualiza banimento e desconecta conta online quando banida.'],
            ['getCharacterArrestTime', 'characterId: number', 'number — tempo de prisão, ou 0 se não disponível.'],
            ['setCharacterArrestTime', 'characterId: number, time: number, reason?: string, image?: string', 'boolean — false se personagem não estiver online.'],
            ['getCharacterCriminalRecords', 'characterId: number', 'array — registros {time, startAt, reason, image}; vazio se indisponível.'],
            ['deleteCharacterCriminalRecord', 'characterId: number, recordIndex: number', 'boolean — true se removeu o registro.'],
            ['getCharacterFinesPrice', 'characterId: number', 'number — total devido, ou 0 se indisponível.'],
            ['giveCharacterFine', 'characterId: number, amount: number, reason?: string, image?: string', 'boolean — soma ao total e registra a ação.'],
            ['removeCharacterFine', 'characterId: number, amount: number, reason?: string, image?: string', 'boolean — subtrai sem deixar total abaixo de zero.'],
            ['getCharacterFinesHistory', 'characterId: number', 'array — histórico de multas; vazio se indisponível.'],
            ['deleteCharacterFineHistory', 'characterId: number, historyIndex: number', 'boolean — true se removeu a entrada.']
        ]
    },
    {
        title: 'Posição, status e grupos',
        note: 'Grupos usam hierarquias definidas em Str.groups. getUsersByGroup atualmente lista apenas personagens online, mesmo quando onlineOnly não é informado.',
        functions: [
            ['updatePositions', 'characterId: number', 'boolean — atualiza a posição do personagem online.'],
            ['getPosition', 'characterId: number', 'vector3 | vector4 | nil — posição em cache; a posição inicial pode ser vector4.'],
            ['updateStatus', 'characterId: number, syncAll?: boolean, health?: number, armor?: number, hunger?: number, thirst?: number, stress?: number', 'boolean — atualiza o status no cache; sincroniza health/armor do ped quando aplicável.'],
            ['getStatus', 'characterId: number', 'table | nil — {health, armor, hunger, thirst, stress}; atualiza health/armor antes de retornar.'],
            ['addCharacterGroup', 'characterId: number, group: string, hierarchy?: number | string', 'boolean — atualiza grupo em cache e statebag.'],
            ['removeCharacterGroup', 'characterId: number, group: string', 'boolean — remove grupo e limpa statebag.'],
            ['getCharacterGroups', 'characterId: number', 'table | nil — mapa { [grupo] = nível }.'],
            ['getCharacterGroupHierarchy', 'characterId: number, group: string', 'number | nil, string | nil — nível e nome da hierarquia.'],
            ['hasCharacterGroup', 'characterId: number, group: string', 'number | false — nível do grupo ou false.'],
            ['getUsersByGroup', 'group: string, onlineOnly?: boolean', 'array de {source, userId, characterId, hierarchyLevel}; atualmente apenas online.']
        ]
    },
    {
        title: 'Inventário',
        note: 'Formato do núcleo: tabela indexada por slot com itens {name, amount, metadata}. quantity deve ser positivo; slot é opcional e metadata precisa corresponder exatamente para localizar/mesclar um item. O inventário canônico do Str_inventory pode ter convenções adicionais.',
        functions: [
            ['getCharacterInventory', 'characterId: number', 'table — inventário em cache; tabela vazia se indisponível.'],
            ['addItemToCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', 'boolean | nil — true ao adicionar; false em conflito de slot; nil para argumentos/jogador inválidos.'],
            ['removeItemFromCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', 'boolean | nil — true ao remover; nil se não encontrou item ou dados inválidos.'],
            ['getItemFromCharacterInventory', 'characterId: number, item: string, slot?: number, metadata?: table', 'table | nil — item {name, amount, metadata}.'],
            ['getCharacterInventorySlots', 'characterId: number', 'table — {amount, inUse, available}.'],
            ['getCharacterInventoryWeight', 'characterId: number', 'table — {total, used, available}; total permanece 0 no código atual.']
        ]
    },
    {
        title: 'Economia',
        note: 'moneyType normalmente é cash, bankMoney, coins ou crypto. Para crypto, informe criptoName. removeCharacterMoney não valida saldo e pode resultar em valor negativo.',
        functions: [
            ['getCharacterEconomyData', 'characterId: number', 'table | nil — {cash, bankMoney, coins, crypto}.'],
            ['setCharacterEconomyData', 'characterId: number, economyData: table', 'boolean — atualiza a economia em cache.'],
            ['addCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', 'boolean — true se argumentos forem aceitos; atualiza também o statebag do jogador online.'],
            ['removeCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', 'boolean — equivalente a addCharacterMoney com amount negativo; não valida saldo.'],
            ['getCharacterMoneyAmount', 'characterId: number, moneyType: string, criptoName?: string', 'number — saldo do tipo/moeda; 0 se indisponível.']
        ]
    },
    {
        title: 'Veículos do personagem',
        note: 'vehicleName é a chave do modelo em Str.vehicles. Os dados ficam em cache e são persistidos pelo fluxo de atualização do núcleo.',
        functions: [
            ['getCharacterVehiclesData', 'characterId: number', 'table — mapa de veículos; vazio se indisponível.'],
            ['setCharacterVehicleData', 'characterId: number, vehicleData: table', 'nil; substitui mapa de veículos em cache.'],
            ['addCharacterVehicle', 'characterId: number, vehicleName: string, data?: table', 'boolean — valida se o modelo existe em Str.vehicles.'],
            ['removeCharacterVehicle', 'characterId: number, vehicleName: string', 'boolean — true se o veículo existia e foi removido.'],
            ['getCharacterVehicles', 'characterId: number', 'table — mapa de veículos do personagem.'],
            ['getCharacterVehicle', 'characterId: number, vehicleName: string', 'table | nil — dados do veículo.'],
            ['getVehicleTunings', 'characterId: number, vehicleName: string', 'table — tunings ou tabela vazia.'],
            ['setVehicleTunings', 'characterId: number, vehicleName: string, tunings: table', 'boolean — true quando o veículo foi atualizado.'],
            ['getVehicleInventory', 'characterId: number, vehicleName: string', 'table — inventário do veículo ou tabela vazia.'],
            ['updateVehicleInventory', 'characterId: number, vehicleName: string, inventory: table', 'boolean — true quando o veículo foi atualizado.']
        ]
    }
];

const clientSections = [
    {
        title: 'Tunnel client',
        note: 'O client usa o nome da função como primeiro argumento; o server remoto envia source antes do nome. Registre o handler no lado que vai executá-lo.',
        functions: [
            ['syncTunnelFunction', 'functionName: string, ...args', 'Todos os valores retornados pelo handler server; síncrono, aguarda resposta.'],
            ['asyncTunnelFunction', 'functionName: string, ...args', 'nil; envia a chamada sem aguardar resposta.'],
            ['getTunnelFunction', 'async: boolean, functionName: string, ...args', 'Helper de baixo nível; sync retorna valores do server, async não retorna resultado.'],
            ['registerTunnelFunction', 'funcName: string, func: function', 'nil; registra um handler client invocável pelo server.']
        ]
    }
];

const statebags = [
    ['characterId', 'Player state · core', 'ID numérico do personagem ativo. Publicado pelo server ao carregar personagem e ao trocar de personagem.', 'Replicado'],
    ['identity', 'Player state · core', 'Tabela da identidade: name, middleName, lastName, document, documentNumber, photo, age, gender e activePhoneNumber.', 'Replicado'],
    ['health', 'Player state · core', 'Vida do ped. É atualizada no client ao receber dano e lida para sincronização do jogador.', 'Replicado em gravações client e no carregamento; updateStatus também escreve sem solicitar replicação.'],
    ['armor', 'Player state · core', 'Colete do ped.', 'Mesmo padrão de health'],
    ['hunger', 'Player state · core', 'Fome numérica; a sincronização/decadência depende da configuração hungerSystem.', 'Replicado'],
    ['thirst', 'Player state · core', 'Sede numérica; a sincronização/decadência depende da configuração thirstSystem.', 'Replicado'],
    ['stress', 'Player state · core', 'Estresse numérico; a sincronização/decadência depende da configuração stressSystem.', 'Replicado'],
    ['cash', 'Player state · economia', 'Saldo em dinheiro do personagem.', 'Replicado'],
    ['bankMoney', 'Player state · economia', 'Saldo bancário do personagem.', 'Replicado'],
    ['coins', 'Player state · economia', 'Saldo de coins do personagem.', 'Replicado'],
    ['cryptos / crypto', 'Player state · economia', 'Tabela de saldos crypto. No carregamento inicial o núcleo publica cryptos; addCharacterMoney atualiza crypto.', 'Replicado'],
    ['group_<nome>', 'Player state · grupos', 'Nível numérico da hierarquia do grupo; removido ao sair do grupo.', 'Replicado'],
    ['Str:phase', 'Player state · Str_creator / Str_style', 'Etapa: menu_picker, menu_creation, switching, spawning, ped_setup ou playing.', 'Não replicado (uso no server)'],
    ['Str:pendingCharacter', 'Player state · Str_creator', 'Durante troca: {characterId, isFirstSpawn, position} com posição [x, y, z, heading]. Removido ao concluir/falhar.', 'Não replicado (uso no server)'],
    ['Str:charId', 'Player state · Str_creator', 'ID de personagem durante a troca; limpo enquanto a troca está pendente.', 'Não replicado (uso no server)'],
    ['seatbelt', 'Player state · Str_hud', 'Boolean indicando cinto afivelado; client atualiza ao ativar/desativar.', 'Replicado'],
    ['isTargeting', 'Player state · Str_target', 'Boolean indicando se o jogador está mirando um alvo.', 'Replicado'],
    ['targetActive', 'Player state · Str_target', 'Boolean indicando se a interface de interação está ativa.', 'Replicado'],
    ['targetEntity', 'Player state · Str_target', 'Entity handle em foco; volta a 0 quando a mira fecha.', 'Replicado'],
    ['targetZone', 'Player state · Str_target', 'Identificador da zona em foco; nil quando a mira fecha.', 'Replicado'],
    ['targetOptions', 'Entity state · Str_target', 'Opções de interação da entidade; formato depende da API de target do módulo.', 'Replicado'],
    ['strMobilitiesVehicleId', 'Entity state · Str_mobilities', 'ID numérico persistido do veículo.', 'Replicado'],
    ['strMobilitiesVehicleData', 'Entity state · Str_mobilities', 'Objeto {id, netId, model, plate, tuning, engineHealth, bodyHealth, revision}.', 'Replicado'],
    ['strMobilitiesFuel', 'Entity state · Str_mobilities', 'Objeto {netId, fuel}; fuel é limitado a 0–100 no client.', 'Replicado'],
    ['Str:scripts', 'GlobalState · core', 'JSON serializado com as pastas de módulos Str_ disponíveis para a NUI.', 'Global'],
    ['Str:language', 'GlobalState · core', 'Código do idioma configurado para o resource.', 'Global'],
    ['strMobilitiesVehicleEntities', 'GlobalState · Str_mobilities', 'JSON serializado dos veículos gerenciados, usado para recuperar o estado após reiniciar o resource.', 'Global']
];

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalize(value) {
    return String(value).toLocaleLowerCase('pt-BR');
}

function renderApi(targetId, sections, query) {
    const target = document.getElementById(targetId);
    let visibleCount = 0;
    const markup = sections.map((section) => {
        const functions = section.functions.filter((item) => {
            const text = normalize([item[0], item[1], item[2], section.title, section.note].join(' '));
            return text.includes(query);
        });
        if (!functions.length) return '';
        visibleCount += functions.length;
        const rows = functions.map(([name, params, returns]) => `
            <tr>
                <td><span class="api-name">Str.functions.${escapeHtml(name)}</span><span class="api-signature">(${escapeHtml(params)})</span></td>
                <td>${escapeHtml(params)}</td>
                <td><span class="return-type">${escapeHtml(returns.split(' — ')[0])}</span>${returns.includes(' — ') ? `<br>${escapeHtml(returns.split(' — ').slice(1).join(' — '))}` : ''}</td>
            </tr>`).join('');
        return `
            <section class="api-category">
                <div class="category-heading"><h3>${escapeHtml(section.title)}</h3><span>${functions.length} funções</span></div>
                <p class="side-note">${escapeHtml(section.note)}</p>
                <div class="api-table-wrap">
                    <table class="api-table">
                        <thead><tr><th>Função / assinatura</th><th>Variáveis enviadas</th><th>Retorno</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </section>`;
    }).join('');
    target.innerHTML = markup;
    return visibleCount;
}

function renderStatebags(query) {
    const list = document.getElementById('statebag-list');
    const visible = statebags.filter((item) => normalize(item.join(' ')).includes(query));
    list.innerHTML = visible.map(([name, origin, description, replication]) => `
        <article class="statebag-card">
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(description)}</p>
            <span class="state-meta">${escapeHtml(origin)} · ${escapeHtml(replication)}</span>
        </article>`).join('');
    return visible.length;
}

const tabs = Array.from(document.querySelectorAll('.tab'));
let activeTab = 'server';

function updateSearch() {
    const query = normalize(document.getElementById('api-search').value.trim());
    const serverCount = renderApi('server-api', serverSections, query);
    const clientCount = renderApi('client-api', clientSections, query);
    const stateCount = renderStatebags(query);
    document.getElementById('server-count').textContent = `(${serverCount})`;
    document.getElementById('client-count').textContent = `(${clientCount})`;
    document.getElementById('empty-search').hidden = activeTab === 'server' ? serverCount > 0 : clientCount > 0;
    document.getElementById('statebag-list').hidden = stateCount === 0;
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        tabs.forEach((item) => {
            const selected = item === tab;
            item.classList.toggle('active', selected);
            item.setAttribute('aria-selected', String(selected));
            document.getElementById(`${item.dataset.tab}-panel`).hidden = !selected;
        });
        updateSearch();
    });
});

document.querySelectorAll('[data-tab-target]').forEach((link) => {
    link.addEventListener('click', () => {
        document.getElementById(`tab-${link.dataset.tabTarget}`).click();
    });
});

document.getElementById('api-search').addEventListener('input', updateSearch);
document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('api-search').focus();
    }
});

updateSearch();
