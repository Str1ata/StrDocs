'use strict';

/* Catálogo de Str.functions e statebags, conferido com C:\STR-Base-1\resources\Str
   (Str.lua, client.lua e scripts/Str_*). Textos descritivos em [pt-BR, en-US].
   Formato do retorno: "tipo — descrição". */

const serverSections = [
    {
        title: ['Tunnel e cache', 'Tunnel and cache'],
        note: [
            'O tunnel chama handlers do outro lado pelo nome. No server, o handler roda com o global source do jogador que chamou. Handlers no server: getConfig, getGroupsConfig, getVehiclesConfig e getItemsConfig (núcleo), getInventoryConfig, getTargetConfig e getMobilitiesConfig (módulos). getConfig retorna { config = Str.config, language = Str.language }; language contém o catálogo Str e os catálogos disponíveis em scripts/Str_*/language. Nenhum handler client é registrado por padrão; chamar um nome sem handler deixa a chamada sync esperando. Str.lua:15-130.',
            'The tunnel calls handlers on the other side by name. On the server, the handler runs with the global source of the calling player. Server handlers: getConfig, getGroupsConfig, getVehiclesConfig and getItemsConfig (core), getInventoryConfig, getTargetConfig and getMobilitiesConfig (modules). getConfig returns { config = Str.config, language = Str.language }; language contains the Str catalog and available catalogs in scripts/Str_*/language. No client handler is registered by default; calling a name with no handler leaves the sync call waiting. Str.lua:15-130.'
        ],
        functions: [
            ['syncTunnelFunction', 'source: number, functionName: string, ...args', ['...any — todos os valores retornados pelo handler client. Espera a resposta; nil se o jogador não existir.', '...any — every value returned by the client handler. Waits for the reply; nil if the player does not exist.']],
            ['asyncTunnelFunction', 'source: number, functionName: string, ...args', ['nil — dispara a chamada e não espera resposta.', 'nil — fires the call without waiting for a reply.']],
            ['getTunnelFunction', 'async: boolean, source: number, functionName: string, ...args', ['...any — base das duas acima. Sync: valores do client (após 5 s passa a checar a cada 500 ms; após 10 min devolve nil). Async: nil.', '...any — base of the two above. Sync: client values (after 5 s it polls every 500 ms; after 10 min it returns nil). Async: nil.']],
            ['registerTunnelFunction', 'funcName: string, func: function', ['nil — registra um handler server que o client pode chamar.', 'nil — registers a server handler the client can call.']],
            ['updatePlayersData', 'source: number, async?: boolean', ['nil — grava no banco o cache do personagem ativo: inventories, banks, membros de groups, vehicles, closets, posição e status. Sem personagem, não faz nada.', 'nil — writes the active character cache to the database: inventories, banks, group members, vehicles, closets, position and status. Does nothing without a character.']]
        ]
    },
    {
        title: ['Veículos (configuração)', 'Vehicles (configuration)'],
        note: [
            'Lê Str.vehicles, que é configuration/vehicles.json[gameName] (fivem ou redm). vehicleModelOrHash aceita o nome do modelo (string) ou o hash (number); os hashes são calculados com GetHashKey só para os modelos configurados. Str.lua:1220-1355.',
            'Reads Str.vehicles, which is configuration/vehicles.json[gameName] (fivem or redm). vehicleModelOrHash takes the model name (string) or the hash (number); hashes are computed with GetHashKey only for configured models. Str.lua:1220-1355.'
        ],
        functions: [
            ['getVehicleHash', 'vehicleModel: string', ['number | nil — hash do modelo configurado.', 'number | nil — hash of the configured model.']],
            ['getVehicleModel', 'vehicleHash: number', ['string | nil — nome do modelo configurado.', 'string | nil — name of the configured model.']],
            ['getVehicleConfig', 'vehicleModelOrHash: string | number', ['table | nil — bloco inteiro do veículo em Str.vehicles.', 'table | nil — the whole vehicle block in Str.vehicles.']],
            ['getVehicleName', 'vehicleModelOrHash: string | number', ['string | nil — exhibitionName.', 'string | nil — exhibitionName.']],
            ['getVehicleTrunkCapacity', 'vehicleModelOrHash: string | number', ['number | nil — weight.trunk. Gera erro se o veículo existir sem o bloco weight.', 'number | nil — weight.trunk. Errors if the vehicle exists without a weight block.']],
            ['getVehicleGloveBoxCapacity', 'vehicleModelOrHash: string | number', ['number | nil — weight.gloveBox. Mesmo cuidado com o bloco weight.', 'number | nil — weight.gloveBox. Same caveat about the weight block.']],
            ['getVehicleEngineSpecs', 'vehicleModelOrHash: string | number', ['table | nil — {engineLabel, engineType, horsePower}.', 'table | nil — {engineLabel, engineType, horsePower}.']],
            ['getVehicleFuelCapacity', 'vehicleModelOrHash: string | number', ['number | nil — fuel.fuelCapacity.', 'number | nil — fuel.fuelCapacity.']],
            ['getVehicleFuelType', 'vehicleModelOrHash: string | number', ['string | nil — fuel.fuelType.', 'string | nil — fuel.fuelType.']],
            ['getVehicleBuyMoneyPrice', 'vehicleModelOrHash: string | number', ['number | nil — prices.price.buy.', 'number | nil — prices.price.buy.']],
            ['getVehicleBuyCoinPrice', 'vehicleModelOrHash: string | number', ['number | nil — prices.coin.buy.', 'number | nil — prices.coin.buy.']],
            ['getVehicleRentalMoneyPrice', 'vehicleModelOrHash: string | number', ['number | nil — prices.price.rent.', 'number | nil — prices.price.rent.']],
            ['getVehicleRentalCoinPrice', 'vehicleModelOrHash: string | number', ['number | nil — prices.coin.rent.', 'number | nil — prices.coin.rent.']],
            ['getVehicleRentalTimeDays', 'vehicleModelOrHash: string | number', ['number | nil — rentalTimeDays.', 'number | nil — rentalTimeDays.']],
            ['getVehicleCategory', 'vehicleModelOrHash: string | number', ['string | nil — vehicleCategory.', 'string | nil — vehicleCategory.']],
            ['getVehicleType', 'vehicleModelOrHash: string | number', ['string | nil — vehicleType.', 'string | nil — vehicleType.']],
            ['getVehicleClass', 'vehicleModelOrHash: string | number', ['string | nil — vehicleClass.', 'string | nil — vehicleClass.']]
        ]
    },
    {
        title: ['Itens (configuração)', 'Items (configuration)'],
        note: [
            'item é a chave em Str.items (configuration/items.json); se não for string, as funções retornam nil. Ingredientes de fabricate e repair são normalizados para {name, quantity, chanceNeeded}, com chanceNeeded 100 quando ausente. Str.lua:1357-1506.',
            'item is the key in Str.items (configuration/items.json); if it is not a string, the functions return nil. fabricate and repair ingredients are normalized to {name, quantity, chanceNeeded}, with chanceNeeded 100 when missing. Str.lua:1357-1506.'
        ],
        functions: [
            ['getItemConfig', 'item: string', ['table | nil — bloco inteiro do item.', 'table | nil — the whole item block.']],
            ['getItemLabel', 'item: string', ['string | nil — label.', 'string | nil — label.']],
            ['getItemDescription', 'item: string', ['string | nil — description.', 'string | nil — description.']],
            ['getItemWeight', 'item: string', ['number | nil — weight (peso unitário).', 'number | nil — weight (per unit).']],
            ['getItemCapacity', 'item: string', ['number | nil — capacity.', 'number | nil — capacity.']],
            ['getItemType', 'item: string', ['string | nil — type (use, weapon, bullet, clothing...).', 'string | nil — type (use, weapon, bullet, clothing...).']],
            ['getItemFabrication', 'item: string', ['table | nil — bloco fabricate {enabled, items}.', 'table | nil — fabricate block {enabled, items}.']],
            ['isItemFabricationEnabled', 'item: string', ['boolean — true só quando fabricate.enabled == true.', 'boolean — true only when fabricate.enabled == true.']],
            ['getItemFabricationItems', 'item: string', ['array | nil — ingredientes de fabricate normalizados.', 'array | nil — normalized fabricate ingredients.']],
            ['getItemRepair', 'item: string', ['table | nil — bloco repair {items, groups}.', 'table | nil — repair block {items, groups}.']],
            ['getItemRepairItems', 'item: string', ['array | nil — ingredientes de repair normalizados.', 'array | nil — normalized repair ingredients.']],
            ['getItemRepairGroups', 'item: string', ['table | nil — repair.groups, no formato { [grupo] = nível mínimo }.', 'table | nil — repair.groups, shaped { [group] = minimum level }.']],
            ['isItemRepairable', 'item: string', ['boolean — true se houver ao menos um ingrediente de repair.', 'boolean — true if there is at least one repair ingredient.']],
            ['isItemRecyclable', 'item: string', ['boolean — true só quando recyclable == true.', 'boolean — true only when recyclable == true.']],
            ['getItemDefaultMetadata', 'item: string', ['table | nil — defaultMetadata.', 'table | nil — defaultMetadata.']],
            ['getItemDurability', 'item: string', ['table | nil — bloco durability {enabled, minutes, life}.', 'table | nil — durability block {enabled, minutes, life}.']],
            ['isItemDurabilityEnabled', 'item: string', ['boolean — true só quando durability.enabled == true.', 'boolean — true only when durability.enabled == true.']],
            ['getItemDurabilityMinutes', 'item: string', ['number | nil — durability.minutes (-1 = sem prazo).', 'number | nil — durability.minutes (-1 = no expiry).']],
            ['getItemDurabilityLife', 'item: string', ['number | nil — durability.life.', 'number | nil — durability.life.']],
            ['getItemWeaponConfig', 'item: string', ['table | nil — bloco weapon {isWeapon, weaponModel, ammoItem}.', 'table | nil — weapon block {isWeapon, weaponModel, ammoItem}.']],
            ['isItemWeapon', 'item: string', ['boolean — true só quando weapon.isWeapon == true.', 'boolean — true only when weapon.isWeapon == true.']],
            ['getItemWeaponModel', 'item: string', ['string | nil — weapon.weaponModel (pode ser "" em itens que não são arma).', 'string | nil — weapon.weaponModel (may be "" on non-weapon items).']],
            ['getItemAmmoItem', 'item: string', ['string | nil — weapon.ammoItem (pode ser "").', 'string | nil — weapon.ammoItem (may be "").']]
        ]
    },
    {
        title: ['Jogadores e contas', 'Players and accounts'],
        note: [
            'source é o ID de sessão; userId é a conta (users.user_id); characterId é o personagem ativo. As funções de jogador leem só o cache de quem está online. Identificadores ficam sem prefixo, com as chaves steam, license, license2, clientIp, discord, fivemId e hdwids. Str.lua:1508-1620.',
            'source is the session ID; userId is the account (users.user_id); characterId is the active character. Player functions only read the cache of online players. Identifiers are stored without prefix, under the keys steam, license, license2, clientIp, discord, fivemId and hdwids. Str.lua:1508-1620.'
        ],
        functions: [
            ['getPlayers', '—', ['array — {source, userId, characterId, identifiers} de cada jogador no cache.', 'array — {source, userId, characterId, identifiers} for each player in the cache.']],
            ['getUserIdByIdentifiers', 'identifiers: table', ['number | nil — user_id da primeira conta no banco com steam, license, license2, discord ou fivemId iguais.', 'number | nil — user_id of the first account in the database matching steam, license, license2, discord or fivemId.']],
            ['getUserId', 'source: number', ['number | nil — conta conectada nesse source (mesmo sem personagem).', 'number | nil — account connected on that source (even without a character).']],
            ['getUserSource', 'userId: number', ['number | nil — source da conta, se estiver online.', 'number | nil — source of the account, if online.']],
            ['activeCharacter', 'source: number, characterId: number | nil', ['boolean — define o personagem ativo no cache e o statebag characterId; false se o jogador não estiver no cache.', 'boolean — sets the active character in the cache and the characterId statebag; false if the player is not in the cache.']],
            ['getCharacterId', 'source: number', ['number | nil — personagem ativo do source.', 'number | nil — active character of the source.']],
            ['getUserIdByCharacterId', 'characterId: number', ['number | nil — conta do personagem online. Compara com ==, então passe number.', 'number | nil — account of the online character. Compares with ==, so pass a number.']],
            ['getUserSourceByCharacterId', 'characterId: number | string', ['number | nil — source do personagem online. Compara com tostring, então aceita number ou string.', 'number | nil — source of the online character. Compares with tostring, so number or string both work.']],
            ['getPlayerData', 'userId: number', ['table | nil — cache inteiro: {userId, characterId, identity, groups, inventory, economy, vehicles, clothes, position, status}.', 'table | nil — the whole cache: {userId, characterId, identity, groups, inventory, economy, vehicles, clothes, position, status}.']],
            ['getPlayerIdentifiers', 'userId: number', ['table | nil — identificadores da conta online.', 'table | nil — identifiers of the online account.']],
            ['getPlayerHdwids', 'userId: number', ['array | nil — tokens de hardware (GetPlayerTokens) da conta online.', 'array | nil — hardware tokens (GetPlayerTokens) of the online account.']],
            ['getWhitelistStatus', 'userId: number', ['boolean — users.whitelist no banco.', 'boolean — users.whitelist in the database.']],
            ['setWhitelistStatus', 'userId: number, status: boolean', ['nil — grava users.whitelist.', 'nil — writes users.whitelist.']],
            ['getBanStatus', 'userId: number', ['table | nil — {banned, reason, expiresAt}, lido de users.', 'table | nil — {banned, reason, expiresAt}, read from users.']],
            ['setBanStatus', 'userId: number, status: boolean, reason?: string, expiresAt?: table', ['nil — ao banir, grava o motivo e expulsa a conta se estiver online. expiresAt é uma tabela de data aceita por os.time. Ao desbanir, limpa motivo e prazo.', 'nil — when banning, stores the reason and drops the account if online. expiresAt is a date table accepted by os.time. When unbanning, clears reason and expiry.']]
        ]
    },
    {
        title: ['Identidade e aparência', 'Identity and appearance'],
        note: [
            'Tudo no cache do personagem online. A aparência fica em clothes = {faceData, clothesData}. Atenção: getCharacterFace lê faceData.selections, mas setCharacterFace substitui faceData inteiro, então passe {selections = ...}. As funções set* devolvem true mesmo com o personagem offline. Str.lua:1741-1762, 2203-2281.',
            'Everything lives in the online character cache. Appearance is stored in clothes = {faceData, clothesData}. Note: getCharacterFace reads faceData.selections, but setCharacterFace replaces the whole faceData, so pass {selections = ...}. The set* functions return true even when the character is offline. Str.lua:1741-1762, 2203-2281.'
        ],
        functions: [
            ['getCharacterIdentities', 'characterId: number', ['table | nil — identidade {name, middleName, lastName, document, documentNumber, photo, age, gender, activePhoneNumber}.', 'table | nil — identity {name, middleName, lastName, document, documentNumber, photo, age, gender, activePhoneNumber}.']],
            ['updateIdentities', 'characterId: number, identity: string, data: any', ['nil — troca um campo da identidade, só se o campo já existir.', 'nil — replaces one identity field, only if the field already exists.']],
            ['getCharacterClothes', 'characterId: number', ['table | nil — clothes.clothesData.selections.', 'table | nil — clothes.clothesData.selections.']],
            ['setCharacterClothes', 'characterId: number, clothes: table', ['boolean — grava clothes.clothesData.selections.', 'boolean — writes clothes.clothesData.selections.']],
            ['getCharacterFace', 'characterId: number', ['table | nil — clothes.faceData.selections.', 'table | nil — clothes.faceData.selections.']],
            ['setCharacterFace', 'characterId: number, face: table', ['boolean — substitui clothes.faceData pelo valor passado.', 'boolean — replaces clothes.faceData with the given value.']],
            ['getCharacterOutfits', 'characterId: number', ['table | nil — clothes.clothesData.outfits.', 'table | nil — clothes.clothesData.outfits.']],
            ['setCharacterOutfit', 'characterId: number, outfitData: table', ['boolean — troca o outfit com o mesmo name; se não houver, grava em outfits[outfitData.name].', 'boolean — replaces the outfit with the same name; otherwise stores it at outfits[outfitData.name].']]
        ]
    },
    {
        title: ['Posição, status e grupos', 'Position, status and groups'],
        note: [
            'Hierarquias vêm de Str.groups[grupo].hierarchies (configuration/groups.json), uma lista em que o nível 1 é o cargo mais alto. Ex.: Staff = Owner, Manager, Admin, Moderator, Support. Grupos inexistentes em Str.groups geram erro em addCharacterGroup e getCharacterGroupHierarchy. Str.lua:1675-1865.',
            'Hierarchies come from Str.groups[group].hierarchies (configuration/groups.json), a list where level 1 is the highest rank. E.g.: Staff = Owner, Manager, Admin, Moderator, Support. Groups missing from Str.groups raise an error in addCharacterGroup and getCharacterGroupHierarchy. Str.lua:1675-1865.'
        ],
        functions: [
            ['updatePositions', 'characterId: number', ['boolean — copia GetEntityCoords do ped para o cache.', 'boolean — copies the ped GetEntityCoords into the cache.']],
            ['getPosition', 'characterId: number', ['vector3 | table | nil — posição em cache (a do login vem do banco; depois de updatePositions é um vector3).', 'vector3 | table | nil — cached position (the login one comes from the database; after updatePositions it is a vector3).']],
            ['updateStatus', 'characterId: number, syncAll?: boolean, health?: number, armor?: number, hunger?: number, thirst?: number, stress?: number', ['boolean — atualiza o status no cache. Com syncAll (ou health/armor), lê vida e colete do ped e grava nos statebags sem replicar. Valores omitidos vêm dos statebags.', 'boolean — updates the status in the cache. With syncAll (or health/armor), reads ped health and armor and writes them to the statebags without replication. Omitted values come from the statebags.']],
            ['getStatus', 'characterId: number', ['table | nil — {health, armor, hunger, thirst, stress}. Chama updateStatus(characterId, true) antes.', 'table | nil — {health, armor, hunger, thirst, stress}. Calls updateStatus(characterId, true) first.']],
            ['addCharacterGroup', 'characterId: number, group: string, hierarchy?: number | string', ['boolean — grava o nível no cache e no statebag group_<grupo>. hierarchy number = nível; string = nome do cargo; omitido = último nível (cargo mais baixo).', 'boolean — stores the level in the cache and in the group_<group> statebag. hierarchy number = level; string = rank name; omitted = last level (lowest rank).']],
            ['removeCharacterGroup', 'characterId: number, group: string', ['boolean — remove o grupo do cache e limpa o statebag group_<grupo>.', 'boolean — removes the group from the cache and clears the group_<group> statebag.']],
            ['getCharacterGroups', 'characterId: number', ['table | nil — mapa { [grupo] = nível }.', 'table | nil — map { [group] = level }.']],
            ['getCharacterGroupHierarchy', 'characterId: number, group: string', ['number | nil, string | nil — nível e nome do cargo; nil, nil se o personagem não estiver no grupo.', 'number | nil, string | nil — level and rank name; nil, nil if the character is not in the group.']],
            ['hasCharacterGroup', 'characterId: number, group: string', ['number | nil | false — nível do grupo; nil se online sem o grupo; false se offline ou sem argumentos.', 'number | nil | false — group level; nil if online without the group; false if offline or missing arguments.']],
            ['getUsersByGroup', 'group: string, onlineOnly?: boolean', ['array — {source, userId, characterId, hierarchyLevel} dos jogadores online no grupo. onlineOnly hoje é ignorado.', 'array — {source, userId, characterId, hierarchyLevel} of online players in the group. onlineOnly is currently ignored.']]
        ]
    },
    {
        title: ['Inventário (cache do núcleo)', 'Inventory (core cache)'],
        note: [
            'No cache do núcleo o inventário é uma lista de {name, amount, metadata?}. Itens só se juntam quando a metadata é igual (comparada via json.encode) ou ambos não têm metadata. O Str_inventory usa outro formato canônico, {items = {[slot] = {id, qty, metadata}}}; prefira as funções dele quando o módulo estiver ativo. Str.lua:1867-2057.',
            'In the core cache the inventory is a list of {name, amount, metadata?}. Items only stack when the metadata is equal (compared via json.encode) or both have none. Str_inventory uses another canonical format, {items = {[slot] = {id, qty, metadata}}}; prefer its functions when the module is active. Str.lua:1867-2057.'
        ],
        functions: [
            ['getCharacterInventory', 'characterId: number', ['table — inventário em cache; {} se offline.', 'table — cached inventory; {} if offline.']],
            ['addItemToCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', ['boolean | nil — true ao adicionar ou somar; false se o slot estiver ocupado por outro item; nil com argumentos inválidos ou offline. Não confere se o item existe em Str.items.', 'boolean | nil — true when added or stacked; false if the slot holds another item; nil with invalid arguments or offline. Does not check that the item exists in Str.items.']],
            ['removeItemFromCharacterInventory', 'characterId: number, item: string, quantity: number, slot?: number, metadata?: table', ['boolean | nil — true ao remover; nil se não achar. Não confere se há quantidade suficiente: remove a entrada quando chega a 0 ou menos.', 'boolean | nil — true when removed; nil if not found. Does not check there is enough: removes the entry when it reaches 0 or less.']],
            ['getItemFromCharacterInventory', 'characterId: number, item: string, slot?: number, metadata?: table', ['table | nil — {name, amount, metadata}. Sem metadata, só encontra itens que também não têm metadata.', 'table | nil — {name, amount, metadata}. Without metadata, it only finds items that have no metadata either.']],
            ['getCharacterInventorySlots', 'characterId: number', ['table — {amount, inUse, available}; amount é o número de entradas (#inventory), não o limite de slots.', 'table — {amount, inUse, available}; amount is the entry count (#inventory), not a slot limit.']],
            ['getCharacterInventoryWeight', 'characterId: number', ['table — {total, used, available}. Com personagem online hoje gera erro: chama exports["Str"]:getInventoryDefaultWeight(), que não existe em nenhum módulo. Offline devolve {total = 0, used = 0, available = 0}.', 'table — {total, used, available}. With an online character it currently errors: it calls exports["Str"]:getInventoryDefaultWeight(), which no module defines. Offline it returns {total = 0, used = 0, available = 0}.']]
        ]
    },
    {
        title: ['Economia', 'Economy'],
        note: [
            'Economia em cache: {cash, bankMoney, coins, crypto = { [moeda] = valor }}. moneyType é cash, bankMoney, coins ou crypto; com crypto, informe criptoName (sem ele, addCharacterMoney gera erro). O dinheiro só vai ao banco em updatePlayersData. Str.lua:2059-2119.',
            'Cached economy: {cash, bankMoney, coins, crypto = { [coin] = value }}. moneyType is cash, bankMoney, coins or crypto; with crypto, pass criptoName (without it, addCharacterMoney errors). Money only reaches the database in updatePlayersData. Str.lua:2059-2119.'
        ],
        functions: [
            ['getCharacterEconomyData', 'characterId: number', ['table | nil — {cash, bankMoney, coins, crypto}.', 'table | nil — {cash, bankMoney, coins, crypto}.']],
            ['setCharacterEconomyData', 'characterId: number, economyData: table', ['boolean — substitui a economia em cache; false se offline.', 'boolean — replaces the cached economy; false if offline.']],
            ['addCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', ['boolean — soma ao saldo e atualiza o statebag (moneyType, ou crypto). Retorna true sempre que os argumentos existem, mesmo offline (aí nada é salvo).', 'boolean — adds to the balance and updates the statebag (moneyType, or crypto). Returns true whenever the arguments are present, even offline (then nothing is stored).']],
            ['removeCharacterMoney', 'characterId: number, amount: number, moneyType: string, criptoName?: string', ['boolean — addCharacterMoney com -amount. Não confere saldo e pode deixar negativo.', 'boolean — addCharacterMoney with -amount. Does not check the balance and can go negative.']],
            ['getCharacterMoneyAmount', 'characterId: number, moneyType: string, criptoName?: string', ['number — saldo do tipo ou da moeda; 0 se não houver.', 'number — balance for the type or coin; 0 if there is none.']]
        ]
    },
    {
        title: ['Veículos do personagem', 'Character vehicles'],
        note: [
            'Os veículos carregados do banco ficam indexados por vehicle_id, com {model, lastGarage, lastLocation, state, tuning, fuelLevel, taxesDueAt, odometer, damages, rentalExpiresAt, inventory, arrested, dismantled}. addCharacterVehicle, getCharacterVehicle e removeCharacterVehicle usam o nome do modelo como chave, então não encontram os veículos vindos do banco. Str.lua:622-647, 2121-2201.',
            'Vehicles loaded from the database are keyed by vehicle_id, with {model, lastGarage, lastLocation, state, tuning, fuelLevel, taxesDueAt, odometer, damages, rentalExpiresAt, inventory, arrested, dismantled}. addCharacterVehicle, getCharacterVehicle and removeCharacterVehicle key by model name, so they do not find vehicles loaded from the database. Str.lua:622-647, 2121-2201.'
        ],
        functions: [
            ['getCharacterVehicleData', 'characterId: number', ['table — mapa de veículos em cache; {} se offline.', 'table — cached vehicle map; {} if offline.']],
            ['setCharacterVehicleData', 'characterId: number, vehicleData: table', ['nil — substitui o mapa de veículos em cache.', 'nil — replaces the cached vehicle map.']],
            ['addCharacterVehicle', 'characterId: number, vehicleName: string, data?: table', ['boolean — false se o modelo não existir em Str.vehicles. Sem data, usa um registro padrão (fuelLevel 100, damages zerados, tunings {}). Retorna true mesmo offline.', 'boolean — false if the model is not in Str.vehicles. Without data, uses a default record (fuelLevel 100, zeroed damages, tunings {}). Returns true even offline.']],
            ['removeCharacterVehicle', 'characterId: number, vehicleName: string', ['boolean — true se existia vehicles[vehicleName] e foi removido.', 'boolean — true if vehicles[vehicleName] existed and was removed.']],
            ['getCharacterVehicles', 'characterId: number', ['table — o mesmo que getCharacterVehicleData.', 'table — same as getCharacterVehicleData.']],
            ['getCharacterVehicle', 'characterId: number, vehicleName: string', ['table | nil — vehicles[vehicleName].', 'table | nil — vehicles[vehicleName].']]
        ]
    },
    {
        title: ['Adicionadas por módulos', 'Added by modules'],
        note: [
            'Funções que os módulos penduram em Str.functions ao carregar. Como os módulos carregam depois do núcleo, teste se existem antes de chamar. Str_style/server.lua:55-71, Str_inventory/server.lua:1051-1153.',
            'Functions that modules attach to Str.functions when they load. Since modules load after the core, check that they exist before calling. Str_style/server.lua:55-71, Str_inventory/server.lua:1051-1153.'
        ],
        functions: [
            ['getStyleInventoryClothingItems', 'framework: string', ['table — Str_style: mapa { [categoria] = {itemId, label, icon} } de script_config.inventoryItems[framework] (fivem ou redm).', 'table — Str_style: map { [category] = {itemId, label, icon} } from script_config.inventoryItems[framework] (fivem or redm).']],
            ['applyStyleClothingPurchase', 'playerSource: number, changes: table', ['boolean, string? — Str_inventory: guarda as roupas compradas no inventário e equipa. Em falha retorna false e a mensagem do motivo.', 'boolean, string? — Str_inventory: stores the purchased clothes in the inventory and equips them. On failure returns false and the reason message.']]
        ]
    }
];

const clientSections = [
    {
        title: ['Tunnel client', 'Client tunnel'],
        note: [
            'No client, o primeiro argumento é o nome da função (sem source). Ao iniciar, getConfig retorna {config, language}; o client atribui esses valores a Str.config e Str.language e carrega Str.groups, Str.vehicles e Str.items pelos handlers correspondentes. FrameworkIsReady fica true depois que os dados e exports do framework estão prontos e o resource inicia. client.lua:15-90.',
            'On the client, the first argument is the function name (no source). At startup, getConfig returns {config, language}; the client assigns those values to Str.config and Str.language and loads Str.groups, Str.vehicles and Str.items through their respective handlers. FrameworkIsReady becomes true after framework data and exports are ready and the resource starts. client.lua:15-90.'
        ],
        functions: [
            ['syncTunnelFunction', 'functionName: string, ...args', ['...any — todos os valores retornados pelo handler server; espera a resposta.', '...any — every value returned by the server handler; waits for the reply.']],
            ['asyncTunnelFunction', 'functionName: string, ...args', ['nil — dispara a chamada e não espera resposta.', 'nil — fires the call without waiting for a reply.']],
            ['getTunnelFunction', 'async: boolean, functionName: string, ...args', ['...any — base das duas acima; sync devolve os valores do server, async não devolve nada.', '...any — base of the two above; sync returns the server values, async returns nothing.']],
            ['registerTunnelFunction', 'funcName: string, func: function', ['nil — registra um handler client que o server pode chamar.', 'nil — registers a client handler the server can call.']]
        ]
    }
];

/* [chave, origem, descrição, replicação] — os três últimos em [pt, en]. */
const REPLICATED = ['Replicado', 'Replicated'];
const NOT_REPLICATED = ['Não replicado (só server)', 'Not replicated (server only)'];
const GLOBAL = ['GlobalState', 'GlobalState'];

const statebags = [
    ['characterId', ['Player · núcleo', 'Player · core'], ['ID do personagem ativo. Gravado ao carregar o personagem e em activeCharacter.', 'Active character ID. Written when the character loads and in activeCharacter.'], REPLICATED],
    ['identity', ['Player · núcleo', 'Player · core'], ['Tabela de identidade do personagem, gravada ao carregar.', 'Character identity table, written on load.'], REPLICATED],
    ['health', ['Player · núcleo', 'Player · core'], ['Vida do ped. O client grava ao levar dano; updateStatus/getStatus gravam a partir do ped.', 'Ped health. The client writes it when taking damage; updateStatus/getStatus write it from the ped.'], ['Replicado no load e no client; updateStatus grava sem replicar', 'Replicated on load and from the client; updateStatus writes without replication']],
    ['armor', ['Player · núcleo', 'Player · core'], ['Colete do ped, mesmo fluxo de health.', 'Ped armor, same flow as health.'], ['Mesmo padrão de health', 'Same pattern as health']],
    ['hunger', ['Player · núcleo', 'Player · core'], ['Fome. O client reduz decayAmountPerSecond por segundo quando hungerSystem.enable está ligado.', 'Hunger. The client lowers it by decayAmountPerSecond each second when hungerSystem.enable is on.'], REPLICATED],
    ['thirst', ['Player · núcleo', 'Player · core'], ['Sede, mesmo fluxo de hunger (thirstSystem).', 'Thirst, same flow as hunger (thirstSystem).'], REPLICATED],
    ['stress', ['Player · núcleo', 'Player · core'], ['Estresse, mesmo fluxo de hunger (stressSystem).', 'Stress, same flow as hunger (stressSystem).'], REPLICATED],
    ['cash', ['Player · economia', 'Player · economy'], ['Dinheiro em mãos. Gravado no load e por addCharacterMoney/removeCharacterMoney (o Str_mobilities também grava).', 'Cash on hand. Written on load and by addCharacterMoney/removeCharacterMoney (Str_mobilities writes it too).'], REPLICATED],
    ['bankMoney', ['Player · economia', 'Player · economy'], ['Saldo bancário, mesmo fluxo de cash.', 'Bank balance, same flow as cash.'], REPLICATED],
    ['coins', ['Player · economia', 'Player · economy'], ['Saldo de coins, mesmo fluxo de cash.', 'Coin balance, same flow as cash.'], REPLICATED],
    ['cryptos', ['Player · economia', 'Player · economy'], ['Tabela de cryptos gravada no load. Atenção: addCharacterMoney grava em crypto, não em cryptos.', 'Crypto table written on load. Note: addCharacterMoney writes to crypto, not cryptos.'], REPLICATED],
    ['crypto', ['Player · economia', 'Player · economy'], ['Tabela de cryptos gravada por addCharacterMoney com moneyType crypto.', 'Crypto table written by addCharacterMoney with moneyType crypto.'], REPLICATED],
    ['group_<grupo>', ['Player · grupos', 'Player · groups'], ['Nível do personagem no grupo (1 = mais alto). Gravado no load e por addCharacterGroup; removeCharacterGroup define nil.', 'Character level in the group (1 = highest). Written on load and by addCharacterGroup; removeCharacterGroup sets nil.'], REPLICATED],
    ['Str:phase', ['Player · Str_creator / Str_style', 'Player · Str_creator / Str_style'], ['Etapa do fluxo: menu_picker, menu_creation, switching, spawning, ped_setup ou playing.', 'Flow stage: menu_picker, menu_creation, switching, spawning, ped_setup or playing.'], NOT_REPLICATED],
    ['Str:pendingCharacter', ['Player · Str_creator', 'Player · Str_creator'], ['Durante a troca: {characterId, isFirstSpawn, position}. Limpo ao concluir ou falhar.', 'During a switch: {characterId, isFirstSpawn, position}. Cleared on success or failure.'], NOT_REPLICATED],
    ['Str:charId', ['Player · Str_creator', 'Player · Str_creator'], ['ID do personagem escolhido; limpo enquanto a troca está pendente.', 'Chosen character ID; cleared while the switch is pending.'], NOT_REPLICATED],
    ['seatbelt', ['Player · Str_hud', 'Player · Str_hud'], ['Boolean do cinto, gravado pelo client ao ligar/desligar.', 'Seatbelt boolean, written by the client on toggle.'], REPLICATED],
    ['isTargeting', ['Player · Str_target', 'Player · Str_target'], ['Boolean: o jogador está mirando um alvo.', 'Boolean: the player is aiming at a target.'], REPLICATED],
    ['targetActive', ['Player · Str_target', 'Player · Str_target'], ['Boolean: a interface de interação está aberta.', 'Boolean: the interaction UI is open.'], REPLICATED],
    ['targetEntity', ['Player · Str_target', 'Player · Str_target'], ['Entity em foco; volta a 0 ao fechar.', 'Focused entity; resets to 0 on close.'], REPLICATED],
    ['targetZone', ['Player · Str_target', 'Player · Str_target'], ['Zona em foco; nil ao fechar.', 'Focused zone; nil on close.'], REPLICATED],
    ['targetOptions', ['Entity · Str_target', 'Entity · Str_target'], ['Opções de interação da entidade, gravadas pelo server.', 'Entity interaction options, written by the server.'], REPLICATED],
    ['strMobilitiesVehicleId', ['Entity · Str_mobilities', 'Entity · Str_mobilities'], ['ID persistido do veículo.', 'Persisted vehicle ID.'], REPLICATED],
    ['strMobilitiesVehicleData', ['Entity · Str_mobilities', 'Entity · Str_mobilities'], ['{id, netId, model, plate, tuning, engineHealth, bodyHealth, revision}.', '{id, netId, model, plate, tuning, engineHealth, bodyHealth, revision}.'], REPLICATED],
    ['strMobilitiesFuel', ['Entity · Str_mobilities', 'Entity · Str_mobilities'], ['{netId, fuel}; gravado pelo server ao spawnar e pelo client ao consumir.', '{netId, fuel}; written by the server on spawn and by the client while consuming.'], REPLICATED],
    ['FrameworkIsReady', ['Player · núcleo', 'Player · core'], ['Booleano replicado no statebag do jogador local. Fica true quando dados, exports e resource do framework estão prontos; módulos client aguardam esse estado antes de iniciar.', 'Boolean replicated in the local player statebag. Becomes true when framework data, exports and resource are ready; client modules wait for this state before starting.'], REPLICATED],
    ['Str:scripts', ['GlobalState · núcleo', 'GlobalState · core'], ['JSON com as pastas Str_* de scripts/, usado pela NUI para carregar os módulos.', 'JSON with the Str_* folders in scripts/, used by the NUI to load the modules.'], GLOBAL],
    ['Str:language', ['GlobalState · núcleo', 'GlobalState · core'], ['Idioma de Str.config.language.', 'Language from Str.config.language.'], GLOBAL],
    ['strMobilitiesVehicleEntities', ['GlobalState · Str_mobilities', 'GlobalState · Str_mobilities'], ['JSON dos veículos spawnados, para recuperar o estado após reiniciar.', 'JSON of the spawned vehicles, to recover state after a restart.'], GLOBAL]
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

/* Na primeira renderização os blocos entram com a animação de rolagem;
   nas seguintes (busca, troca de aba ou idioma) aparecem na hora. */
let firstRender = true;

function enterClass() {
    return firstRender ? 'reveal' : 'quick-in';
}

function renderApi(targetId, sections, query) {
    const target = document.getElementById(targetId);
    let visibleCount = 0;
    const markup = sections.map((section) => {
        const functions = section.functions.filter(([name, params, returns]) => {
            const text = normalize([name, params, returns[0], returns[1], section.title.join(' ')].join(' '));
            return text.includes(query);
        });
        if (!functions.length) return '';
        visibleCount += functions.length;
        const rows = functions.map(([name, params, returns], i) => {
            const [type, ...rest] = pick(returns).split(' — ');
            return `
            <tr style="--i:${Math.min(i, 12)}">
                <td><span class="api-name">Str.functions.${escapeHtml(name)}</span><span class="api-signature">(${escapeHtml(params)})</span></td>
                <td>${escapeHtml(params)}</td>
                <td><span class="return-type">${escapeHtml(type)}</span>${rest.length ? `<br>${escapeHtml(rest.join(' — '))}` : ''}</td>
            </tr>`;
        }).join('');
        const label = functions.length === 1 ? t('api.function') : t('api.functions');
        return `
            <section class="api-category ${enterClass()}">
                <div class="category-heading"><h3>${escapeHtml(pick(section.title))}</h3><span>${functions.length} ${label}</span></div>
                <p class="side-note">${escapeHtml(pick(section.note))}</p>
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
        <article class="statebag-card ${enterClass()} spot" style="--i:${i % 6}">
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(pick(description))}</p>
            <span class="state-meta">${escapeHtml(pick(origin))} · ${escapeHtml(pick(replication))}</span>
        </article>`).join('');
    return visible.length;
}

const tabs = Array.from(document.querySelectorAll('.tab'));
const searchInput = document.getElementById('api-search');
let activeTab = 'server';

function updateSearch() {
    const query = normalize(searchInput.value.trim());
    const serverCount = renderApi('server-api', serverSections, query);
    const clientCount = renderApi('client-api', clientSections, query);
    const stateCount = renderStatebags(query);
    document.getElementById('server-count').textContent = serverCount;
    document.getElementById('client-count').textContent = clientCount;
    document.getElementById('empty-search').hidden = activeTab === 'server' ? serverCount > 0 : clientCount > 0;
    document.getElementById('statebag-list').hidden = stateCount === 0;
    firstRender = false;
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

/* Busca com debounce: evita refazer as tabelas a cada tecla. */
let searchTimer = 0;
searchInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(updateSearch, 140);
});
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && searchInput.value) {
        searchInput.value = '';
        updateSearch();
    }
});

document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
});

document.querySelector('.tabs').dataset.active = activeTab;
window.StrI18n.onChange(updateSearch);
updateSearch();
