import { state } from './state.js';
import { GAME_STATE, POWER_UP_TYPES, PLAYER_DEFAULTS } from './constants.js';
import { saveShopItems, savePlayerCoins } from './persistence.js';
import { createPlatform } from './world.js';
import { switchGameState } from './game.js';

export const uiRefs = { /* ... same as before ... */ };

let statusTimeout;

export function cacheDOMElements() {
    // This function is now more important as it populates the uiRefs object
    // used by many other functions.
    const ids = [
        'mainMenuPanel', 'difficultyPanel', 'settingsPanel', 'levelEditorPanel',
        'shopPanel', 'infoPanel', 'levelInfo', 'coinInfo', 'crosshair',
        'powerUpInfo', 'slowMoInfo', 'inventoryBar', 'victoryScreen', 'saveSlotsPanel',
        'worldSeed', 'maxDistance', 'statusMessage', 'levelCounter', 'coinCounter',
        'shopCoinCounter', 'shopItemsContainer', 'saveSlotsContainer', 'graphicsQuality',
        'soundVolume', 'volumeValue', 'experimentalFeaturesToggle', 'experimentalOptions',
        'dayNightToggle', 'editorSeedInput', 'platformSpread', 'spreadValue',
        'platformHeightVariation', 'heightVarValue', 'platformForwardGap', 'forwardGapValue',
        'platformSizeMin', 'sizeMinValue', 'platformSizeMax', 'sizeMaxValue',
        'checkpointFrequency', 'checkpointFreqValue', 'collectibleFrequency', 'collectibleFreqValue',
        'playButton', 'levelEditorButton', 'shopButtonMainMenu', 'settingsButtonMainMenu',
        'loadGameButton', 'saveSlotsButton', 'backToMenuFromDifficulty', 'backToMenuFromSettings',
        'generateAndPlayEditor', 'backToMenuFromEditor', 'saveGameButtonIngame',
        'saveSlotsButtonIngame', 'closeSaveSlotsPanel', 'victoryBackToMenu'
    ];
    ids.forEach(id => {
        // A bit of camelCase conversion
        const camelCaseId = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
        uiRefs[camelCaseId] = document.getElementById(id);
    });
}

export function showStatusMessage(message, colorClass = 'text-teal-300') {
    if (uiRefs.statusMessage) {
        uiRefs.statusMessage.textContent = message;
        uiRefs.statusMessage.className = `mt-2 text-sm ${colorClass}`;
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => { uiRefs.statusMessage.textContent = ''; }, 3000);
    }
}

export function updateCoinDisplay() {
    if (uiRefs.coinCounter) uiRefs.coinCounter.textContent = state.playerCoins;
    if (uiRefs.shopCoinCounter) uiRefs.shopCoinCounter.textContent = state.playerCoins;
    savePlayerCoins();
}

export function updateDistanceDisplay() {
    if (uiRefs.levelCounter) uiRefs.levelCounter.textContent = `${Math.floor(state.currentDistance)}m`;
}

export function updateMaxDistanceDisplay() {
    if (uiRefs.maxDistance) uiRefs.maxDistance.textContent = `${Math.floor(state.maxDistanceReached)}m`;
}


// --- Inventory and Power-ups ---

export function addPowerUpToInventory(powerUp) {
    for (let i = 0; i < state.playerInventory.length; i++) {
        if (!state.playerInventory[i]) {
            state.playerInventory[i] = powerUp;
            updateInventoryUI();
            showStatusMessage(`¡${powerUp.name} añadido al inventario! (Tecla ${i + 1})`, 'text-green-400');
            return;
        }
    }
    showStatusMessage("Inventario lleno.", 'text-orange-400');
}

export function activateInventoryItem(slotIndex) {
    if (slotIndex >= 0 && slotIndex < state.playerInventory.length && state.playerInventory[slotIndex]) {
        const powerUpToActivate = state.playerInventory[slotIndex];
        state.playerInventory[slotIndex] = null;
        updateInventoryUI();
        applyPowerUpEffect(powerUpToActivate.id, powerUpToActivate.name);
    }
}

export function setupInventoryUI() {
    if (!uiRefs.inventoryBar) return;
    uiRefs.inventoryBar.innerHTML = '';
    for (let i = 0; i < state.playerInventory.length; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'inventory-slot empty';
        slotDiv.dataset.slotIndex = i;
        slotDiv.innerHTML = `<span class="powerup-name">${i + 1}</span>`;
        slotDiv.addEventListener('click', () => activateInventoryItem(i));
        uiRefs.inventoryBar.appendChild(slotDiv);
    }
}

export function updateInventoryUI() {
    if (!uiRefs.inventoryBar) return;
    const slots = uiRefs.inventoryBar.children;
    for (let i = 0; i < state.playerInventory.length; i++) {
        const slotDiv = slots[i];
        const powerUp = state.playerInventory[i];
        if (powerUp) {
            slotDiv.classList.remove('empty');
            slotDiv.innerHTML = `<div class="powerup-icon" style="background-color: ${powerUp.iconColor || '#888'};"></div><span class="powerup-name">${i + 1}</span>`;
        } else {
            slotDiv.classList.add('empty');
            slotDiv.innerHTML = `<span class="powerup-name">${i + 1}</span>`;
        }
    }
}

export function applyPowerUpEffect(typeId, name) {
    clearTimeout(state.powerUpTimeout);
    resetPowerUpEffects();
    let duration = 10; // Simplified duration

    switch (typeId) {
        case 'jumpBoost': state.currentJumpStrength = PLAYER_DEFAULTS.baseJumpStrength * 1.6; break;
        case 'speedBoost': state.currentPlayerSpeed = PLAYER_DEFAULTS.baseSpeed * 1.6; break;
        case 'doubleJump': state.jumpsAvailable = 2; duration = 15; break;
        case 'charliXCX':
            state.currentPlayerSpeed = PLAYER_DEFAULTS.baseSpeed * 2.0;
            state.currentJumpStrength = PLAYER_DEFAULTS.baseJumpStrength * 1.4;
            state.playerCoins += 15;
            updateCoinDisplay();
            duration = 12;
            break;
        case 'tempPlatform':
            if (state.controls?.getObject()) {
                const platformPos = state.controls.getObject().position.clone();
                platformPos.y -= PLAYER_DEFAULTS.height / 2 + 0.5;
                const tempPlat = createPlatform(platformPos, new THREE.Vector3(2, 0.5, 2), 0xCCCCCC, false, 'box');
                state.platforms.push(tempPlat);
                setTimeout(() => {
                    if (tempPlat.mesh) state.scene.remove(tempPlat.mesh);
                    const index = state.platforms.indexOf(tempPlat);
                    if (index !== -1) state.platforms.splice(index, 1);
                }, 5000);
            }
            duration = 0.1;
            break;
        case 'shortTeleport':
            if (state.controls?.getObject()) {
                const direction = new THREE.Vector3();
                state.controls.getDirection(direction);
                state.controls.getObject().position.addScaledVector(direction, 10);
            }
            duration = 0.1;
            break;
        case 'lowGravity':
            state.gravityMultiplier = 0.3;
            setTimeout(() => { state.gravityMultiplier = 1.0; }, 8000);
            duration = 8;
            break;
        case 'phasePlatform':
            state.phaseThroughPlatforms = true;
            showStatusMessage("¡Próximo salto atraviesa plataformas!", "text-purple-400");
            duration = 5;
            break;
        // Other powerups can be added here
    }

    state.activePowerUp = { name, type: typeId, endTime: Date.now() + duration * 1000 };
    if (uiRefs.powerUpInfo) {
        uiRefs.powerUpInfo.textContent = `${name} (${duration.toFixed(0)}s)`;
        uiRefs.powerUpInfo.style.display = 'block';
    }

    if (duration > 0.1) {
        state.powerUpTimeout = setTimeout(() => {
            resetPowerUpEffects();
            showStatusMessage(`Efecto de ${name} terminado.`, 'text-gray-400');
        }, duration * 1000);
    } else {
        setTimeout(() => { if (uiRefs.powerUpInfo) uiRefs.powerUpInfo.style.display = 'none'; }, 500);
        state.activePowerUp = null;
    }
}

export function resetPowerUpEffects() {
    state.currentPlayerSpeed = PLAYER_DEFAULTS.baseSpeed;
    state.currentJumpStrength = PLAYER_DEFAULTS.baseJumpStrength;
    if (state.activePowerUp?.type === 'doubleJump') {
        if (!state.playerOnGround) state.jumpsAvailable = 1;
    } else {
        state.jumpsAvailable = 1;
    }
    if (uiRefs.powerUpInfo) uiRefs.powerUpInfo.style.display = 'none';
    state.activePowerUp = null;
    state.gravityMultiplier = 1.0;
    state.phaseThroughPlatforms = false;
    if(state.camera) {
        state.camera.fov = 75;
        state.camera.updateProjectionMatrix();
    }
}

// --- Shop ---

export function populateShop() {
    if (!uiRefs.shopItemsContainer) return;
    uiRefs.shopItemsContainer.innerHTML = '';
    state.shopItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p>Precio: <span class="font-bold text-yellow-300">${item.price}</span> monedas</p>`;

        const buyButton = document.createElement('button');
        buyButton.textContent = item.purchased ? 'Adquirido' : 'Comprar';
        buyButton.disabled = item.purchased || state.playerCoins < item.price;
        buyButton.onclick = () => buyShopItem(item.id);
        itemDiv.appendChild(buyButton);

        if (item.purchased && (item.type === 'platform_shape' || item.type === 'background_style')) {
            const equipButton = document.createElement('button');
            equipButton.textContent = item.equipped ? 'Equipado' : 'Equipar';
            equipButton.onclick = () => equipShopItem(item.id);
            itemDiv.appendChild(equipButton);
        }
        uiRefs.shopItemsContainer.appendChild(itemDiv);
    });
    if (uiRefs.shopCoinCounter) uiRefs.shopCoinCounter.textContent = state.playerCoins;
}

function buyShopItem(itemId) {
    const item = state.shopItems.find(i => i.id === itemId);
    if (item && !item.purchased && state.playerCoins >= item.price) {
        state.playerCoins -= item.price;
        item.purchased = true;
        updateCoinDisplay();
        saveShopItems();
        populateShop();
        showStatusMessage(`¡Has comprado "${item.name}"!`, 'text-green-400');
        if (item.type === 'platform_shape' || item.type === 'background_style') {
            equipShopItem(itemId);
        }
    }
}

function equipShopItem(itemId) {
    const itemToEquip = state.shopItems.find(i => i.id === itemId);
    if (!itemToEquip || !itemToEquip.purchased) return;

    state.shopItems.forEach(item => {
        if (item.type === itemToEquip.type) item.equipped = false;
    });
    itemToEquip.equipped = true;

    applyEquippedItems();
    saveShopItems();
    populateShop();
}

export function applyEquippedItems() {
    state.currentPlatformShape = 'box';
    state.currentBackgroundStyle = 'default';

    state.shopItems.forEach(item => {
        if (item.purchased && item.equipped) {
            if (item.type === 'platform_shape') state.currentPlatformShape = item.value;
            else if (item.type === 'background_style') state.currentBackgroundStyle = item.value;
        }
    });

    if (state.scene) {
        if (state.currentBackgroundStyle === 'nebula') {
            state.scene.background = new THREE.Color(0x0f0529);
        } else if (state.currentBackgroundStyle === 'alien_sunset') {
            state.scene.background = new THREE.Color(0xd94f00);
        } else {
            state.scene.background = new THREE.Color().setHSL(state.randomFunc(), 0.5, 0.1);
        }
    }
}

// --- Panel Visibility ---
export function updateUIVisibility() {
    // This function remains largely the same as before, but uses uiRefs
    // It's called from the game.js module
    const { currentGameState } = state;
    const {
        mainMenuPanel, difficultyPanel, settingsPanel, levelEditorPanel,
        shopPanel, victoryScreen, saveSlotsPanel, infoPanel, levelInfo,
        coinInfo, crosshair, inventoryBar, powerUpInfo, slowMoInfo
    } = uiRefs;

    if (!mainMenuPanel) return;

    const setDisplay = (element, display) => { if (element) element.style.display = display; };

    setDisplay(mainMenuPanel, (currentGameState === GAME_STATE.MAIN_MENU || currentGameState === GAME_STATE.PAUSED) ? 'block' : 'none');
    setDisplay(difficultyPanel, currentGameState === GAME_STATE.DIFFICULTY_SELECT ? 'block' : 'none');
    setDisplay(settingsPanel, currentGameState === GAME_STATE.SETTINGS ? 'block' : 'none');
    setDisplay(levelEditorPanel, currentGameState === GAME_STATE.LEVEL_EDITOR ? 'block' : 'none');
    setDisplay(shopPanel, currentGameState === GAME_STATE.SHOP ? 'block' : 'none');
    setDisplay(victoryScreen, currentGameState === GAME_STATE.VICTORY ? 'flex' : 'none');
    setDisplay(saveSlotsPanel, false); // Handle save slots separately

    const gameActive = currentGameState === GAME_STATE.PLAYING;
    setDisplay(infoPanel, gameActive ? 'block' : 'none');
    setDisplay(levelInfo, gameActive ? 'block' : 'none');
    setDisplay(coinInfo, gameActive ? 'block' : 'none');
    setDisplay(crosshair, gameActive && state.controls?.isLocked ? 'block' : 'none');
    setDisplay(inventoryBar, gameActive ? 'flex' : 'none');
    setDisplay(powerUpInfo, gameActive && state.activePowerUp ? 'block' : 'none');
    setDisplay(slowMoInfo, gameActive && state.slowMoActive ? 'block' : 'none');

    if (currentGameState === GAME_STATE.PAUSED) {
        mainMenuPanel.querySelector('h2').textContent = "Juego Pausado";
        mainMenuPanel.querySelector('#playButton').textContent = "Reanudar";
    } else if (currentGameState === GAME_STATE.MAIN_MENU) {
        mainMenuPanel.querySelector('h2').textContent = "Mundo Descosido: Edición Definitiva";
        mainMenuPanel.querySelector('#playButton').textContent = "Jugar";
    }
}
