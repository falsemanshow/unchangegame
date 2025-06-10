const VERGIL_WEAPONS = {
    YAMATO: 'yamato',
    BEOWULF: 'beowulf',
    MIRAGE_BLADE: 'mirage_blade'
};

const vergilSpriteData = {
    // Yamato sprites
    idle: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    dash: { src: "vergil-dash.png", frames: 3, w: 100, h: 100, speed: 4 },
    walk: { src: "vergil-walk.png", frames: 3, w: 100, h: 100, speed: 6 },
    block: { src: "vergil-block.png", frames: 4, w: 100, h: 100, speed: 6 },
    blocking: { src: "vergil-blocking.png", frames: 3, w: 100, h: 100, speed: 8 },
    jump: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    fall: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 },
    sheathing: { src: "vergil-idle.png", frames: 6, w: 100, h: 100, speed: 8 },
    slashing: { src: "vergil-judgment-cut-slashes.png", frames: 1, w: 100, h: 100, speed: 3 },
    charging: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 10 },

    // Beowulf sprites
    'beowulf-idle': { src: "vergil-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-dash': { src: "vergil-beowulf-dash.png", frames: 4, w: 100, h: 100, speed: 3 },
    'beowulf-walk': { src: "vergil-beowulf-walk.png", frames: 4, w: 100, h: 100, speed: 6 },
    'beowulf-block': { src: "vergil-beowulf-block.png", frames: 3, w: 100, h: 100, speed: 6 },
    'beowulf-blocking': { src: "vergil-beowulf-blocking.png", frames: 2, w: 100, h: 100, speed: 8 },
    'beowulf-jump': { src: "vergil-beowulf-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-fall': { src: "vergil-beowulf-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'beowulf-charging': { src: "vergil-beowulf-charging.png", frames: 4, w: 100, h: 100, speed: 8 },
    'beowulf-uppercut': { src: "vergil-beowulf-uppercut.png", frames: 5, w: 100, h: 100, speed: 3 },
    'beowulf-divekick': { src: "vergil-idle.png", frames: 3, w: 100, h: 100, speed: 4 },
    'beowulf-recovery': { src: "vergil-beowulf-recovery.png", frames: 4, w: 100, h: 100, speed: 8 },

    // Mirage Blade sprites
    'mirage-idle': { src: "vergil-mirage-idle.png", frames: 6, w: 100, h: 100, speed: 12 },
    'mirage-dash': { src: "vergil-mirage-dash.png", frames: 4, w: 100, h: 100, speed: 3 },
    'mirage-walk': { src: "vergil-mirage-walk.png", frames: 4, w: 100, h: 100, speed: 6 },
    // Add other Vergil-specific sprites if they are defined elsewhere and should be here
    hit: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 }, // Assuming a generic hit, adjust if specific
    dizzy: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 }, // Assuming generic, adjust
    defeat: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 }, // Assuming generic, adjust
    victory: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 }, // Assuming generic, adjust
};

// Note: You'll need to ensure PLAYER_HP, PLAYER_SIZE, BLOCK_MAX etc. are available
// if not passed in, or define them here if they are Vergil-specific.
// For now, we assume they are global constants in mainwhole.js
function createVergilCharacter(id, name, color, initialX, initialY, facing, playerHp, playerSize, blockMax) {
    return {
        x: initialX, y: initialY, vx: 0, vy: 0, w: playerSize, h: playerSize,
        color: color, facing: facing, hp: playerHp, jumps: 0, dash: 0,
        dashCooldown: 0, onGround: false, jumpHeld: false, alive: true, id: id,
        name: name, charId: "vergil", animState: "idle", animFrame: 0, animTimer: 0,
        justHit: 0, block: blockMax, blocking: false, dizzy: 0, blockGlowTimer: 0,
        blockWasFull: false, judgementCutCooldown: 0, hasDashHit: false,
        blockAnimationFinished: false, blockStartTime: 0, judgementCutPhase: null,
        isInvisibleDuringJudgmentCut: false, slashAnimationFrame: 0, slashAnimationTimer: 0,
        judgmentCutCharging: false, judgmentCutChargeStart: 0, judgmentCutChargeLevel: 0,
        currentWeapon: VERGIL_WEAPONS.YAMATO, bounceEffect: null, isBeingKnockedBack: false,
        hitstun: 0, inHitstun: false, beowulfCharging: false, beowulfChargeStart: 0,
        beowulfChargeType: null, beowulfDiveKick: false, beowulfDiveDirection: 1,
        beowulfGroundImpact: false, beowulfImpactRadius: 80, isDiveKicking: false,
        isUppercutting: false, uppercutPower: 0, mirageActive: false, mirageTimer: 0,
        mirageDuration: 60, pauseTimer: 0, mirageSlashX: 0, mirageSlashY: 0,
        teleportTrail: null, isTeleporting: false, teleportAlpha: 1.0,
        airHitstun: false, beowulfRecovering: false,
        beowulfRecoveryTimer: 0,
        // Ensure all necessary properties from the original Vergil player object are here
    };
}

export { createVergilCharacter, vergilSpriteData, VERGIL_WEAPONS };