'use strict';

// ---- Código La Soga, proyecto Lengua y Literatura ----

// Constantes
const root = document.getElementById('root');
const playButton = document.getElementById('play-button');
const mainTitle = document.getElementById('main-title');
const nameSelection = document.getElementById('name-selection');
const nextButtonNameSelection = document.querySelector('.name-selection-button');
const dialogScreen = document.getElementById('dialog');
const levelSelector = document.getElementById('level-selector');
const levelSelectorBox = document.getElementById('level-selector-box');
const gameElement = document.getElementById('game');
const dataElement = document.querySelector('.data');
const timerElement = document.querySelector('.timer');
const timeElement = document.getElementById('time');
const healthBar = document.querySelector('.health-bar');
const healthBarFill = document.querySelector('.health-bar-fill');
const gameModal = document.getElementById('game-modal');
const gameModalTitle = document.querySelector('.game-modal-title');
const gameModalPlayAgainButton = document.getElementById('game-modal-play-again-button');
const gameModalBackTitleButton = document.getElementById('game-modal-back-title-button');
const effectsMask = document.getElementById('effects-mask');
const backButtonLevelSelector = document.getElementById('level-selector-back-button');
const infoPopUp = document.getElementById('info-pop-up');

const boxSize = 32;
const gameDelay = 200;
const playerAnimationTime = 200;
const maxHealth = 100;
const wallColor = '#000';
const floorColor = '#666';
const playerColor = '#E8AD31';
const winColor = '#0c0';
const loseColor = '#a00';

const keys = {};

const playerSprites = document.getElementById('player-sprites');
const itemsTileset = document.getElementById('items-tileset');

// Enums
const DIRECTIONS = {
  DOWN: 0,
  LEFT: 1,
  UP: 2,
  RIGHT: 3
}
const SCREENS = {
  MAIN_TITLE: mainTitle,
  DIALOG: dialogScreen
}

// Variables
let playerName = '';
let playerSpeed = 2.5;
let playerDirection = DIRECTIONS.DOWN;
let playerObj, snakeObj;
let health = 100;
let actualLevelObj, actualLevelArr;
let timeInterval;
let levelDimensions = [10, 10];
let levelScreen = 0;
let levelInitAction = () => void 0;
let levelFinalAction = () => void 0;
let timer = 0;
let dialogQuery = 0;
let inGameObj = [];
let currentScreen = SCREENS.MAIN_TITLE;
let snakeDelay = 200;
let bulletSpeedBase = 5;
let bulletSpeedVariation = 6;
let bulletDamage = 20;

let hasSeenIntroduction = false;
let isSnakeGreen = false;



// Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
updateCanvasDimensions([320, 320]);



// Objetos del juego
class GameObject {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  destroyObj() {
    const index = inGameObj.indexOf(this);
    inGameObj.splice(index, 1);
  }
}

class Player extends GameObject {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.innerClock = 1;
    setInterval(() => this.changeAnimationFrame(), playerAnimationTime);
  }

  checkCollision(checks) {
    // Chequea lista de comprobaciones a base de [x + checkX, y + checkY]
    // Toma valores en el coord system del juego
    return checks.every(coords => {
      const [cx, cy] = coords;
      const tileX = Math.floor(this.x + cx);
      const tileY = Math.floor(this.y + cy);
      return actualLevelArr[tileY][tileX] !== 1;
    });
  }
  update(deltaTime) {
    playerSpeed = ((keys['m']) ? 5 : 3) / boxSize;

    const prevX = Math.floor(this.x);
    const prevY = Math.floor(this.y);
    const midYDif = (this.h / boxSize) / 2;
    const bottomDif = this.h / boxSize;
    const rightDif = this.w / boxSize;

    if (keys['d'] && this.checkCollision([[playerSpeed + rightDif, 0], [playerSpeed + rightDif, midYDif], [playerSpeed + rightDif, bottomDif]])) {
      this.x += playerSpeed * boxSize * deltaTime;
      playerDirection = DIRECTIONS.RIGHT;
      if (Math.floor(this.x) > prevX && snakeObj) snakeObj.queueAdd(Math.floor(this.x), Math.floor(this.y));
    }
    if (keys['a'] && this.checkCollision([[-playerSpeed, 0], [-playerSpeed, midYDif], [-playerSpeed, bottomDif]])) {
      this.x -= playerSpeed * boxSize * deltaTime;
      playerDirection = DIRECTIONS.LEFT;
      if (Math.floor(this.x) < prevX && snakeObj) snakeObj.queueAdd(Math.floor(this.x), Math.floor(this.y));
    }
    if (keys['w'] && this.checkCollision([[0, -playerSpeed], [rightDif, -playerSpeed]])) {
      this.y -= playerSpeed * boxSize * deltaTime;
      playerDirection = DIRECTIONS.UP;
      if (Math.floor(this.y) < prevY && snakeObj) snakeObj.queueAdd(Math.floor(this.x), Math.floor(this.y));
    }
    if (keys['s'] && this.checkCollision([[0, playerSpeed + bottomDif], [rightDif, playerSpeed + bottomDif]])) {
      this.y += playerSpeed * boxSize * deltaTime;
      playerDirection = DIRECTIONS.DOWN;
      if (Math.floor(this.y) > prevY && snakeObj) snakeObj.queueAdd(Math.floor(this.x), Math.floor(this.y));
    }
  }
  draw() {
    const moving = (keys['d'] || keys['a'] || keys['w'] || keys['s']);
    drawSprite(
      playerSprites,
      this.x * boxSize,
      this.y * boxSize,
      this.w, this.h,
      (moving) ? (16 * this.innerClock) : 0, playerDirection * 24,
      16, 24
    );
  }
  changeAnimationFrame() {
    this.innerClock = (this.innerClock === 1) ? 2 : 1;
  }
}

class Collectable extends GameObject {
  constructor(x, y, w, h, action) {
    super(x, y, w, h);
    this.right = this.x + (this.w / boxSize);
    this.bottom = this.y + (this.h / boxSize);
    this.action = action;
  }

  update() {
    const playerRight = playerObj.x + (playerObj.w / boxSize);
    const playerBottom = playerObj.y + (playerObj.h / boxSize);
    if (
      playerObj.x <= this.right && playerRight >= this.x &&
      playerObj.y <= this.bottom && playerBottom >= this.y
    ) {
      this.action();
      this.destroyObj();
    }
  }
  draw() {
    drawSprite(
      itemsTileset,
      this.x * boxSize, this.y * boxSize,
      this.w, this.h,
      0, 0, 26, 26
    );
  }
}

class Bullet extends GameObject {
  constructor(x, y, w, h, direction, speed) {
    super(x, y, w, h);
    this.direction = direction;
    this.speed = speed;
    this.angle = 0;
    this.factorX = Math.cos(this.direction);
    this.factorY = Math.sin(this.direction);
  }

  update(deltaTime) {
    const playerRight = playerObj.x + (playerObj.w / boxSize);
    const playerBottom = playerObj.y + (playerObj.h / boxSize);
    this.x += this.speed * this.factorX * deltaTime;
    this.y += this.speed * this.factorY * deltaTime;
    if (this.y * boxSize > canvas.height || this.y * boxSize < 0) deleteGameInstance(this);
    this.angle += this.speed * deltaTime;
    if (
      playerObj.x <= this.x + this.w / boxSize / 2 && playerRight >= this.x + this.w / boxSize / 2 &&
      playerObj.y <= this.y + this.h / boxSize / 2 && playerBottom >= this.y + this.w / boxSize / 2
    ) {
      setHealth(health - bulletDamage);
      deleteGameInstance(this);
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x * boxSize + this.w / 2, this.y * boxSize + this.h / 2);
    ctx.rotate(this.angle);
    drawSprite(
      itemsTileset,
      -this.w / 2, -this.h / 2,
      this.w, this.h,
      26, (isSnakeGreen) ? 26 : 0, 26, 26
    );
    ctx.restore();
  }
}

class Snake extends GameObject {
  constructor(x, y, w, h, initQueue) {
    super(x, y, w, h);
    this.queue = [...initQueue];
    this.queuePosition = 0;
    this.charge = 0;
  }
  update() {
    this.charge++;
    if (this.charge >= snakeDelay) {
      this.charge = 0;
      this.queuePosition++;
      addGameInstance(SnakeTrail, [this.x, this.y, this.w, this.h, this.queuePosition - 1]);
      if (!this.queue[this.queuePosition]) return;
      this.x = this.queue[this.queuePosition][0];
      this.y = this.queue[this.queuePosition][1];
    }
  }
  queueAdd(x, y) {
    this.queue.push([x, y]);
  }
  draw() {
    drawSprite(
      itemsTileset,
      this.x * boxSize, this.y * boxSize,
      this.w, this.h,
      26, (isSnakeGreen) ? 26 : 0, 26, 26
    );
  }
}

class SnakeTrail extends GameObject {
  constructor(x, y, w, h, queuePos) {
    super(x, y, w, h);

    const spritePos = {
      x: 0,
      y: 0
    }
    const prevPos = (snakeObj.queue[queuePos-1]) ? snakeObj.queue[queuePos-1] : [snakeObj.queue[queuePos][0] - 1, snakeObj.queue[queuePos][1]];
    const pos = snakeObj.queue[queuePos];
    const nextPos = snakeObj.queue[queuePos+1];
    if (!nextPos) {
      deleteGameInstance(this);
      gameLose();
      return;
    }
    // Chequea horizontales
    if (prevPos[1] === pos[1] && pos[1] === nextPos[1]) spritePos.x = 104;
    else if (prevPos[1] === pos[1] && pos[0] === nextPos[0]) {
      if (prevPos[0] < pos[0]) spritePos.x = 78;
      else spritePos.x = 52;
      if (nextPos[1] < pos[1]) spritePos.y = 26;
    }

    // Chequea verticales
    if (prevPos[0] === pos[0] && pos[0] === nextPos[0]) { spritePos.x = 104; spritePos.y = 26; }
    else if (prevPos[0] === pos[0] && pos[1] === nextPos[1]) {
      if (nextPos[0] > pos[0]) spritePos.x = 52;
      else spritePos.x = 78;
      if (prevPos[1] < pos[1]) spritePos.y = 26;
    }

    this.sprite = spritePos;
  }
  update() {
    const playerRight = playerObj.x + (playerObj.w / boxSize);
    const playerBottom = playerObj.y + (playerObj.h / boxSize);
    if (
      playerObj.x <= this.x + this.w / boxSize / 2 && playerRight >= this.x + this.w / boxSize / 2 &&
      playerObj.y <= this.y + this.h / boxSize / 2 && playerBottom >= this.y + this.w / boxSize / 2
    ) {
      gameLose();
    }
  }
  draw() {
    if (!this.sprite) return;
    drawSprite(
      itemsTileset,
      this.x * boxSize, this.y * boxSize,
      this.w, this.h,
      this.sprite.x, this.sprite.y + ((isSnakeGreen) ? 52 : 0), 26, 26
    );
  }
}


// Eventos de menús
const playButtonAction = () => {
  if (hasSeenIntroduction) {
    updateLevelSelectorLevels();
    fadeScreen(mainTitle, levelSelector);
  } else {
    fadeScreen(mainTitle, nameSelection);
    setTimeout(() => window.addEventListener('keydown', enterNextButtonNSAction), 500);
  }
}
const enterNextButtonNSAction = (ev) => { if (ev.key === 'Enter') nextButtonNSAction(); }
const nextButtonNSAction = () => {
  const nameInput = document.querySelector('.name-selection-input');
  playerName = nameInput.value;
  hasSeenIntroduction = true;
  updateLevelSelectorLevels();
  setStory();
  window.removeEventListener('keydown', enterNextButtonNSAction);
  initMainDialog(STORY.introduction, nameSelection, () => fadeScreen(dialogScreen, levelSelector));
}
const backLevelSelectorButtonAction = () => fadeScreen(levelSelector, mainTitle);
const playAgainAction = () => {
  fadeScreen(gameElement, gameElement);
  setTimeout(() => {
    gameRestart();
    gameModal.style.display = 'none';
  }, 500);
}
const backTitleAction = () => {
  gameClose();
  root.classList.remove('root-in-game');
  fadeScreen(gameElement, levelSelector);
  setTimeout(() => gameModal.style.display = 'none', 500);
}

function updateLevelSelectorLevels() {
  levelSelectorBox.innerHTML = '';
  const levelElements = document.createDocumentFragment();
  const keys = Object.keys(levels);
  keys.forEach((key, i) => {
    const l = document.createElement('button');
    l.type = 'button';
    l.classList.add('level');

    const levelUnlocked = (levels[keys[i] - 1]) ? levels[keys[i] - 1].completed : true;
    if (levelUnlocked) {
      // Nivel desbloqueado
      const text = (parseInt(key) + 1).toString();
      l.innerText = (key < 9) ? `0${text}` : text;
      const lT = document.createElement('div');
      lT.classList.add('level-tooltip');
      lT.innerText = levels[key].name;
      l.appendChild(lT);
      l.addEventListener('click', () => selectLevel(levels[key]));
    } else {
      // Nivel bloqueado
      l.classList.add('level-locked');
      const levelIcon = document.createElement('img');
      levelIcon.classList.add('level-locked-icon');
      levelIcon.src = './src/lock.svg';
      levelIcon.alt = 'unlocked';
      l.appendChild(levelIcon);
    }

    levelElements.appendChild(l);
  });
  levelSelectorBox.appendChild(levelElements);
}
function selectLevel(level) {
  setLevel(level);
  if (actualLevelObj.dialog === null) {
    fadeScreen(levelSelector, gameElement);
    gameInit();
  } else {
    initMainDialog(STORY[actualLevelObj.dialog], levelSelector, () => {
      fadeScreen(dialogScreen, gameElement);
      gameInit();
    });
  }
}

function addMenusButtonActions() {
  playButton.addEventListener('click', playButtonAction);
  nextButtonNameSelection.addEventListener('click', nextButtonNSAction);
  backButtonLevelSelector.addEventListener('click', backLevelSelectorButtonAction);
  gameModalPlayAgainButton.addEventListener('click', playAgainAction);
  gameModalBackTitleButton.addEventListener('click', backTitleAction);
}
addMenusButtonActions();
function removeMenusButtonActions() {
  playButton.removeEventListener('click', playButtonAction);
  nextButtonNameSelection.removeEventListener('click', nextButtonNSAction);
  backButtonLevelSelector.removeEventListener('click', backLevelSelectorButtonAction);
  gameModalPlayAgainButton.removeEventListener('click', playAgainAction);
  gameModalBackTitleButton.removeEventListener('click', backTitleAction);
  // todo remove level ev listeners
}


// Efectos
function fadeScreen(prevScreen, newScreen, time = 0.5) {
  removeMenusButtonActions();
  prevScreen.style.animation = `${time}s ease forwards fadeOut`;
  setTimeout(() => {
    prevScreen.style.display = 'none';
    prevScreen.style.animation = '';
    newScreen.style.animation = `${time}s ease fadeIn`;
    newScreen.style.display = 'flex';
    addMenusButtonActions();
  }, 1000 * time);
}



// Funciones del canvas
function drawSquare(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function drawSprite(spritesheet, x, y, w, h, xs, ys, ws, hs) {
  ctx.drawImage(spritesheet, xs, ys, ws, hs, x, y, w, h);
}
function updateCanvasDimensions(dim) {
  canvas.style.width = dim[0];
  canvas.style.height = dim[1];
  canvas.width = dim[0];
  canvas.height = dim[1];
  ctx.imageSmoothingEnabled = false;
}

// Funciones del juego
function drawMap(level) {
  // Dibuja el mapa dado un array de nivel
  for (let i = 0; i < level.length; i++) {
    const row = level[i];
    for (let j = 0; j < row.length; j++) {
      const bit = level[i][j];
      drawSquare(
        boxSize * j,
        boxSize * i,
        boxSize, boxSize,
        (bit === 0) ? floorColor : wallColor
      );
    }
  }
}
function setLevel(level) {
  // Establece las distintas variables para comenzar un nivel
  actualLevelObj = level;
  actualLevelArr = actualLevelObj.screens[levelScreen];
  levelDimensions = [actualLevelArr[0].length, actualLevelArr.length];
  levelInitAction = actualLevelObj.initAction;
  levelFinalAction = actualLevelObj.finalAction;
}
function changeLevelScreen(newScreen) {
  levelScreen = newScreen;
  setLevel(actualLevelObj);
}
function createLevelObjects() {
  const objects = actualLevelObj.objects;
  objects.forEach(obj => {
    const newObj = new obj[0](...obj[1]);
    inGameObj.push(newObj);
  });
}
function appearPopup(text, query) {
  if (dialogQuery !== query) return;
  infoPopUp.innerText = text;
  infoPopUp.style.display = 'flex';
  infoPopUp.style.animation = '1s ease forwards appearPopup';
  setTimeout(() => {
    if (dialogQuery !== query) return;
    infoPopUp.style.animation = '';
  }, 1000);
}
function disappearPopup(query) {
  if (dialogQuery !== query) return;
  infoPopUp.style.animation = '1s ease forwards disappearPopup';
  setTimeout(() => {
    if (dialogQuery !== query) return;
    infoPopUp.style.display = 'none';
    infoPopUp.style.animation = '';
  }, 1000);
}
function appearGameModal(text, secondButtonText = 'Volver atrás') {
  gameModalTitle.innerText = text;
  gameModalBackTitleButton.innerText = secondButtonText;
  canvas.style.filter = 'brightness(20%)';
  gameModal.style.display = 'flex';
  gameModal.style.animation = '1s ease appearModal';
}

// Main loop del juego
let isInGame = false;
let lastTime = -1;
function gameLoop(timeStamp) {
  if (lastTime == -1) lastTime = timeStamp - 1; // Fixes pauses and time problems
  const deltaTime = (timeStamp - lastTime) / 1000;
  lastTime = timeStamp;
  updateAndDraw(deltaTime);
  if (isInGame) requestAnimationFrame(gameLoop);
}
function updateAndDraw(deltaTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(actualLevelArr);
  inGameObj.forEach(obj => {
    obj.update(deltaTime);
    obj.draw();
  });
}
function gameInit() {
  updateCanvasDimensions([levelDimensions[0] * boxSize, levelDimensions[1] * boxSize]);
  activeKeyInput();
  const playerInitPosition = actualLevelObj.initPosition;
  playerObj = new Player(playerInitPosition[0], playerInitPosition[1], boxSize, boxSize + boxSize / 2);
  inGameObj.push(playerObj);
  createLevelObjects();
  levelInitAction();
  isInGame = true;
  requestAnimationFrame(gameLoop);
  setTimeout(() => {
    setHealth(maxHealth);
    root.classList.add('root-in-game');
  }, 1000);
}
function addGameInstance(cl, args) {
  const obj = new cl(...args);
  inGameObj.push(obj);
}
function deleteGameInstance(obj) {
  const index = inGameObj.indexOf(obj);
  inGameObj.splice(index, 1);
}
function setTime(t) {
  timer = t;
  timeElement.innerText = timer;
  timeInterval = setInterval(timerAction, 1000);
}
function timerAction() {
  timer--;
  timeElement.innerText = timer;
  if (timer <= 0) gameWin();
}
function gameWin() {
  clearInterval(timeInterval);
  clearInterval(inGameEnemyInterval);
  isInGame = false;
  actualLevelObj.completed = true;
  appearGameModal('Nivel completado', 'Siguiente');
}
function gameLose() {
  clearInterval(timeInterval);
  clearInterval(inGameEnemyInterval);
  isInGame = false;
  appearGameModal('¡Perdiste!')
}
function gameClose() {
  inGameObj = [];
  removeKeyInput();
  dialogQuery = 0;
  dataElement.style.opacity = '0';
  canvas.style.filter = 'brightness(100%)';
  updateLevelSelectorLevels();
  levelFinalAction();
}
function gameRestart() {
  gameClose();
  gameInit();
}

function setHealth(newHealth) {
  const barRect = document.querySelector('.health-bar').getBoundingClientRect();
  const percentage = newHealth * 100 / maxHealth;
  healthBarFill.style.width = `${barRect.width * percentage / 100}px`;
  effectsMask.style.animation = 'none';
  if (newHealth < health) setTimeout(() => effectsMask.style.animation = '1s ease pulseFail', 1);
  health = newHealth;
  if (health <= 0) gameLose();
}


// Lectura de las teclas presionadas
const addKey = (ev) => keys[ev.key] = true;
const removeKey = (ev) => keys[ev.key] = false;
function activeKeyInput() {
  window.addEventListener("keydown", addKey);
  window.addEventListener("keyup", removeKey);
}
function removeKeyInput() {
  window.removeEventListener("keydown", addKey);
  window.removeEventListener("keyup", removeKey);
  const objectKeys = Object.keys(keys);
  objectKeys.forEach(key => delete keys[key]);
}