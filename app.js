'use strict';

/* Catálogo de Str.functions e statebags. Textos descritivos em [pt-BR, en-US]. */

const serverSections = [
    {
        title: ['Tunnels e cache', 'Tunnels and cache'],
        note: [
            'Tunnels transportam chamadas entre client e server. Os callbacks são nomes registrados via registerTunnelFunction.',
            'Tunnels carry calls between client and server. Callbacks are names registered via registerTunnelFunction.'
        ],
        functions: [
            ['syncTunnelFunction', 'source: number, functionName: string, ...args', ['Todos os valores retornados pelo handler client; aguarda a resposta.', 'All values returned by the client handler; waits for the reply.']],
            ['asyncTunnelFunction', 'source: number, functionName: string, ...args', ['Sem retorno útil; envia a chamada sem aguardar resposta.', 'No useful return; sends the call without waiting for a reply.']],
            ['getTunnelFunction', 'async: boolean, source: number, functionName: string, ...args', ['Modo sync: valores do callback client; modo async: nil.', 'Sync mode: values from the client callback; async mode: nil.']],
            ['registerTunnelFunction', 'funcName: string, func: function', ['nil; registra um handler server invocável pelo client.', 'nil; registers a server handler the client can invoke.']],
            ['updatePlayersData', 'source: number, async?: boolean', ['nil; grava no banco o cache do jogador, se houver dados e personagem ativo.', 'nil; writes the player cache to the database when there is data and an active character.']]
        ]
    },
    {
        title: ['Veículos de configuração', 'Vehicle configuration'],
        note: [
            'vehicleModelOrHash aceita o nome do modelo (string) ou o hash numérico, exceto onde a assinatura indica um único tipo.',
            'vehicleModelOrHash accepts the model name (string) or the numeric hash, except where the signature names a single type.'
        ],
        functions: [
            ['getVehicleHash', 'vehicleModel: string', ['number | nil — hash do modelo.', 'number | nil — model hash.']],
            ['getVehicleModel', 'vehicleHash: number', ['string | nil — nome do modelo.', 'string | nil — model name.']],
            ['getVehicleConfig', 'vehicleModelOrHash: string | number', ['table | nil — configuração integral em Str.vehicles.', 'table | nil — full configuration in Str.vehicles.']],
            ['getVehicleName', 'vehicleModelOrHash: string | number', ['string | nil — exhibitionName.', 'string | nil — exhibitionName.']],
            ['getVehicleTrunkCapacity', 'vehicleModelOrHash: string | number', ['number | nil — peso máximo do porta-malas.', 'number | nil — max trunk weight.']],
            ['getVehicleGloveBoxCapacity', 'vehicleModelOrHash: string | number', ['number | nil — peso máximo do porta-luvas.', 'number | nil — max glove box weight.']],
            ['getVehicleEngineSpecs', 'vehicleModelOrHash: string | number', ['table | nil — configuração do motor.', 'table | nil — engine configuration.']],
            ['getVehicleFuelCapacity', 'vehicleModelOrHash: string | number', ['number | nil — capacidade do tanque.', 'number | nil — fuel tank capacity.']],
            ['getVehicleFuelType', 'vehicleModelOrHash: string | number', ['string | nil — tipo de combustível.', 'string | nil — fuel type.']],
            ['getVehicleBuyMoneyPrice', 'vehicleModelOrHash: string | number', ['number | nil — preço de compra em dinheiro.', 'number | nil — purchase price in money.']],
            ['getVehicleBuyCoinPrice', 'vehicleModelOrHash: string | number', ['number | nil — preço de compra em coins.', 'number | nil — purchase price in coins.']],
            ['getVehicleRentalMoneyPrice', 'vehicleModelOrHash: string | number', ['number | nil — preço de aluguel em dinheiro.', 'number | nil — rental price in money.']],
            ['getVehicleRentalCoinPrice', 'vehicleModelOrHash: string | number', ['number | nil — preço de aluguel em coins.', 'number | nil — rental price in coins.']],
            ['getVehicleRentalTimeDays', 'vehicleModelOrHash: string | number', ['number | nil — duração do aluguel em dias.', 'number | nil — rental duration in days.']],
            ['getVehicleCategory', 'vehicleModelOrHash: string | number', ['string | nil — categoria configurada.', 'string | nil — configured category.']],
            ['getVehicleType', 'vehicleModelOrHash: string | number', ['string | nil — tipo configurado.', 'string | nil — configured type.']],
            ['getVehicleClass', 'vehicleModelOrHash: string | number', ['string | nil — classe configurada.', 'string | nil — configured class.']]
        ]
    },
    {
        title: ['Itens de configuração', 'Item configuration'],
        note: [
            'item é a chave string de Str.items. Campos opcionais não configurados retornam nil; os predicados retornam boolean.',
            'item is the string key in Str.items. Optional fields that are not configured return nil; predicates return boolean.'
        ],
        functions: [
            ['getItemConfig', 'item: string', ['table | nil — configuração integral do item.', 'table | nil — full item configuration.']],
            ['getItemLabel', 'item: string', ['string | nil — label configurado.', 'string | nil — configured label.']],
            ['getItemDescription', 'item: string', ['string | nil — descrição.', 'string | nil — description.']],
            ['getItemWeight', 'item: string', ['number | nil — peso unitário.', 'number | nil — unit weight.']],
            ['getItemCapacity', 'item: string', ['number | nil — capacidade configurada.', 'number | nil — configured capacity.']],
            ['getItemType', 'item: string', ['string | nil — tipo do item.', 'string | nil — item type.']],
            ['getItemFabrication', 'item: string', ['table | nil — bloco fabricate.', 'table | nil — fabricate block.']],
            ['isItemFabricationEnabled', 'item: string', ['boolean — true somente quando fabricate.enabled == true.', 'boolean — true only when fabricate.enabled == true.']],
            ['getItemFabricationItems', 'item: string', ['array | nil — ingredientes normalizados em {name, quantity, chanceNeeded}.', 'array | nil — ingredients normalized to {name, quantity, chanceNeeded}.']],
            ['getItemRepair', 'item: string', ['table | nil — bloco repair.', 'table | nil — repair block.']],
            ['getItemRepairItems', 'item: string', ['array | nil — ingredientes normalizados em {name, quantity, chanceNeeded}.', 'array | nil — ingredients normalized to {name, quantity, chanceNeeded}.']],
            ['getItemRepairGroups', 'item: string', ['table | nil — grupos autorizados para reparo.', 'table | nil — groups allowed to repair.']],
            ['isItemRepairable', 'item: string', ['boolean — true se houver pelo menos um ingrediente de reparo.', 'boolean — true if there is at least one repair ingredient.']],
            ['isItemRecyclable', 'item: string', ['boolean — true somente se recyclable == true.', 'boolean — true only if recyclable == true.']],
            ['getItemDefaultMetadata', 'item: string', ['table | nil — metadata padrão.', 'table | nil — default metadata.']],
            ['getItemDurability', 'item: string', ['table | nil — bloco durability.', 'table | nil — durability block.']],
            ['isItemDurabilityEnabled', 'item: string', ['boolean — true somente quando durability.enabled == true.', 'boolean — true only when durability.enabled == true.']],
            ['getItemDurabilityMinutes', 'item: string', ['number | nil — duração em minutos.', 'number | nil — duration in minutes.']],
            ['getItemDurabilityLife', 'item: string', ['number | nil — valor de life configurado.', 'number | nil — configured life value.']],
            ['getItemWeaponConfig', 'item: string', ['table | nil — bloco weapon.', 'table | nil — weapon block.']],
            ['isItemWeapon', 'item: string', ['boolean — true somente quando weapon.isWeapon == true.', 'boolean — true only when weapon.isWeapon == true.']],
            ['getItemWeaponModel', 'item: string', ['string | number | nil — weaponModel.', 'string | number | nil — weaponModel.']],
            ['getItemAmmoItem', 'item: string', ['string | nil — item de munição.', 'string | nil — ammo item.']]
        ]
    },
    {
        title: ['Jogadores e identidade', 'Players and identity'],
        note: [
            'source é o ID de sessão do jogador; userId identifica a conta e characterId identifica o personagem ativo. getUserIdByIdentifiers recebe um mapa como {license: "valor-sem-prefixo", discord: "valor"}; chaves aceitas: steam, license, license2, discord e fivemId.',
            'source is the player session ID; userId identifies the account and characterId identifies the active character. getUserIdByIdentifiers takes a map such as {license: "value-without-prefix", discord: "value"}; accepted keys: steam, license, license2, discord and fivemId.'
        ],
        functions: [
            ['getPlayers', '—', ['array de {source, userId, characterId, identifiers} para jogadores no cache.', 'array of {source, userId, characterId, identifiers} for players in the cache.']],
            ['getUserIdByIdentifiers', 'identifiers: table', ['number | nil — user_id encontrado no banco.', 'number | nil — user_id found in the database.']],
            ['getUserId', 'source: number', ['number | nil — ID da conta conectada.', 'number | nil — ID of the connected account.']],
            ['getUserSource', 'userId: number', ['number | nil — source online, se existir.', 'number | nil — online source, if any.']],
            ['activeCharacter', 'source: number, characterId: number | nil', ['boolean — true se o jogador estiver no cache.', 'boolean — true if the player is in the cache.']],
            ['getCharacterId', 'source: number', ['number | nil — personagem ativo.', 'number | nil — active character.']],
            ['getUserIdByCharacterId', 'characterId: number', ['number | nil — conta associada, apenas para personagem online.', 'number | nil — linked account, online characters only.']],
            ['getUserSourceByCharacterId', 'characterId: number', ['number | nil — source online do personagem.', 'number | nil — online source of the character.']],
            ['getPlayerData', 'userId: number', ['table | nil — cache completo do jogador online.', 'table | nil — full cache of the online player.']],
            ['getPlayerIdentifiers', 'userId: number', ['table | nil — identificadores da conta online.', 'table | nil — identifiers of the online account.']],
            ['getPlayerHdwids', 'userId: number', ['array | nil — tokens de hardware da conta online.', 'array | nil — hardware tokens of the online account.']],
            ['getCharacterIdentities', 'characterId: number', ['table | nil — identidade em cache do personagem online.', 'table | nil — cached identity of the online character.']],
            ['updateIdentities', 'characterId: number, identity: string, data: any', ['nil; atualiza um campo já existente da identidade em cache.', 'nil; updates an existing field of the cached identity.']],
            ['getCharacterClothes', 'characterId: number', ['table | nil — seleções de roupas.', 'table | nil — clothing selections.']],
            ['setCharacterClothes', 'characterId: number, clothes: table', ['boolean — indica se o cache aceitou a atualização.', 'boolean — whether the cache accepted the update.']],
            ['getCharacterFace', 'characterId: number', ['table | nil — seleções faciais.', 'table | nil — face selections.']],
            ['setCharacterFace', 'characterId: number, face: table', ['boolean — indica se o cache aceitou a atualização.', 'boolean — whether the cache accepted the update.']],
            ['getCharacterOutfits', 'characterId: number', ['table | nil — outfits salvos.', 'table | nil — saved outfits.']],
            ['setCharacterOutfit', 'characterId: number, outfitData: table', ['boolean — insere ou substitui outfit pelo nome.', 'boolean — inserts or replaces an outfit by name.']]
        ]
    },
    {
        title: ['Whitelist, banimento, prisão e multas', 'Whitelist, bans, jail and fines'],
        note: [
            'Operações de banimento e status da conta consultam ou atualizam o banco. Prisão e multas alteram o cache do personagem online. Atenção: o carregamento inicial cria a chave fine, mas as funções de multas leem fines; confirme/corrija essa divergência no núcleo antes de depender delas.',
            'Ban and account status operations read or update the database. Jail and fines change the online character cache. Note: the initial load creates the fine key, but the fine functions read fines; confirm/fix this mismatch in the core before relying on them.'
        ],
        functions: [
            ['getWhitelistStatus', 'userId: number', ['boolean — status de whitelist.', 'boolean — whitelist status.']],
            ['setWhitelistStatus', 'userId: number, status: boolean', ['nil; persiste o status no banco.', 'nil; persists the status in the database.']],
            ['getBanStatus', 'userId: number', ['table | nil — {banned, reason, expiresAt}.', 'table | nil — {banned, reason, expiresAt}.']],
            ['setBanStatus', 'userId: number, status: boolean, reason?: string, expiresAt?: number', ['nil; atualiza banimento e desconecta conta online quando banida.', 'nil; updates the ban and drops the online account when banned.']],
            ['getCharacterArrestTime', 'characterId: number', ['number — tempo de prisão, ou 0 se não disponível.', 'number — jail time, or 0 if unavailable.']],
            ['setCharacterArrestTime', 'characterId: number, time: number, reason?: string, image?: string', ['boolean — false se personagem não estiver online.', 'boolean — false if the character is not online.']],
            ['getCharacterCriminalRecords', 'characterId: number', ['array — registros {time, startAt, reason, image}; vazio se indisponível.', 'array — records {time, startAt, reason, image}; empty if unavailable.']],
            ['deleteCharacterCriminalRecord', 'characterId: number, recordIndex: number', ['boolean — true se removeu o registro.', 'boolean — true if the record was removed.']],
            ['getCharacterFinesPrice', 'characterId: number', ['number — total devido, ou 0 se indisponível.', 'number — total owed, or 0 if unavailable.']],
            ['giveCharacterFine', 'characterId: number, amount: number, reason?: string, image?: string', ['boolean — soma ao total e registra a ação.', 'boolean — adds to the total and logs the action.']],
            ['removeCharacterFine', 'characterId: number, amount: number, reason?: string, image?: string', ['boolean — subtrai sem deixar total abaixo de zero.', 'boolean — subtracts without letting the total go below zero.']],
            ['getCharacterFinesHistory', 'characterId: number', ['array — histórico de multas; vazio se indisponível.', 'array — fine history; empty if unavailable.']],
            ['deleteCharacterFineHistory', 'characterId: number, historyIndex: number', ['boolean — true se removeu a entrada.', 'boolean — true if the entry was removed.']]
        ]
    },
    {
        title: ['Posição, status e grupos', 'Position, status and groups'],
        note: [
            'Grupos usam hierarquias definidas em Str.groups. getUsersByGroup atualmente lista apenas personagens online, mesmo quando onlineOnly não é informado.',
            'Groups use hierarchies defined in Str.groups. getUsersByGroup currently lists online characters only, even when onlineOnly is not given.'
        ],
        functions: [
            ['updatePositions', 'characterId: number', ['boolean — atualiza a posição do personagem online.', 'boolean — updates the online character position.']],
            ['getPosition', 'characterId: number', ['vector3 | vector4 | nil — posição em cache; a posição inicial pode ser vector4.', 'vector3 | vector4 | nil — cached position; the initial position may be a vector4.']],
            ['updateStatus', 'characterId: number, syncAll?: boolean, health?: number, armor?: number, hunger?: number, thirst?: number, stress?: number', ['boolean — atualiza o status no cache; sincroniza health/armor do ped quando aplicável.', 'boolean — updates the status in the cache; syncs ped health/armor when applicable.']],
            ['getStatus', 'characterId: number', ['table | nil — {health, armor, hunger, thirst, stress}; atualiza health/armor antes de retornar.', 'table | nil — {health, armor, hunger, thirst, stress}; refreshes health/armor before returning.']],
            ['addCharacterGroup', 'characterId: number, group: string, hierarchy?: number | string', ['boolean — atualiza grupo em cache e statebag.', 'boolean — updates the group in cache and statebag.']],
            ['removeCharacterGroup', 'characterId: number, group: string', ['boolean — remove grupo e limpa statebag.', 'boolean — removes the group and clears the statebag.']],
            ['getCharacterGroups', 'characterId: number', ['table | nil — mapa { [grupo] = nível }.', 'table | nil — map { [group] = level }.']],
            ['getCharacterGroupHierarchy', 'characterId: number, group: string', ['number | nil, string | nil — nível e nome da hierarquia.', 'number | nil, string | nil — hierarchy level and name.']],
            ['hasCharacterGroup', 'characterId: number, group: string', ['number | false — nível do grupo ou false.', 'number | false — group level or false.']],
            ['getUsersByGroup', 'group: string, onlineOnly?: boolean', ['array de {source, userId, characterId, hierarchyLevel}; atualmente apenas online.', 'array of {source, userId, characterId, hierarchyLevel}; currently online only.']]
        ]
    },
    {
        title: ['Inventário', 'Inventory'],
        note: [
            'Formato do núcleo: tabela indexada por slot com itens {name, amount, metadata}. quantity deve ser positivo; slot é opcional e metadata precisa corresponder exatamente para localizar/mesclar um item. O inventário canônico do Str_inventory pode ter convenções adicionais.',
            'Core format: slot-indexed table with items {name, amount, metadata}. quantity must be positive; slot is optional and metadata must match exactly to find/merge an item. The canonical Str_inventory may have extra conventions.'
        ],
        functions: [
            ['getCharacterInventory', 'characterId: number', ['table — inventário em cache; tabela vazia se indisponível.', 'table — cached inventory; empty table if unavailable.']],
            ['addItemToCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', ['boolean | nil — true ao adicionar; false em conflito de slot; nil para argumentos/jogador inválidos.', 'boolean | nil — true when added; false on slot conflict; nil for invalid arguments/player.']],
            ['removeItemFromCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', ['boolean | nil — true ao remover; nil se não encontrou item ou dados inválidos.', 'boolean | nil — true when removed; nil if the item was not found or data is invalid.']],
            ['getItemFromCharacterInventory', 'characterId: number, item: string, slot?: number, metadata?: table', ['table | nil — item {name, amount, metadata}.', 'table | nil — item {name, amount, metadata}.']],
            ['getCharacterInventorySlots', 'characterId: number', ['table — {amount, inUse, available}.', 'table — {amount, inUse, available}.']],
            ['getCharacterInventoryWeight', 'characterId: number', ['table — {total, used, available}; total permanece 0 no código atual.', 'table — {total, used, available}; total stays 0 in the current code.']]
        ]
    },
    {
        title: ['Economia', 'Economy'],
        note: [
            'moneyType normalmente é cash, bankMoney, coins ou crypto. Para crypto, informe criptoName. removeCharacterMoney não valida saldo e pode resultar em valor negativo.',
            'moneyType is usually cash, bankMoney, coins or crypto. For crypto, pass criptoName. removeCharacterMoney does not check the balance and can result in a negative value.'
        ],
        functions: [
            ['getCharacterEconomyData', 'characterId: number', ['table | nil — {cash, bankMoney, coins, crypto}.', 'table | nil — {cash, bankMoney, coins, crypto}.']],
            ['setCharacterEconomyData', 'characterId: number, economyData: table', ['boolean — atualiza a economia em cache.', 'boolean — updates the cached economy.']],
            ['addCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', ['boolean — true se argumentos forem aceitos; atualiza também o statebag do jogador online.', 'boolean — true if the arguments are accepted; also updates the online player statebag.']],
            ['removeCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', ['boolean — equivalente a addCharacterMoney com amount negativo; não valida saldo.', 'boolean — same as addCharacterMoney with a negative amount; does not check the balance.']],
            ['getCharacterMoneyAmount', 'characterId: number, moneyType: string, criptoName?: string', ['number — saldo do tipo/moeda; 0 se indisponível.', 'number — balance for the type/currency; 0 if unavailable.']]
        ]
    },
    {
        title: ['Veículos do personagem', 'Character vehicles'],
        note: [
            'vehicleName é a chave do modelo em Str.vehicles. Os dados ficam em cache e são persistidos pelo fluxo de atualização do núcleo.',
            'vehicleName is the model key in Str.vehicles. Data stays in cache and is persisted by the core update flow.'
        ],
        functions: [
            ['getCharacterVehiclesData', 'characterId: number', ['table — mapa de veículos; vazio se indisponível.', 'table — vehicle map; empty if unavailable.']],
            ['setCharacterVehicleData', 'characterId: number, vehicleData: table', ['nil; substitui mapa de veículos em cache.', 'nil; replaces the cached vehicle map.']],
            ['addCharacterVehicle', 'characterId: number, vehicleName: string, data?: table', ['boolean — valida se o modelo existe em Str.vehicles.', 'boolean — checks that the model exists in Str.vehicles.']],
            ['removeCharacterVehicle', 'characterId: number, vehicleName: string', ['boolean — true se o veículo existia e foi removido.', 'boolean — true if the vehicle existed and was removed.']],
            ['getCharacterVehicles', 'characterId: number', ['table — mapa de veículos do personagem.', "table — the character's vehicle map."]],
            ['getCharacterVehicle', 'characterId: number, vehicleName: string', ['table | nil — dados do veículo.', 'table | nil — vehicle data.']],
            ['getVehicleTunings', 'characterId: number, vehicleName: string', ['table — tunings ou tabela vazia.', 'table — tunings or an empty table.']],
            ['setVehicleTunings', 'characterId: number, vehicleName: string, tunings: table', ['boolean — true quando o veículo foi atualizado.', 'boolean — true when the vehicle was updated.']],
            ['getVehicleInventory', 'characterId: number, vehicleName: string', ['table — inventário do veículo ou tabela vazia.', 'table — vehicle inventory or an empty table.']],
            ['updateVehicleInventory', 'characterId: number, vehicleName: string, inventory: table', ['boolean — true quando o veículo foi atualizado.', 'boolean — true when the vehicle was updated.']]
        ]
    }
];

const clientSections = [
    {
        title: ['Tunnel client', 'Client tunnel'],
        note: [
            'O client usa o nome da função como primeiro argumento; o server remoto envia source antes do nome. Registre o handler no lado que vai executá-lo.',
            'The client passes the function name as the first argument; the remote server sends source before the name. Register the handler on the side that runs it.'
        ],
        functions: [
            ['syncTunnelFunction', 'functionName: string, ...args', ['Todos os valores retornados pelo handler server; síncrono, aguarda resposta.', 'All values returned by the server handler; synchronous, waits for the reply.']],
            ['asyncTunnelFunction', 'functionName: string, ...args', ['nil; envia a chamada sem aguardar resposta.', 'nil; sends the call without waiting for a reply.']],
            ['getTunnelFunction', 'async: boolean, functionName: string, ...args', ['Helper de baixo nível; sync retorna valores do server, async não retorna resultado.', 'Low-level helper; sync returns server values, async returns nothing.']],
            ['registerTunnelFunction', 'funcName: string, func: function', ['nil; registra um handler client invocável pelo server.', 'nil; registers a client handler the server can invoke.']]
        ]
    }
];

/* [chave, origem, descrição, replicação] — os três últimos em [pt, en]. */
const REPLICATED = ['Replicado', 'Replicated'];
const SERVER_ONLY = ['Não replicado (uso no server)', 'Not replicated (server use)'];
const GLOBAL = ['Global', 'Global'];

const statebags = [
    ['characterId', ['Player state · core', 'Player state · core'], ['ID numérico do personagem ativo. Publicado pelo server ao carregar personagem e ao trocar de personagem.', 'Numeric ID of the active character. Published by the server when a character loads or is switched.'], REPLICATED],
    ['identity', ['Player state · core', 'Player state · core'], ['Tabela da identidade: name, middleName, lastName, document, documentNumber, photo, age, gender e activePhoneNumber.', 'Identity table: name, middleName, lastName, document, documentNumber, photo, age, gender and activePhoneNumber.'], REPLICATED],
    ['health', ['Player state · core', 'Player state · core'], ['Vida do ped. É atualizada no client ao receber dano e lida para sincronização do jogador.', 'Ped health. Updated on the client when taking damage and read to sync the player.'], ['Replicado em gravações client e no carregamento; updateStatus também escreve sem solicitar replicação.', 'Replicated on client writes and on load; updateStatus also writes without requesting replication.']],
    ['armor', ['Player state · core', 'Player state · core'], ['Colete do ped.', 'Ped armor.'], ['Mesmo padrão de health', 'Same pattern as health']],
    ['hunger', ['Player state · core', 'Player state · core'], ['Fome numérica; a sincronização/decadência depende da configuração hungerSystem.', 'Numeric hunger; sync/decay depends on the hungerSystem config.'], REPLICATED],
    ['thirst', ['Player state · core', 'Player state · core'], ['Sede numérica; a sincronização/decadência depende da configuração thirstSystem.', 'Numeric thirst; sync/decay depends on the thirstSystem config.'], REPLICATED],
    ['stress', ['Player state · core', 'Player state · core'], ['Estresse numérico; a sincronização/decadência depende da configuração stressSystem.', 'Numeric stress; sync/decay depends on the stressSystem config.'], REPLICATED],
    ['cash', ['Player state · economia', 'Player state · economy'], ['Saldo em dinheiro do personagem.', 'Character cash balance.'], REPLICATED],
    ['bankMoney', ['Player state · economia', 'Player state · economy'], ['Saldo bancário do personagem.', 'Character bank balance.'], REPLICATED],
    ['coins', ['Player state · economia', 'Player state · economy'], ['Saldo de coins do personagem.', 'Character coin balance.'], REPLICATED],
    ['cryptos / crypto', ['Player state · economia', 'Player state · economy'], ['Tabela de saldos crypto. No carregamento inicial o núcleo publica cryptos; addCharacterMoney atualiza crypto.', 'Table of crypto balances. On the initial load the core publishes cryptos; addCharacterMoney updates crypto.'], REPLICATED],
    ['group_<nome>', ['Player state · grupos', 'Player state · groups'], ['Nível numérico da hierarquia do grupo; removido ao sair do grupo.', 'Numeric group hierarchy level; removed when leaving the group.'], REPLICATED],
    ['Str:phase', ['Player state · Str_creator / Str_style', 'Player state · Str_creator / Str_style'], ['Etapa: menu_picker, menu_creation, switching, spawning, ped_setup ou playing.', 'Stage: menu_picker, menu_creation, switching, spawning, ped_setup or playing.'], SERVER_ONLY],
    ['Str:pendingCharacter', ['Player state · Str_creator', 'Player state · Str_creator'], ['Durante troca: {characterId, isFirstSpawn, position} com posição [x, y, z, heading]. Removido ao concluir/falhar.', 'During a switch: {characterId, isFirstSpawn, position} with position [x, y, z, heading]. Removed on success/failure.'], SERVER_ONLY],
    ['Str:charId', ['Player state · Str_creator', 'Player state · Str_creator'], ['ID de personagem durante a troca; limpo enquanto a troca está pendente.', 'Character ID during a switch; cleared while the switch is pending.'], SERVER_ONLY],
    ['seatbelt', ['Player state · Str_hud', 'Player state · Str_hud'], ['Boolean indicando cinto afivelado; client atualiza ao ativar/desativar.', 'Boolean for a fastened seatbelt; the client updates it on toggle.'], REPLICATED],
    ['isTargeting', ['Player state · Str_target', 'Player state · Str_target'], ['Boolean indicando se o jogador está mirando um alvo.', 'Boolean for whether the player is aiming at a target.'], REPLICATED],
    ['targetActive', ['Player state · Str_target', 'Player state · Str_target'], ['Boolean indicando se a interface de interação está ativa.', 'Boolean for whether the interaction UI is active.'], REPLICATED],
    ['targetEntity', ['Player state · Str_target', 'Player state · Str_target'], ['Entity handle em foco; volta a 0 quando a mira fecha.', 'Focused entity handle; resets to 0 when targeting closes.'], REPLICATED],
    ['targetZone', ['Player state · Str_target', 'Player state · Str_target'], ['Identificador da zona em foco; nil quando a mira fecha.', 'Focused zone identifier; nil when targeting closes.'], REPLICATED],
    ['targetOptions', ['Entity state · Str_target', 'Entity state · Str_target'], ['Opções de interação da entidade; formato depende da API de target do módulo.', "Entity interaction options; the shape depends on the module's target API."], REPLICATED],
    ['strMobilitiesVehicleId', ['Entity state · Str_mobilities', 'Entity state · Str_mobilities'], ['ID numérico persistido do veículo.', 'Persisted numeric vehicle ID.'], REPLICATED],
    ['strMobilitiesVehicleData', ['Entity state · Str_mobilities', 'Entity state · Str_mobilities'], ['Objeto {id, netId, model, plate, tuning, engineHealth, bodyHealth, revision}.', 'Object {id, netId, model, plate, tuning, engineHealth, bodyHealth, revision}.'], REPLICATED],
    ['strMobilitiesFuel', ['Entity state · Str_mobilities', 'Entity state · Str_mobilities'], ['Objeto {netId, fuel}; fuel é limitado a 0–100 no client.', 'Object {netId, fuel}; fuel is clamped to 0–100 on the client.'], REPLICATED],
    ['Str:scripts', ['GlobalState · core', 'GlobalState · core'], ['JSON serializado com as pastas de módulos Str_ disponíveis para a NUI.', 'Serialized JSON with the Str_ module folders available to the NUI.'], GLOBAL],
    ['Str:language', ['GlobalState · core', 'GlobalState · core'], ['Código do idioma configurado para o resource.', 'Language code configured for the resource.'], GLOBAL],
    ['strMobilitiesVehicleEntities', ['GlobalState · Str_mobilities', 'GlobalState · Str_mobilities'], ['JSON serializado dos veículos gerenciados, usado para recuperar o estado após reiniciar o resource.', 'Serialized JSON of the managed vehicles, used to restore state after restarting the resource.'], GLOBAL]
];

const t = (key) => window.StrI18n.t(key);
const pick = (pair) => window.StrI18n.pick(pair);

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalize(value) {
    return String(value).toLocaleLowerCase();
}

function renderApi(targetId, sections, query) {
    const target = document.getElementById(targetId);
    let visibleCount = 0;
    const markup = sections.map((section) => {
        const title = pick(section.title);
        const note = pick(section.note);
        const functions = section.functions.filter(([name, params, returns]) => {
            const text = normalize([name, params, returns[0], returns[1], section.title.join(' '), section.note.join(' ')].join(' '));
            return text.includes(query);
        });
        if (!functions.length) return '';
        visibleCount += functions.length;
        const rows = functions.map(([name, params, returns], i) => {
            const text = pick(returns);
            const [type, ...rest] = text.split(' — ');
            return `
            <tr style="--i:${Math.min(i, 12)}">
                <td><span class="api-name">Str.functions.${escapeHtml(name)}</span><span class="api-signature">(${escapeHtml(params)})</span></td>
                <td>${escapeHtml(params)}</td>
                <td><span class="return-type">${escapeHtml(type)}</span>${rest.length ? `<br>${escapeHtml(rest.join(' — '))}` : ''}</td>
            </tr>`;
        }).join('');
        const label = functions.length === 1 ? t('api.function') : t('api.functions');
        return `
            <section class="api-category reveal">
                <div class="category-heading"><h3>${escapeHtml(title)}</h3><span>${functions.length} ${label}</span></div>
                <p class="side-note">${escapeHtml(note)}</p>
                <div class="api-table-wrap spot">
                    <table class="api-table">
                        <thead><tr><th>${t('api.colName')}</th><th>${t('api.colArgs')}</th><th>${t('api.colReturn')}</th></tr></thead>
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
    const visible = statebags.filter(([name, origin, desc, rep]) => normalize([name, ...origin, ...desc, ...rep].join(' ')).includes(query));
    list.innerHTML = visible.map(([name, origin, description, replication], i) => `
        <article class="statebag-card reveal spot" style="--i:${i % 6}">
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(pick(description))}</p>
            <span class="state-meta">${escapeHtml(pick(origin))} · ${escapeHtml(pick(replication))}</span>
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
    document.getElementById('server-count').textContent = serverCount;
    document.getElementById('client-count').textContent = clientCount;
    document.getElementById('empty-search').hidden = activeTab === 'server' ? serverCount > 0 : clientCount > 0;
    document.getElementById('statebag-list').hidden = stateCount === 0;
    document.dispatchEvent(new CustomEvent('str:rendered'));
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
        document.querySelector('.tabs').dataset.active = activeTab;
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

document.querySelector('.tabs').dataset.active = activeTab;
window.StrI18n.onChange(updateSearch);
updateSearch();
