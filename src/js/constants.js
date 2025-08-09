export const GAME_STATE = {
    MAIN_MENU: 'MAIN_MENU',
    DIFFICULTY_SELECT: 'DIFFICULTY_SELECT',
    SETTINGS: 'SETTINGS',
    LEVEL_EDITOR: 'LEVEL_EDITOR',
    SHOP: 'SHOP',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    VICTORY: 'VICTORY'
};

export const PLAYER_DEFAULTS = {
    height: 1.8,
    radius: 0.35,
    baseSpeed: 8.5,
    baseJumpStrength: 9.2,
};

export const WORLD_DEFAULTS = {
    gravity: -30.0,
    gameEndPoint: 10000,
    platformChunkSize: 15,
    chunkLoadDistance: 70,
    chunkRemoveDistance: 50,
};

export const POWER_UP_TYPES = [
    { name: 'Salto Potenciado', id: 'jumpBoost', color: 0x9333EA, iconColor: '#9333EA', description: "¡Alcanza nuevas alturas!" },
    { name: 'Velocidad Sónica', id: 'speedBoost', color: 0x34D399, iconColor: '#34D399', description: "¡Más rápido que tus problemas!" },
    { name: 'Alas de Ícaro (Doble Salto)', id: 'doubleJump', color: 0x60A5FA, iconColor: '#60A5FA', description: "Un salto más en el aire." },
    { name: 'Bendición de Charli XCX', id: 'charliXCX', color: 0xE879F9, iconColor: '#E879F9', description: "¡Vroom Vroom! Velocidad, salto y monedas." },
    // Nuevos Power-ups Experimentales
    { name: 'Plataforma Efímera', id: 'tempPlatform', color: 0xFDE047, iconColor: '#FDE047', description: "Crea un bloque temporal bajo tus pies.", experimental: true },
    { name: 'Mini Agujero de Gusano', id: 'shortTeleport', color: 0x5EEAD4, iconColor: '#5EEAD4', description: "Un pequeño salto adelante en el espacio-tiempo.", experimental: true },
    { name: 'Imán Dorado', id: 'coinMagnet', color: 0xFFD700, iconColor: '#FFD700', description: "Las monedas te aman.", experimental: true },
    { name: 'Visión Periférica', id: 'wideView', color: 0x7DD3FC, iconColor: '#7DD3FC', description: "Amplía tu campo de visión temporalmente.", experimental: true },
    { name: 'Faseo Selectivo', id: 'phasePlatform', color: 0x8B5CF6, iconColor: '#8B5CF6', description: "Atraviesa la próxima plataforma (¡cuidado!).", experimental: true },
    { name: 'Anti-Gravedad Personal', id: 'lowGravity', color: 0xBEF264, iconColor: '#BEF264', description: "Flota como si estuvieras en la luna.", experimental: true },
];

export const INVENTORY_SLOTS = 3;

export const SHOP_ITEMS = [
    { id: 'pf_sphere', name: 'Plataformas: Esferas', description: '¡Un desafío rodante!', price: 30, type: 'platform_shape', value: 'sphere', purchased: false, equipped: false },
    { id: 'pf_cylinder', name: 'Plataformas: Cilindros', description: '¡Equilibrio en las alturas!', price: 45, type: 'platform_shape', value: 'cylinder', purchased: false, equipped: false },
    { id: 'bg_nebula', name: 'Fondo: Nebulosa Cósmica', description: 'Viaja por el espacio profundo.', price: 60, type: 'background_style', value: 'nebula', purchased: false, equipped: false },
    { id: 'bg_alien_sunset', name: 'Fondo: Atardecer Alienígena', description: 'Colores vibrantes de otro mundo.', price: 70, type: 'background_style', value: 'alien_sunset', purchased: false, equipped: false },
];
