// Character Select System with Real Animated Sprites
class CharacterSelect {
    constructor() {
        this.selectedCharacters = {
            player1: null,
            player2: null
        };
        
        this.currentSelection = {
            player1: { row: 0, col: 0 },
            player2: { row: 0, col: 0 }
        };
        
        this.gridSize = { rows: 2, cols: 2 };
        this.characters = ['gold', 'chicken', 'danty', 'vergil'];
        
        // Animation system
        this.previews = {
            player1: {
                canvas: null,
                ctx: null,
                character: null,
                animFrame: 0,
                animTimer: 0
            },
            player2: {
                canvas: null,
                ctx: null,
                character: null,
                animFrame: 0,
                animTimer: 0
            }
        };
        
        this.animationLoop = null;
        this.spritesLoaded = {};
        
        this.init();
    }
    
    init() {
        this.loadCharacterSprites();
        this.initCanvases();
        this.bindEvents();
        this.updateSelectionHighlight();
        this.startAnimationLoop();
    }
    
    loadCharacterSprites() {
        // Load all character idle sprites
        const spriteData = {
            gold: { src: "gold-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
            chicken: { src: "chicken-idle.png", frames: 5, w: 50, h: 50, speed: 13 },
            danty: { src: "danty-idle.png", frames: 1, w: 100, h: 100, speed: 13 },
            vergil: { src: "vergil-idle.png", frames: 8, w: 100, h: 100, speed: 12 }
        };
        
        Object.keys(spriteData).forEach(charId => {
            const data = spriteData[charId];
            const img = new Image();
            img.onload = () => {
                console.log(`✅ Loaded sprite for ${charId}: ${data.src}`);
                this.spritesLoaded[charId] = {
                    image: img,
                    ...data
                };
            };
            img.onerror = () => {
                console.warn(`❌ Failed to load sprite for ${charId}: ${data.src}`);
                // Keep the data structure but mark as failed
                this.spritesLoaded[charId] = {
                    image: null,
                    ...data
                };
            };
            img.src = data.src;
        });
    }
    
    initCanvases() {
        this.previews.player1.canvas = document.getElementById('p1Preview');
        this.previews.player1.ctx = this.previews.player1.canvas.getContext('2d');
        this.previews.player2.canvas = document.getElementById('p2Preview');
        this.previews.player2.ctx = this.previews.player2.canvas.getContext('2d');
        
        // Set up canvas properties for pixel art
        [this.previews.player1.ctx, this.previews.player2.ctx].forEach(ctx => {
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
        });
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        
        // Add click handlers for character options
        document.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const char = e.currentTarget.dataset.char;
                const player = parseInt(e.currentTarget.dataset.player);
                this.selectCharacter(player, char);
            });
        });
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Player 1 controls (WASD + Space)
        if (key === 'w') {
            this.moveSelection(1, 'up');
            e.preventDefault();
        } else if (key === 's') {
            this.moveSelection(1, 'down');
            e.preventDefault();
        } else if (key === 'a') {
            this.moveSelection(1, 'left');
            e.preventDefault();
        } else if (key === 'd') {
            this.moveSelection(1, 'right');
            e.preventDefault();
        } else if (key === ' ') {
            this.selectCurrentCharacter(1);
            e.preventDefault();
        }
        
        // Player 2 controls (OKL; + Enter)
        else if (key === 'o') {
            this.moveSelection(2, 'up');
            e.preventDefault();
        } else if (key === 'l') {
            this.moveSelection(2, 'down');
            e.preventDefault();
        } else if (key === 'k') {
            this.moveSelection(2, 'left');
            e.preventDefault();
        } else if (key === ';') {
            this.moveSelection(2, 'right');
            e.preventDefault();
        } else if (key === 'enter') {
            this.selectCurrentCharacter(2);
            e.preventDefault();
        }
    }
    
    moveSelection(player, direction) {
        const selection = this.currentSelection[`player${player}`];
        
        switch (direction) {
            case 'up':
                selection.row = Math.max(0, selection.row - 1);
                break;
            case 'down':
                selection.row = Math.min(this.gridSize.rows - 1, selection.row + 1);
                break;
            case 'left':
                selection.col = Math.max(0, selection.col - 1);
                break;
            case 'right':
                selection.col = Math.min(this.gridSize.cols - 1, selection.col + 1);
                break;
        }
        
        this.updateSelectionHighlight();
    }
    
    updateSelectionHighlight() {
        // Clear all highlights
        document.querySelectorAll('.character-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add highlights for current selections
        for (let player = 1; player <= 2; player++) {
            const selection = this.currentSelection[`player${player}`];
            const index = selection.row * this.gridSize.cols + selection.col;
            const char = this.characters[index];
            
            const option = document.querySelector(`[data-char="${char}"][data-player="${player}"]`);
            if (option) {
                option.classList.add('selected');
            }
        }
    }
    
    selectCurrentCharacter(player) {
        const selection = this.currentSelection[`player${player}`];
        const index = selection.row * this.gridSize.cols + selection.col;
        const char = this.characters[index];
        
        this.selectCharacter(player, char);
    }
    
    selectCharacter(player, char) {
        this.selectedCharacters[`player${player}`] = char;
        
        // Update visual feedback
        const playerKey = `player${player}`;
        const className = player === 1 ? 'p1-selected' : 'p2-selected';
        
        // Remove previous selection highlight for this player
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.classList.remove(className);
        });
        
        // Add selection highlight to chosen character
        const option = document.querySelector(`[data-char="${char}"][data-player="${player}"]`);
        if (option) {
            option.classList.add(className);
        }
        
        // Update preview
        this.updatePreview(player, char);
        
        this.checkReadyToStart();
    }
    
    updatePreview(player, char) {
        const preview = this.previews[`player${player}`];
        preview.character = char;
        preview.animFrame = 0;
        preview.animTimer = 0;
        
        // Update preview name
        const nameElement = document.getElementById(`p${player}PreviewName`);
        nameElement.textContent = char.charAt(0).toUpperCase() + char.slice(1);
        
        console.log(`🎭 Updated preview for Player ${player}: ${char}`);
    }
    
    startAnimationLoop() {
        const animate = () => {
            this.updateAnimations();
            this.drawPreviews();
            this.animationLoop = requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateAnimations() {
        for (let player = 1; player <= 2; player++) {
            const preview = this.previews[`player${player}`];
            if (preview.character && this.spritesLoaded[preview.character]) {
                const spriteData = this.spritesLoaded[preview.character];
                preview.animTimer++;
                if (preview.animTimer >= spriteData.speed) {
                    preview.animTimer = 0;
                    preview.animFrame = (preview.animFrame + 1) % spriteData.frames;
                }
            }
        }
    }
    
    drawPreviews() {
        for (let player = 1; player <= 2; player++) {
            const preview = this.previews[`player${player}`];
            const ctx = preview.ctx;
            const canvas = preview.canvas;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (preview.character) {
                this.drawCharacterSprite(ctx, preview.character, preview.animFrame, canvas.width, canvas.height);
            } else {
                // Draw placeholder
                this.drawPlaceholder(ctx, canvas.width, canvas.height);
            }
        }
    }
    
    drawCharacterSprite(ctx, charId, animFrame, canvasWidth, canvasHeight) {
        const spriteData = this.spritesLoaded[charId];
        
        if (spriteData && spriteData.image && spriteData.image.complete) {
            // Calculate scaling to fit in preview canvas
            const maxSize = Math.min(canvasWidth, canvasHeight) * 0.8;
            const scale = maxSize / Math.max(spriteData.w, spriteData.h);
            const drawWidth = spriteData.w * scale;
            const drawHeight = spriteData.h * scale;
            const drawX = (canvasWidth - drawWidth) / 2;
            const drawY = (canvasHeight - drawHeight) / 2;
            
            // Draw the sprite frame
            ctx.drawImage(
                spriteData.image,
                spriteData.w * animFrame, 0,      // Source position
                spriteData.w, spriteData.h,       // Source size
                drawX, drawY,                     // Destination position
                drawWidth, drawHeight             // Destination size
            );
            
            console.log(`🎨 Drawing ${charId} frame ${animFrame}/${spriteData.frames - 1}`);
        } else {
            // Fallback if sprite isn't loaded yet
            this.drawFallback(ctx, charId, canvasWidth, canvasHeight);
        }
    }
    
    drawFallback(ctx, charId, canvasWidth, canvasHeight) {
        // Character-specific colors and shapes
        const characterData = {
            gold: { color: '#ffd700', shape: 'circle', icon: '🏆' },
            chicken: { color: '#ff8c00', shape: 'oval', icon: '🐔' },
            danty: { color: '#ef5350', shape: 'rect', icon: '⚡' },
            vergil: { color: '#4a90e2', shape: 'rect', icon: '⚔️' }
        };
        
        const data = characterData[charId] || { color: '#666', shape: 'rect', icon: '?' };
        const size = 60;
        const x = (canvasWidth - size) / 2;
        const y = (canvasHeight - size) / 2;
        
        // Add a simple "breathing" animation effect
        const breathe = Math.sin(Date.now() / 800) * 3;
        const currentSize = size + breathe;
        const currentX = (canvasWidth - currentSize) / 2;
        const currentY = (canvasHeight - currentSize) / 2;
        
        // Draw character shape
        ctx.fillStyle = data.color;
        
        if (data.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(canvasWidth/2, canvasHeight/2, currentSize/2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (data.shape === 'oval') {
            ctx.beginPath();
            ctx.ellipse(canvasWidth/2, canvasHeight/2, currentSize/2, currentSize/1.5, 0, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillRect(currentX, currentY, currentSize, currentSize);
        }
        
        // Add highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(currentX, currentY + breathe, currentSize, currentSize/3);
        
        // Draw character icon/emoji
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.icon, canvasWidth/2, canvasHeight/2 + 8);
        
        // Loading text
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('Loading...', canvasWidth/2, canvasHeight - 10);
        
        console.log(`🔄 Drawing fallback for ${charId} (sprite not loaded yet)`);
    }
    
    drawPlaceholder(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#444';
        ctx.fillRect(20, 20, canvasWidth-40, canvasHeight-40);
        
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', canvasWidth/2, canvasHeight/2 + 6);
        
        ctx.font = '10px Arial';
        ctx.fillText('Select Character', canvasWidth/2, canvasHeight - 15);
    }
    
    checkReadyToStart() {
        const startButton = document.getElementById('startGame');
        const ready = this.selectedCharacters.player1 && this.selectedCharacters.player2;
        
        startButton.disabled = !ready;
        
        if (ready) {
            startButton.textContent = `START GAME (${this.selectedCharacters.player1.toUpperCase()} vs ${this.selectedCharacters.player2.toUpperCase()})`;
        } else {
            startButton.textContent = 'START GAME';
        }
    }
    
    startGame() {
        if (!this.selectedCharacters.player1 || !this.selectedCharacters.player2) {
            return;
        }
        
        console.log('🚀 Starting game with:', this.selectedCharacters);
        
        // Stop animation loop
        if (this.animationLoop) {
            cancelAnimationFrame(this.animationLoop);
        }
        
        // Hide character select screen
        document.getElementById('characterSelect').classList.remove('active');
        
        // Show game screens
        document.getElementById('ui').classList.add('active');
        document.getElementById('game').classList.add('active');
        
        // Pass selected characters to the main game
        if (typeof window.initializeGameWithCharacters === 'function') {
            window.initializeGameWithCharacters(
                this.selectedCharacters.player1,
                this.selectedCharacters.player2
            );
        }
        
        // Start the game loop if it exists
        if (typeof window.startGameLoop === 'function') {
            window.startGameLoop();
        }
    }
    
    getSelectedCharacters() {
        return this.selectedCharacters;
    }
}

// Initialize character select when page loads
let characterSelect;
document.addEventListener('DOMContentLoaded', () => {
    characterSelect = new CharacterSelect();
});

// Make it globally accessible
window.characterSelect = characterSelect;