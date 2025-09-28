// game.js - Исправленная версия с системой скачивания

// ==================== СИСТЕМА ЗВУКОВ ====================
class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.isAudioEnabled = false;
        this.setupSounds();
    }
    
    setupSounds() {
        this.sounds.playerHit = this.createSound('sounds/player_hit.mp3');
        this.sounds.bossHit = this.createSound('sounds/boss_hit.mp3');
        this.sounds.heal = this.createSound('sounds/heal.mp3');
    }
    
    createSound(src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = 0.7;
        audio.preload = 'auto';
        return audio;
    }
    
    enableAudio() {
        if (this.isAudioEnabled) return;
        
        this.isAudioEnabled = true;
        console.log('🔊 Звук включен после взаимодействия с пользователем');
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    playSound(soundName) {
        if (!this.isAudioEnabled) return;
        
        if (this.sounds[soundName]) {
            try {
                const sound = this.sounds[soundName].cloneNode();
                sound.volume = 0.7;
                const playPromise = sound.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name === 'NotAllowedError') {
                            console.log('🔇 Звук заблокирован браузером, требуется взаимодействие');
                        }
                    });
                }
            } catch (error) {
                console.log('Sound error:', error);
            }
        }
    }
    
    playPlayerHit() { this.playSound('playerHit'); }
    playBossHit() { this.playSound('bossHit'); }
    playHeal() { this.playSound('heal'); }
}

// ==================== СИСТЕМА СКАЧИВАНИЯ ====================
function setupDownloadButtons() {
    const downloadVideoButton = document.getElementById('download-video-button');
    const downloadMp3Button = document.getElementById('download-mp3-button');
    
    if (downloadVideoButton) {
        downloadVideoButton.addEventListener('click', downloadVictoryVideo);
    }
    
    if (downloadMp3Button) {
        downloadMp3Button.addEventListener('click', downloadMp3);
    }
}

function downloadVictoryVideo() {
    try {
        const videoUrl = 'test.mp4';
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = 'Congratulations.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('🎥 Видео скачивается...');
        
        // Показать сообщение об успешном скачивании
        const victoryContent = document.getElementById('victory-content');
        const message = document.createElement('p');
        message.textContent = 'Видео скачивается...';
        message.style.color = '#00ff00';
        message.style.marginTop = '10px';
        victoryContent.appendChild(message);
        
        setTimeout(() => {
            if (victoryContent.contains(message)) {
                victoryContent.removeChild(message);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка скачивания видео:', error);
        alert('Файл test.mp4 не найден! Убедитесь, что он находится в корневой папке игры.');
    }
}

function downloadMp3() {
    try {
        const mp3Url = 'sounds/Congratulations.mp4';
        const link = document.createElement('a');
        link.href = mp3Url;
        link.download = 'Congratulations.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('🎵 MP4 скачивается...');
        
        // Показать сообщение об успешном скачивании
        const victoryContent = document.getElementById('victory-content');
        const message = document.createElement('p');
        message.textContent = 'MP4 скачивается...';
        message.style.color = '#00ff00';
        message.style.marginTop = '10px';
        victoryContent.appendChild(message);
        
        setTimeout(() => {
            if (victoryContent.contains(message)) {
                victoryContent.removeChild(message);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка скачивания MP3:', error);
        alert('Файл Congratulations.4 не найден!');
    }
}

// ==================== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ====================
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const soundManager = new SoundManager();

const gameState = {
    playerHP: 100,
    bossHP: 800,
    maxPlayerHP: 100,
    maxBossHP: 800,
    isPlayerTurn: false,
    currentDialogue: 0,
    attacks: [],
    items: 8,
    difficulty: 5,
    dialogue: [
        "* Приготовься к настоящему испытанию!",
        "* Ты не представляешь, с чем связался!",
        "* Моя мощь не знает границ!",
        "* Это будет твой последний бой!",
        "* Ты просто пыль под моими ногами!",
        "* Ты обречен!",
        "* Никто еще не побеждал меня!",
        "* Твои попытки смешны!",
        "* Я уничтожу тебя!",
        "* Это конец для тебя!",
        "* Моя ярость не знает предела!",
        "* Твои усилия напрасны!",
        "* Я стану твоим кошмаром!",
        "* Беги, пока не поздно!",
        "* Твоя судьба предрешена!"
    ],
    gameActive: true,
    isDragging: false,
    canSelectOption: true,
    canMove: true,
    bossTurnDuration: 25000,
    mercyProgress: 0,
    maxMercyProgress: 100,
    attackPatterns: [
        'boneStormCombo',
        'spiralFireCombo', 
        'lightningVortexCombo',
        'meteorBombCombo',
        'shadowVortexCombo',
        'timeVortexCombo',
        'ultimateChaosCombo'
    ],
    isInvulnerable: false,
    invulnerabilityDuration: 2000,
    stunDuration: 500,
    turnCount: 0
};

// ==================== DOM ЭЛЕМЕНТЫ ====================
const bossHealthFill = document.getElementById('boss-health-fill');
const playerHealthFill = document.getElementById('player-health-fill');
const playerHealthText = document.getElementById('player-health-text');
const dialogueBox = document.getElementById('dialogue-box');
const options = document.querySelectorAll('.option');
const gameOverScreen = document.getElementById('game-over');
const victoryScreen = document.getElementById('victory');
const restartButtons = document.querySelectorAll('#restart-button, #restart-button-victory');
const turnIndicator = document.getElementById('turn-indicator');
const battleArea = document.getElementById('battle-area');
const gameContainer = document.getElementById('game-container');
const bossImage = document.getElementById('boss-image');
const playerHeart = document.getElementById('player-heart');

// ==================== ПЕРЕМЕННЫЕ ДВИЖЕНИЯ ====================
let battleAreaRect = battleArea.getBoundingClientRect();
let heartPosition = { x: battleAreaRect.width / 2, y: battleAreaRect.height / 2 };
const BOUNDARY_MARGIN = 50;
let selectedOption = 0;

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================
// ==================== ОБРАБОТЧИКИ КЛИКОВ ДЛЯ КНОПОК ДЕЙСТВИЙ ====================
function setupActionButtons() {
    options.forEach((option, index) => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            handleFirstInteraction();
            
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                selectedOption = index;
                updateOptionSelection();
                handleOptionSelect(selectedOption);
            }
        });
        
        // Добавляем hover эффект для ПК
        option.addEventListener('mouseenter', () => {
            if (gameState.canSelectOption) {
                selectedOption = index;
                updateOptionSelection();
            }
        });
    });
}

// ==================== ОБНОВЛЕННАЯ ФУНКЦИЯ НАСТРОЙКИ УПРАВЛЕНИЯ ====================
function setupMouseAndKeyboardControls() {
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    document.addEventListener('keydown', handleKeyPress);
    battleArea.addEventListener('mousedown', handleMouseDown);
    battleArea.addEventListener('mousemove', handleMouseMove);
    battleArea.addEventListener('mouseup', handleMouseUp);
    battleArea.addEventListener('mouseleave', handleMouseUp);
    
    // Добавляем обработчики для кнопок действий
    setupActionButtons();
}


function updateHeartPosition() {
    if (!playerHeart) return;
    playerHeart.style.left = (heartPosition.x - 8) + 'px';
    playerHeart.style.top = (heartPosition.y - 8) + 'px';
}

function constrainHeartPosition() {
    heartPosition.x = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.width - BOUNDARY_MARGIN, heartPosition.x));
    heartPosition.y = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.height - BOUNDARY_MARGIN, heartPosition.y));
}

function updateOptionSelection() {
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === selectedOption);
    });
}

// ==================== СИСТЕМА УПРАВЛЕНИЯ ====================
if (isTouchDevice) {
    setupTouchControls();
} else {
    setupMouseAndKeyboardControls();
}

restartButtons.forEach(button => {
    button.addEventListener('click', restartGame);
});

function setupTouchControls() {
    battleArea.addEventListener('touchstart', handleFirstInteraction, { passive: false, once: true });
    battleArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    battleArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    battleArea.addEventListener('touchend', handleTouchEnd);
    
    options.forEach((option, index) => {
        option.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleFirstInteraction();
            if (gameState.canSelectOption) {
                selectedOption = index;
                updateOptionSelection();
            }
        });
        
        option.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                handleOptionSelect(selectedOption);
            }
        });
    });
}

function setupMouseAndKeyboardControls() {
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    document.addEventListener('keydown', handleKeyPress);
    battleArea.addEventListener('mousedown', handleMouseDown);
    battleArea.addEventListener('mousemove', handleMouseMove);
    battleArea.addEventListener('mouseup', handleMouseUp);
    battleArea.addEventListener('mouseleave', handleMouseUp);
}

function handleFirstInteraction() {
    soundManager.enableAudio();
    try {
        const silentSound = new Audio();
        silentSound.volume = 0.001;
        silentSound.play().then(() => {
            silentSound.pause();
        }).catch(() => {});
    } catch (e) {}
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!gameState.gameActive || !gameState.canMove || !playerHeart) return;
    
    const touch = e.touches[0];
    const rect = battleArea.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (x < BOUNDARY_MARGIN || x > battleAreaRect.width - BOUNDARY_MARGIN || 
        y < BOUNDARY_MARGIN || y > battleAreaRect.height - BOUNDARY_MARGIN) return;
    
    const heartRect = playerHeart.getBoundingClientRect();
    const heartX = heartRect.left + heartRect.width/2 - rect.left;
    const heartY = heartRect.top + heartRect.height/2 - rect.top;
    const distance = Math.sqrt((x - heartX)**2 + (y - heartY)**2);
    
    if (distance <= 30) gameState.isDragging = true;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.gameActive || !gameState.canMove || !gameState.isDragging) return;
    
    const touch = e.touches[0];
    const rect = battleArea.getBoundingClientRect();
    let x = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.width - BOUNDARY_MARGIN, touch.clientX - rect.left));
    let y = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.height - BOUNDARY_MARGIN, touch.clientY - rect.top));
    
    heartPosition.x = x;
    heartPosition.y = y;
    constrainHeartPosition();
    updateHeartPosition();
}

function handleTouchEnd() {
    gameState.isDragging = false;
}

function handleMouseDown(e) {
    if (!gameState.gameActive || !gameState.canMove || !playerHeart) return;
    
    const rect = battleArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x < BOUNDARY_MARGIN || x > battleAreaRect.width - BOUNDARY_MARGIN || 
        y < BOUNDARY_MARGIN || y > battleAreaRect.height - BOUNDARY_MARGIN) return;
    
    const heartRect = playerHeart.getBoundingClientRect();
    const heartX = heartRect.left + heartRect.width/2 - rect.left;
    const heartY = heartRect.top + heartRect.height/2 - rect.top;
    const distance = Math.sqrt((x - heartX)**2 + (y - heartY)**2);
    
    if (distance <= 30) gameState.isDragging = true;
}

function handleMouseMove(e) {
    if (!gameState.gameActive || !gameState.canMove || !gameState.isDragging) return;
    
    const rect = battleArea.getBoundingClientRect();
    let x = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.width - BOUNDARY_MARGIN, e.clientX - rect.left));
    let y = Math.max(BOUNDARY_MARGIN, Math.min(battleAreaRect.height - BOUNDARY_MARGIN, e.clientY - rect.top));
    
    heartPosition.x = x;
    heartPosition.y = y;
    constrainHeartPosition();
    updateHeartPosition();
}

function handleMouseUp() {
    gameState.isDragging = false;
}

function handleKeyPress(e) {
    if (!gameState.gameActive || !gameState.canMove) return;
    
    switch(e.key) {
        case 'ArrowLeft': 
            heartPosition.x -= 10; 
            e.preventDefault();
            break;
        case 'ArrowRight': 
            heartPosition.x += 10; 
            e.preventDefault();
            break;
        case 'ArrowUp': 
            heartPosition.y -= 10; 
            e.preventDefault();
            break;
        case 'ArrowDown': 
            heartPosition.y += 10; 
            e.preventDefault();
            break;
        case ' ': case 'Enter': case 'z': case 'Z':
            if (gameState.isPlayerTurn && gameState.canSelectOption) {
                e.preventDefault();
                handleOptionSelect(selectedOption);
            }
            break;
        case 'Tab':
            e.preventDefault();
            if (gameState.canSelectOption) {
                selectedOption = (selectedOption + 1) % options.length;
                updateOptionSelection();
            }
            break;
        case 'Escape': case 'x': case 'X':
            if (gameState.canSelectOption) {
                e.preventDefault();
                gameState.canSelectOption = true;
                dialogueBox.textContent = "* Что будешь делать?";
            }
            break;
        case '1':
            e.preventDefault();
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                selectedOption = 0;
                updateOptionSelection();
                handleOptionSelect(selectedOption);
            }
            break;
        case '2':
            e.preventDefault();
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                selectedOption = 1;
                updateOptionSelection();
                handleOptionSelect(selectedOption);
            }
            break;
        case '3':
            e.preventDefault();
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                selectedOption = 2;
                updateOptionSelection();
                handleOptionSelect(selectedOption);
            }
            break;
        case '4':
            e.preventDefault();
            if (gameState.canSelectOption && gameState.isPlayerTurn) {
                selectedOption = 3;
                updateOptionSelection();
                handleOptionSelect(selectedOption);
            }
            break;
    }
    constrainHeartPosition();
    updateHeartPosition();
}

// ==================== СИСТЕМА ДЕЙСТВИЙ ИГРОКА ====================
function handleOptionSelect(optionIndex) {
    const action = options[optionIndex].getAttribute('data-action');
    executeAction(action);
}

function executeAction(action) {
    gameState.canSelectOption = false;
    
    switch(action) {
        case 'fight': showFightMenu(); break;
        case 'act': showActMenu(); break;
        case 'item': showItemMenu(); break;
        case 'mercy': attemptMercy(); break;
    }
}

function showFightMenu() {
    dialogueBox.textContent = "* Ты готовишься атаковать!";
    
    setTimeout(() => {
        const baseDamage = Math.floor(Math.random() * 31) + 30;
        const scaledDamage = Math.floor(baseDamage * (1 + gameState.turnCount * 0.05));
        dealDamageToBoss(scaledDamage);
        endPlayerTurn();
    }, 1000);
}

function showActMenu() {
    const actOptions = [
        "* Ты пытаешься поговорить с Броули...",
        "* Ты рассказываешь шутку...", 
        "* Ты пытаешься подружиться...",
        "* Ты проявляешь сочувствие..."
    ];
    
    dialogueBox.textContent = actOptions[Math.floor(Math.random() * actOptions.length)];
    gameState.mercyProgress += 25;
    
    if (gameState.mercyProgress >= gameState.maxMercyProgress) {
        setTimeout(() => {
            dialogueBox.textContent = "* БРОУЛИ становится уязвим! Его защита ослабла!";
            gameState.bossHP = 1;
        }, 1000);
    }
    
    setTimeout(endPlayerTurn, 2000);
}

function showItemMenu() {
    if (gameState.items > 0) {
        useHealingItem();
        endPlayerTurn();
    } else {
        dialogueBox.textContent = "* У тебя больше нет предметов!";
        gameState.canSelectOption = true;
    }
}

function attemptMercy() {
    if (gameState.mercyProgress >= gameState.maxMercyProgress && gameState.bossHP === 1) {
        dialogueBox.textContent = "* Ты предлагаешь пощаду... БРОУЛИ принимает ее!";
        setTimeout(victory, 2000);
    } else {
        dialogueBox.textContent = "* БРОУЛИ не хочет мириться! Еще не время!";
        setTimeout(endPlayerTurn, 1500);
    }
}

function useHealingItem() {
    gameState.items--;
    const healAmount = 40;
    gameState.playerHP = Math.min(gameState.maxPlayerHP, gameState.playerHP + healAmount);
    
    soundManager.playHeal();
    
    const healNumber = document.createElement('div');
    healNumber.className = 'heal-number';
    healNumber.textContent = '+' + healAmount;
    healNumber.style.left = (heartPosition.x - 10) + 'px';
    healNumber.style.top = (heartPosition.y - 30) + 'px';
    battleArea.appendChild(healNumber);
    
    setTimeout(() => {
        if (battleArea.contains(healNumber)) {
            battleArea.removeChild(healNumber);
        }
    }, 1000);
    
    updatePlayerHealth();
    dialogueBox.textContent = "* Ты использовал лечебный предмет! Восстановлено 40 HP.";
}

// ==================== СИСТЕМА УРОНА И ЛЕЧЕНИЯ ====================
function dealDamageToBoss(damage) {
    gameState.bossHP = Math.max(0, gameState.bossHP - damage);
    updateBossHealthBar();
    
    soundManager.playBossHit();
    
    const damageNumber = document.createElement('div');
    damageNumber.className = 'damage-number';
    damageNumber.textContent = '-' + damage;
    damageNumber.style.left = (battleAreaRect.width * 0.25) + 'px';
    damageNumber.style.top = (battleAreaRect.height * 0.2) + 'px';
    battleArea.appendChild(damageNumber);
    
    setTimeout(() => {
        if (battleArea.contains(damageNumber)) {
            battleArea.removeChild(damageNumber);
        }
    }, 1000);
    
    if (gameState.bossHP <= 0) {
        victory();
        return;
    }
    
    dialogueBox.textContent = `* Ты нанес ${damage} урона Броули!`;
}

function takeDamage(damage) {
    if (gameState.isInvulnerable) return;
    
    soundManager.playPlayerHit();
    
    gameState.playerHP = Math.max(0, gameState.playerHP - damage);
    updatePlayerHealth();
    
    gameState.isInvulnerable = true;
    gameState.canMove = false;
    if (playerHeart) {
        playerHeart.classList.add('invulnerable', 'blink');
    }
    gameContainer.classList.add('shake');
    
    setTimeout(() => {
        if (playerHeart) {
            playerHeart.classList.remove('blink');
        }
        gameContainer.classList.remove('shake');
    }, 600);
    
    setTimeout(() => gameState.canMove = true, gameState.stunDuration);
    setTimeout(() => {
        gameState.isInvulnerable = false;
        if (playerHeart) {
            playerHeart.classList.remove('invulnerable');
        }
    }, gameState.invulnerabilityDuration);
    
    if (gameState.playerHP <= 0) gameOver();
}

function updateBossHealthBar() {
    const healthPercent = (gameState.bossHP / gameState.maxBossHP) * 100;
    bossHealthFill.style.width = healthPercent + '%';
}

function updatePlayerHealth() {
    const healthPercent = (gameState.playerHP / gameState.maxPlayerHP) * 100;
    playerHealthFill.style.width = healthPercent + '%';
    playerHealthText.textContent = `HP: ${gameState.playerHP}/${gameState.maxPlayerHP}`;
}

// ==================== КОМБИНИРОВАННЫЕ АТАКИ БОССА ====================
function startBossTurn() {
    gameState.turnCount++;
    gameState.canMove = true;
    gameState.isPlayerTurn = false;
    turnIndicator.textContent = "Ход босса";
    
    const attackType = gameState.attackPatterns[
        Math.floor(Math.random() * gameState.attackPatterns.length)
    ];
    
    console.log(`🎯 ХОД БОССА #${gameState.turnCount}: ${getAttackName(attackType)}`);
    executeBossAttack(attackType);
    
    gameState.currentDialogue = (gameState.currentDialogue + 1) % gameState.dialogue.length;
    dialogueBox.textContent = gameState.dialogue[gameState.currentDialogue];
}

function getAttackName(attackType) {
    const attackNames = {
        'boneStormCombo': '💀 Костяной шторм',
        'spiralFireCombo': '🔥 Огненная спираль', 
        'lightningVortexCombo': '⚡ Молнии и вихрь',
        'meteorBombCombo': '💣 Метеоры и бомбы',
        'shadowVortexCombo': '👥 Теневые клоны',
        'timeVortexCombo': '⏰ Искажение времени',
        'ultimateChaosCombo': '💥 АБСОЛЮТНЫЙ ХАОС'
    };
    return attackNames[attackType] || attackType;
}

function executeBossAttack(attackType) {
    switch(attackType) {
        case 'boneStormCombo': boneStormCombo(); break;
        case 'spiralFireCombo': spiralFireCombo(); break;
        case 'lightningVortexCombo': lightningVortexCombo(); break;
        case 'meteorBombCombo': meteorBombCombo(); break;
        case 'shadowVortexCombo': shadowVortexCombo(); break;
        case 'timeVortexCombo': timeVortexCombo(); break;
        case 'ultimateChaosCombo': ultimateChaosCombo(); break;
    }
}

// ==================== КОМБО-АТАКИ ====================
function boneStormCombo() {
    dialogueBox.textContent = "* Костяной шторм и падающие кости!";
    
    const boneCount = 10 + Math.floor(gameState.turnCount / 3);
    
    for (let i = 0; i < boneCount; i++) {
        setTimeout(() => createHorizontalBone(i), i * 200);
    }
    
    setTimeout(() => {
        const fallingCount = 8 + Math.floor(gameState.turnCount / 4);
        for (let i = 0; i < fallingCount; i++) {
            setTimeout(() => createFallingBone(i), i * 250);
        }
    }, 2000);
    
    setTimeout(() => {
        createCrossBones();
    }, 4000);
    
    setTimeout(() => gameState.gameActive && endBossTurn(), 8000);
}

function spiralFireCombo() {
    dialogueBox.textContent = "* Огненная спираль и метеоры!";
    
    const spiralBones = [];
    const boneCount = 12 + Math.floor(gameState.turnCount / 2);
    const centerX = battleAreaRect.width / 2;
    const centerY = battleAreaRect.height / 2;
    
    for (let i = 0; i < boneCount; i++) {
        const bone = document.createElement('div');
        bone.className = 'attack bone bone-vertical';
        spiralBones.push(bone);
        battleArea.appendChild(bone);
    }
    
    let angle = 0;
    const spiralInterval = setInterval(() => {
        angle += 0.04;
        for (let i = 0; i < spiralBones.length; i++) {
            const boneAngle = angle + (i * (2 * Math.PI / spiralBones.length));
            const radius = 100 + gameState.turnCount * 3;
            spiralBones[i].style.left = centerX + radius * Math.cos(boneAngle) - 10 + 'px';
            spiralBones[i].style.top = centerY + radius * Math.sin(boneAngle) - 50 + 'px';
            
            if (checkCollision(spiralBones[i], playerHeart) && !gameState.isInvulnerable) {
                soundManager.playPlayerHit();
                takeDamage(8 + Math.floor(gameState.turnCount / 4));
            }
        }
    }, 40);
    
    setTimeout(() => {
        const fireballCount = 6 + Math.floor(gameState.turnCount / 5);
        for (let i = 0; i < fireballCount; i++) {
            setTimeout(() => createFireball(i), i * 400);
        }
    }, 3000);
    
    setTimeout(() => {
        clearInterval(spiralInterval);
        spiralBones.forEach(bone => {
            if (battleArea.contains(bone)) {
                battleArea.removeChild(bone);
            }
        });
        if (gameState.gameActive) endBossTurn();
    }, 7000);
}

function lightningVortexCombo() {
    dialogueBox.textContent = "* Молнии и смертельный вихрь!";
    
    gameState.canMove = false;
    
    const vortex = document.createElement('div');
    vortex.className = 'attack vortex';
    vortex.style.cssText = `
        position: absolute; width: 200px; height: 200px;
        background: radial-gradient(circle, transparent 30%, #8a2be2 70%, #4b0082 100%);
        border-radius: 50%; left: ${battleAreaRect.width/2 - 100}px;
        top: ${battleAreaRect.height/2 - 100}px; z-index: 6;
    `;
    battleArea.appendChild(vortex);
    
    const vortexPower = setInterval(() => {
        const dx = battleAreaRect.width/2 - heartPosition.x;
        const dy = battleAreaRect.height/2 - heartPosition.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 150 && distance > 30) {
            const force = 0.08;
            heartPosition.x += dx * force;
            heartPosition.y += dy * force;
            constrainHeartPosition();
            updateHeartPosition();
        }
    }, 50);
    
    setTimeout(() => {
        const lightningCount = 6 + Math.floor(gameState.turnCount / 3);
        for (let i = 0; i < lightningCount; i++) {
            setTimeout(() => createLightningStrike(i), i * 800);
        }
    }, 2000);
    
    setTimeout(() => {
        vortex.style.background = 'radial-gradient(circle, transparent 20%, #ff00ff 60%, #8a2be2 100%)';
        vortex.style.boxShadow = '0 0 50px #ff00ff';
    }, 5000);
    
    setTimeout(() => {
        clearInterval(vortexPower);
        if (battleArea.contains(vortex)) battleArea.removeChild(vortex);
        gameState.canMove = true;
        if (gameState.gameActive) endBossTurn();
    }, 9000);
}

function meteorBombCombo() {
    dialogueBox.textContent = "* Метеоритный дождь с бомбами!";
    
    const meteorCount = 20 + Math.floor(gameState.turnCount / 3);
    
    for (let i = 0; i < meteorCount; i++) {
        setTimeout(() => createMeteor(i), i * 300);
    }
    
    setTimeout(() => {
        const bombCount = 3 + Math.floor(gameState.turnCount / 8);
        for (let i = 0; i < bombCount; i++) {
            setTimeout(() => createTimeBomb(i), i * 2500);
        }
    }, 3000);
    
    setTimeout(() => gameState.gameActive && endBossTurn(), 8000);
}

function shadowVortexCombo() {
    dialogueBox.textContent = "* Теневые клоны и темный вихрь!";
    
    gameState.canMove = false;
    
    const vortex = document.createElement('div');
    vortex.className = 'attack vortex';
    vortex.style.cssText = `
        position: absolute; width: 250px; height: 250px;
        background: radial-gradient(circle, transparent 20%, #333 60%, #000 100%);
        border-radius: 50%; left: ${battleAreaRect.width/2 - 125}px;
        top: ${battleAreaRect.height/2 - 125}px; z-index: 6;
    `;
    battleArea.appendChild(vortex);
    
    const vortexPower = setInterval(() => {
        const dx = battleAreaRect.width/2 - heartPosition.x;
        const dy = battleAreaRect.height/2 - heartPosition.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 180 && distance > 40) {
            const force = 0.06;
            heartPosition.x += dx * force;
            heartPosition.y += dy * force;
            constrainHeartPosition();
            updateHeartPosition();
        }
    }, 50);
    
    setTimeout(() => {
        const cloneCount = 6 + Math.floor(gameState.turnCount / 4);
        const clones = [];
        
        for (let i = 0; i < cloneCount; i++) {
            const clone = document.createElement('div');
            clone.className = 'attack shadow-clone';
            clone.style.cssText = `
                position: absolute; width: 35px; height: 35px;
                background: radial-gradient(circle, #666, #333, #000);
                border-radius: 50%; z-index: 7; opacity: 0.8;
            `;
            
            const angle = (i * 2 * Math.PI / cloneCount);
            const distance = 180;
            clone.style.left = (heartPosition.x + Math.cos(angle) * distance - 17) + 'px';
            clone.style.top = (heartPosition.y + Math.sin(angle) * distance - 17) + 'px';
            
            battleArea.appendChild(clone);
            clones.push(clone);
            animateShadowClone(clone, heartPosition.x, heartPosition.y, 3000, 10);
        }
        
        setTimeout(() => {
            clones.forEach(clone => {
                if (battleArea.contains(clone)) {
                    battleArea.removeChild(clone);
                }
            });
        }, 5000);
        
    }, 2000);
    
    setTimeout(() => {
        clearInterval(vortexPower);
        if (battleArea.contains(vortex)) battleArea.removeChild(vortex);
        gameState.canMove = true;
        if (gameState.gameActive) endBossTurn();
    }, 8000);
}

function timeVortexCombo() {
    dialogueBox.textContent = "* Искажение времени и пространства!";
    
    gameState.canMove = false;
    
    const originalSpeed = 10;
    window.addEventListener('keydown', handleSlowMotion);
    
    const vortex = document.createElement('div');
    vortex.className = 'attack vortex';
    vortex.style.cssText = `
        position: absolute; width: 220px; height: 220px;
        background: radial-gradient(circle, transparent 25%, #00ffff 65%, #0088ff 100%);
        border-radius: 50%; left: ${battleAreaRect.width/2 - 110}px;
        top: ${battleAreaRect.height/2 - 110}px; z-index: 6;
    `;
    battleArea.appendChild(vortex);
    
    setTimeout(() => {
        const bombCount = 4 + Math.floor(gameState.turnCount / 6);
        for (let i = 0; i < bombCount; i++) {
            setTimeout(() => createTimeBomb(i), i * 1200);
        }
    }, 2000);
    
    setTimeout(() => {
        window.removeEventListener('keydown', handleSlowMotion);
        if (battleArea.contains(vortex)) battleArea.removeChild(vortex);
        gameState.canMove = true;
        if (gameState.gameActive) endBossTurn();
    }, 9000);
    
    function handleSlowMotion(e) {
        if (!gameState.gameActive || !gameState.canMove) return;
        
        const slowFactor = 0.4;
        switch(e.key) {
            case 'ArrowLeft': heartPosition.x -= originalSpeed * slowFactor; break;
            case 'ArrowRight': heartPosition.x += originalSpeed * slowFactor; break;
            case 'ArrowUp': heartPosition.y -= originalSpeed * slowFactor; break;
            case 'ArrowDown': heartPosition.y += originalSpeed * slowFactor; break;
        }
        constrainHeartPosition();
        updateHeartPosition();
    }
}

function ultimateChaosCombo() {
    dialogueBox.textContent = "* АБСОЛЮТНЫЙ ХАОС! Беги, если можешь!";
    
    gameState.canMove = false;
    
    const vortex = document.createElement('div');
    vortex.className = 'attack vortex';
    vortex.style.cssText = `
        position: absolute; width: 300px; height: 300px;
        background: radial-gradient(circle, transparent 15%, #ff0000 50%, #8b0000 100%);
        border-radius: 50%; left: ${battleAreaRect.width/2 - 150}px;
        top: ${battleAreaRect.height/2 - 150}px; z-index: 6;
        animation: vortexSpin 2s linear infinite;
    `;
    battleArea.appendChild(vortex);
    
    const vortexPower = setInterval(() => {
        const dx = battleAreaRect.width/2 - heartPosition.x;
        const dy = battleAreaRect.height/2 - heartPosition.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 200 && distance > 50) {
            const force = 0.1;
            heartPosition.x += dx * force;
            heartPosition.y += dy * force;
            constrainHeartPosition();
            updateHeartPosition();
        }
        
        if (distance <= 50 && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(5);
        }
    }, 100);
    
    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => createMeteor(i), i * 500);
        }
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => createLightningStrike(i), i * 700);
        }
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createFireball(i), i * 600);
        }
        
        const cloneCount = 8;
        const clones = [];
        for (let i = 0; i < cloneCount; i++) {
            const clone = document.createElement('div');
            clone.className = 'attack shadow-clone';
            clone.style.cssText = `
                position: absolute; width: 30px; height: 30px;
                background: radial-gradient(circle, #ff0000, #8b0000, #000);
                border-radius: 50%; z-index: 7; opacity: 0.9;
            `;
            
            const angle = (i * 2 * Math.PI / cloneCount);
            const distance = 220;
            clone.style.left = (battleAreaRect.width/2 + Math.cos(angle) * distance - 15) + 'px';
            clone.style.top = (battleAreaRect.height/2 + Math.sin(angle) * distance - 15) + 'px';
            
            battleArea.appendChild(clone);
            clones.push(clone);
            animateShadowClone(clone, heartPosition.x, heartPosition.y, 4000, 8);
        }
        
        setTimeout(() => {
            clones.forEach(clone => {
                if (battleArea.contains(clone)) {
                    battleArea.removeChild(clone);
                }
            });
        }, 5000);
        
    }, 1000);
    
    setTimeout(() => {
        clearInterval(vortexPower);
        if (battleArea.contains(vortex)) battleArea.removeChild(vortex);
        gameState.canMove = true;
        if (gameState.gameActive) endBossTurn();
    }, 10000);
}

// ==================== БАЗОВЫЕ КОМПОНЕНТЫ АТАК ====================
function createHorizontalBone(index) {
    const bone = document.createElement('div');
    bone.className = 'attack bone bone-horizontal';
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const y = BOUNDARY_MARGIN + 20 + Math.random() * (battleAreaRect.height - BOUNDARY_MARGIN * 2 - 40);
    
    bone.style.left = side === 'left' ? '0px' : (battleAreaRect.width - 100) + 'px';
    bone.style.top = y + 'px';
    battleArea.appendChild(bone);
    
    animateBone(bone, side, 2500, 8 + Math.floor(gameState.turnCount / 5));
}

function createFallingBone(index) {
    const bone = document.createElement('div');
    bone.className = 'attack bone bone-vertical';
    bone.style.left = BOUNDARY_MARGIN + Math.random() * (battleAreaRect.width - BOUNDARY_MARGIN * 2 - 20) + 'px';
    bone.style.top = '-100px';
    battleArea.appendChild(bone);
    
    animateFallingBone(bone, 2000, 10 + Math.floor(gameState.turnCount / 4));
}

function createCrossBones() {
    const bones = [];
    const count = 5 + Math.floor(gameState.turnCount / 6);
    
    for (let i = 0; i < count; i++) {
        const hBone = document.createElement('div');
        hBone.className = 'attack bone bone-horizontal';
        hBone.style.width = '80px';
        hBone.style.left = (i * battleAreaRect.width / (count - 1) - 40) + 'px';
        hBone.style.top = (battleAreaRect.height / 2 - 10) + 'px';
        bones.push(hBone);
        battleArea.appendChild(hBone);
        
        const vBone = document.createElement('div');
        vBone.className = 'attack bone bone-vertical';
        vBone.style.height = '80px';
        vBone.style.left = (battleAreaRect.width / 2 - 10) + 'px';
        vBone.style.top = (i * battleAreaRect.height / (count - 1) - 40) + 'px';
        bones.push(vBone);
        battleArea.appendChild(vBone);
    }
    
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
        bones.forEach(bone => {
            bone.style.opacity = pulseCount % 2 === 0 ? '1' : '0.3';
            if (pulseCount % 2 === 0 && checkCollision(bone, playerHeart) && !gameState.isInvulnerable) {
                soundManager.playPlayerHit();
                takeDamage(6 + Math.floor(gameState.turnCount / 6));
            }
        });
        pulseCount++;
    }, 500);
    
    setTimeout(() => {
        clearInterval(pulseInterval);
        bones.forEach(bone => {
            if (battleArea.contains(bone)) {
                battleArea.removeChild(bone);
            }
        });
    }, 3000);
}

function createFireball(index) {
    const fireball = document.createElement('div');
    fireball.className = 'attack fire-ball';
    fireball.style.cssText = `
        width: 25px; height: 25px; background: radial-gradient(circle, #ff6b00, #ff0000);
        border-radius: 50%; position: absolute; box-shadow: 0 0 15px #ff4400; z-index: 7;
    `;
    
    const startY = BOUNDARY_MARGIN + index * 70;
    fireball.style.left = '-40px';
    fireball.style.top = startY + 'px';
    battleArea.appendChild(fireball);
    
    animateFireball(fireball, startY, 2500);
}

function createLightningStrike(index) {
    const warning = document.createElement('div');
    warning.className = 'attack lightning-warning';
    warning.style.cssText = `
        position: absolute; width: 8px; height: 80px;
        background: linear-gradient(to bottom, #ffff00, #ffaa00);
        box-shadow: 0 0 15px #ffff00; z-index: 6;
        left: ${BOUNDARY_MARGIN + Math.random() * (battleAreaRect.width - BOUNDARY_MARGIN * 2)}px;
        top: -80px; animation: blink 0.2s infinite;
    `;
    battleArea.appendChild(warning);
    
    setTimeout(() => {
        if (battleArea.contains(warning)) battleArea.removeChild(warning);
        
        const lightning = document.createElement('div');
        lightning.className = 'attack lightning';
        lightning.style.cssText = `
            position: absolute; width: 12px; height: 250px;
            background: linear-gradient(to bottom, #00ffff, #0088ff, #00ffff);
            box-shadow: 0 0 25px #00ffff; z-index: 7;
            left: ${parseInt(warning.style.left)}px; top: -250px;
        `;
        battleArea.appendChild(lightning);
        
        animateLightning(lightning, 400, 15 + Math.floor(gameState.turnCount / 3));
    }, 800);
}

function createMeteor(index) {
    const meteor = document.createElement('div');
    meteor.className = 'attack meteor';
    meteor.style.cssText = `
        width: 35px; height: 35px; background: radial-gradient(circle, #ff4400, #ff0000, #8b0000);
        border-radius: 50%; position: absolute; box-shadow: 0 0 25px #ff4400; z-index: 8;
    `;
    
    const startX = BOUNDARY_MARGIN + Math.random() * (battleAreaRect.width - BOUNDARY_MARGIN * 2);
    meteor.style.left = startX + 'px';
    meteor.style.top = '-20px';
    battleArea.appendChild(meteor);
    
    animateMeteor(meteor, 3000, 20 + Math.floor(gameState.turnCount / 3));
}

function createTimeBomb(index) {
    const minX = BOUNDARY_MARGIN + 50;
    const maxX = battleAreaRect.width - BOUNDARY_MARGIN - 50;
    const minY = BOUNDARY_MARGIN + 50;
    const maxY = battleAreaRect.height - BOUNDARY_MARGIN - 50;
    
    const bombX = minX + Math.random() * (maxX - minX);
    const bombY = minY + Math.random() * (maxY - minY);
    
    const bomb = document.createElement('div');
    bomb.className = 'attack time-bomb';
    bomb.textContent = '3';
    bomb.style.cssText = `
        position: absolute; width: 60px; height: 60px; background: #333;
        border: 3px solid #fff; border-radius: 50%; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: bold; z-index: 9;
        left: ${bombX - 30}px; top: ${bombY - 30}px;
        animation: pulse 0.8s infinite;
    `;
    battleArea.appendChild(bomb);
    
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        countdown--;
        bomb.textContent = countdown;
        bomb.style.background = countdown <= 1 ? '#ff0000' : '#333';
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            createExplosion(bombX, bombY, 35 + Math.floor(gameState.turnCount / 4));
            if (battleArea.contains(bomb)) battleArea.removeChild(bomb);
        }
    }, 1000);
    
    setTimeout(() => {
        if (battleArea.contains(bomb)) battleArea.removeChild(bomb);
    }, 4000);
}

function createExplosion(x, y, damage) {
    const explosion = document.createElement('div');
    explosion.className = 'attack explosion';
    const explosionSize = 300;
    explosion.style.cssText = `
        position: absolute; width: ${explosionSize}px; height: ${explosionSize}px;
        background: radial-gradient(circle, #ff4400, #ff0000, transparent 70%);
        border-radius: 50%; left: ${x - explosionSize/2}px; top: ${y - explosionSize/2}px;
        z-index: 8; animation: explode 0.6s forwards;
        pointer-events: none;
    `;
    battleArea.appendChild(explosion);
    
    const explosionRadius = 150;
    const heartRadius = 8;
    const increasedDamage = damage + 5;
    
    let startTime = Date.now();
    const explosionDuration = 600;
    const collisionCheck = setInterval(() => {
        if (!gameState.gameActive || !battleArea.contains(explosion)) {
            clearInterval(collisionCheck);
            return;
        }
        
        const dx = x - heartPosition.x;
        const dy = y - heartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < explosionRadius + heartRadius && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(increasedDamage);
            clearInterval(collisionCheck);
        }
        
        if (Date.now() - startTime > explosionDuration) {
            clearInterval(collisionCheck);
        }
    }, 50);
    
    setTimeout(() => {
        if (battleArea.contains(explosion)) battleArea.removeChild(explosion);
    }, 600);
}

// ==================== АНИМАЦИИ ====================
function animateBone(bone, side, duration, damage) {
    let startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        bone.style.left = side === 'left' ? 
            (progress * battleAreaRect.width) + 'px' : 
            (battleAreaRect.width - 100 - progress * battleAreaRect.width) + 'px';
        
        if (checkCollision(bone, playerHeart) && !gameState.isInvulnerable) {
            takeDamage(damage);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (battleArea.contains(bone)) battleArea.removeChild(bone);
        }
    }
    animate();
}

function animateFallingBone(bone, duration, damage) {
    let startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        bone.style.top = (-100 + progress * (battleAreaRect.height + 100)) + 'px';
        
        if (checkCollision(bone, playerHeart) && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(damage);
        }
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (battleArea.contains(bone)) battleArea.removeChild(bone);
        }
    }
    animate();
}

function animateFireball(fireball, startY, duration) {
    let startTime = Date.now();
    const amplitude = 60;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress >= 1) {
            if (battleArea.contains(fireball)) battleArea.removeChild(fireball);
            return;
        }
        
        const x = progress * (battleAreaRect.width + 80);
        const y = startY + Math.sin(progress * Math.PI * 3) * amplitude;
        fireball.style.left = (x - 12) + 'px';
        fireball.style.top = (y - 12) + 'px';
        
        if (checkCollision(fireball, playerHeart) && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(12 + Math.floor(gameState.turnCount / 4));
            if (battleArea.contains(fireball)) battleArea.removeChild(fireball);
            return;
        }
        
        requestAnimationFrame(animate);
    }
    animate();
}

function animateLightning(lightning, duration, damage) {
    let startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        lightning.style.top = (-250 + progress * (battleAreaRect.height + 250)) + 'px';
        
        if (checkCollision(lightning, playerHeart) && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(damage);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (battleArea.contains(lightning)) battleArea.removeChild(lightning);
        }
    }
    animate();
}

function animateMeteor(meteor, duration, damage) {
    let startTime = Date.now();
    const startX = parseInt(meteor.style.left);
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        meteor.style.top = (-20 + progress * (battleAreaRect.height + 20)) + 'px';
        meteor.style.left = startX + 'px';
        
        if (checkCollision(meteor, playerHeart) && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(damage);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (battleArea.contains(meteor)) battleArea.removeChild(meteor);
        }
    }
    animate();
}

function animateShadowClone(clone, targetX, targetY, duration, damage) {
    let startTime = Date.now();
    const startX = parseInt(clone.style.left) + 17;
    const startY = parseInt(clone.style.top) + 17;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        
        clone.style.left = (currentX - 17) + 'px';
        clone.style.top = (currentY - 17) + 'px';
        
        if (checkCollision(clone, playerHeart) && !gameState.isInvulnerable) {
            soundManager.playPlayerHit();
            takeDamage(damage);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function checkCollision(element1, element2) {
    if (!element1 || !element2) return false;
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return !(rect1.right < rect2.left || rect1.left > rect2.right || 
             rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

function endBossTurn() {
    gameState.canMove = true;
    gameState.isPlayerTurn = true;
    turnIndicator.textContent = "Твой ход";
    
    if (gameState.difficulty < 25) {
        gameState.difficulty += 0.5;
    }
    
    dialogueBox.textContent = "* Что будешь делать?";
    
    setTimeout(() => gameState.canSelectOption = true, 500);
}

function endPlayerTurn() {
    setTimeout(() => {
        gameState.isPlayerTurn = false;
        turnIndicator.textContent = "Ход Броули";
        startBossTurn();
    }, 1000);
}

function gameOver() {
    gameState.gameActive = false;
    gameState.canMove = false;
    gameOverScreen.style.display = 'flex';
    console.log('💀 ИГРА ОКОНЧЕНА: Вы проиграли!');
}

function victory() {
    gameState.gameActive = false;
    gameState.canMove = false;
    victoryScreen.style.display = 'flex';
    console.log('🎉 ПОБЕДА: Броули побежден!');
}

function restartGame() {
    gameState.playerHP = 100;
    gameState.bossHP = 800;
    gameState.maxBossHP = 800;
    gameState.isPlayerTurn = false;
    gameState.currentDialogue = 0;
    gameState.gameActive = true;
    gameState.difficulty = 5;
    gameState.items = 3;
    gameState.mercyProgress = 0;
    gameState.canSelectOption = true;
    gameState.canMove = true;
    gameState.isInvulnerable = false;
    gameState.turnCount = 0;
    
    if (playerHeart) {
        playerHeart.classList.remove('invulnerable');
    }
    gameOverScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
    
    updateBossHealthBar();
    updatePlayerHealth();
    
    heartPosition.x = battleAreaRect.width / 2;
    heartPosition.y = battleAreaRect.height / 2;
    constrainHeartPosition();
    updateHeartPosition();
    
    document.querySelectorAll('.attack').forEach(attack => {
        if (attack.parentNode) {
            attack.parentNode.removeChild(attack);
        }
    });
    
    console.log('🔄 ИГРА ПЕРЕЗАПУЩЕНА');
    startBossTurn();
}

// ==================== ИНИЦИАЛИЗАЦИЯ ИГРЫ ====================
window.addEventListener('resize', () => {
    battleAreaRect = battleArea.getBoundingClientRect();
    constrainHeartPosition();
    updateHeartPosition();
});

// Инициализация кнопок действий
setupActionButtons();

// Инициализация кнопок скачивания
setupDownloadButtons();

constrainHeartPosition();
updateHeartPosition();
updateOptionSelection();
updatePlayerHealth();
updateBossHealthBar();

setTimeout(() => {
    if (!soundManager.isAudioEnabled) {
        dialogueBox.textContent = "* Нажмите на экран или клавишу для включения звука!";
    }
}, 1000);

setTimeout(() => {
    startBossTurn();
}, 2000);

console.log('🎮 Игра загружена с КОМБИНИРОВАННЫМИ АТАКАМИ и системой скачивания!');
