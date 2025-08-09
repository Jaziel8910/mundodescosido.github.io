import { state } from './state.js';
import { SHOP_ITEMS, POWER_UP_TYPES } from './constants.js';

const COINS_KEY = 'mundoDescosido_playerCoins';
const SHOP_KEY = 'mundoDescosido_shopItems';
const DISTANCES_KEY = 'mundoDescosido_maxDistances';
const SLOTS_KEY = 'mundoDescosido_saveSlots';
const SAVE_SLOTS_COUNT = 5;

// --- Public API ---

/**
 * Loads all persistent data from localStorage into the game state.
 */
export function loadAllPersistentData() {
    loadPlayerCoins();
    loadShopItems();
    loadSaveSlotsFromStorage();
    // Max distance is loaded when a seed is set.
}

/**
 * Saves all relevant game progress to localStorage.
 */
export function saveAllPersistentData() {
    savePlayerCoins();
    saveShopItems();
    saveMaxDistance();
}

// --- Coins ---

export function savePlayerCoins() {
    try {
        localStorage.setItem(COINS_KEY, state.playerCoins.toString());
    } catch (e) {
        console.error("Error saving coins:", e);
    }
}

function loadPlayerCoins() {
    try {
        const storedCoins = localStorage.getItem(COINS_KEY);
        state.playerCoins = storedCoins !== null ? parseInt(storedCoins, 10) : 0;
    } catch (e) {
        state.playerCoins = 0;
        console.error("Error loading coins:", e);
    }
}

// --- Shop Items ---

export function saveShopItems() {
    try {
        const itemsToSave = state.shopItems.map(i => ({
            id: i.id,
            purchased: i.purchased,
            equipped: i.equipped
        }));
        localStorage.setItem(SHOP_KEY, JSON.stringify(itemsToSave));
    } catch (e) {
        console.error("Error saving shop items:", e);
    }
}

function loadShopItems() {
    try {
        const storedItems = localStorage.getItem(SHOP_KEY);
        if (storedItems) {
            const loadedItems = JSON.parse(storedItems);
            // Sync with constants in case items were added/removed
            state.shopItems = SHOP_ITEMS.map(constantItem => {
                const loadedItem = loadedItems.find(li => li.id === constantItem.id);
                return { ...constantItem, ...loadedItem };
            });
        } else {
            // If nothing is in storage, initialize from constants
            state.shopItems = JSON.parse(JSON.stringify(SHOP_ITEMS));
        }
    } catch (e) {
        console.error("Error loading shop items:", e);
        state.shopItems = JSON.parse(JSON.stringify(SHOP_ITEMS));
    }
}

// --- Max Distance (Per Seed) ---

export function saveMaxDistance() {
    if (!state.currentSeedStringInternal) return; // Don't save for random seeds
    try {
        const distances = JSON.parse(localStorage.getItem(DISTANCES_KEY) || '{}');
        distances[state.currentSeedStringInternal] = Math.floor(state.maxDistanceReached);
        localStorage.setItem(DISTANCES_KEY, JSON.stringify(distances));
    } catch (e) {
        console.error("Error saving max distances:", e);
    }
}

export function loadMaxDistance() {
    if (!state.currentSeedStringInternal) {
        state.maxDistanceReached = 0;
        return;
    }
    try {
        const distances = JSON.parse(localStorage.getItem(DISTANCES_KEY) || '{}');
        state.maxDistanceReached = distances[state.currentSeedStringInternal] || 0;
    } catch (e) {
        state.maxDistanceReached = 0;
        console.error("Error loading max distances:", e);
    }
}

// --- Save Slots ---

function getCurrentSaveData() {
    return {
        seed: state.currentSeedStringInternal,
        coins: state.playerCoins,
        maxDistance: state.maxDistanceReached,
        date: new Date().toISOString(),
        difficulty: state.selectedDifficulty,
        editorParams: { ...state.editorParams },
        inventory: state.playerInventory.map(pu => pu ? pu.id : null),
        shopItems: state.shopItems.map(i => ({ id: i.id, purchased: i.purchased, equipped: i.equipped }))
    };
}

export function applySaveData(data) {
    if (!data) return;
    // This function will need to call functions from other modules (game.js, world.js)
    // We will pass this function to the UI module or handle it in the game module.
    // For now, the logic is here, but it will need to be connected.
    console.log("Applying save data:", data);

    // Example of what it will do:
    // setSeed(data.seed);
    // state.playerCoins = data.coins || 0;
    // ... and so on
}

export function saveSlot(idx) {
    state.saveSlots[idx] = getCurrentSaveData();
    localStorage.setItem(SLOTS_KEY, JSON.stringify(state.saveSlots));
    // showStatusMessage(`Partida guardada en slot ${idx+1}`, 'text-green-400');
    // renderSaveSlotsPanel();
}

export function loadSlot(idx) {
    const slotData = state.saveSlots[idx];
    if (slotData) {
        applySaveData(slotData);
        // hideSaveSlotsPanel();
    }
}

export function deleteSlot(idx) {
    state.saveSlots[idx] = null;
    localStorage.setItem(SLOTS_KEY, JSON.stringify(state.saveSlots));
    // renderSaveSlotsPanel();
}

function loadSaveSlotsFromStorage() {
    try {
        const slots = JSON.parse(localStorage.getItem(SLOTS_KEY));
        state.saveSlots = Array.isArray(slots) ? slots : new Array(SAVE_SLOTS_COUNT).fill(null);
    } catch {
        state.saveSlots = new Array(SAVE_SLOTS_COUNT).fill(null);
    }
}
