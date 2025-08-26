'use strict';

// ---- Código La Soga, proyecto Lengua y Literatura ----

// Constantes
const playButton = document.getElementById('play-button');
const mainTitle = document.getElementById('main-title');
const nameSelection = document.getElementById('name-selection');
const nextButtonNameSelection = document.querySelector('.name-selection-button');
const dialogScreen = document.getElementById('dialog');
const levelSelector = document.getElementById('level-selector');
const levelSelectorBox = document.getElementById('level-selector-box');
const gameElement = document.getElementById('game');
const timeElement = document.getElementById('time');
const label = document.getElementById('label');
const backButtonLevelSelector = document.getElementById('level-selector-back-button');
const backButtonGame = document.getElementById('game-back-button');
const infoPopUp = document.getElementById('info-pop-up');

const boxSize = 32;
const gameDelay = 200;
const playerAnimationTime = 200;
const wallColor = '#000';
const floorColor = '#666';
const playerColor = '#E8AD31';
const winColor = '#0c0';
const loseColor = '#f00';

const keys = {};
const inGameObj = [];

const playerSprites = document.getElementById('player-sprites');

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
let playerObj;
let actualLevelObj, actualLevelArr;
let levelDimensions = [10, 10];
let levelScreen = 0;
let levelInitAction = () => void 0;
let timer = 0;
let positionsQuery = [];
let stringPositionsQuery = [];
let currentScreen = SCREENS.MAIN_TITLE;

let hasSeenIntroduction = false;



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
    this.bottom = this.y + (this.h / boxSize);
    this.mid = this.y + ((this.h / boxSize) / 2);
    this.right = this.x + (this.w / boxSize);
    setInterval(() => this.changeAnimationFrame(), playerAnimationTime);
  }

  update(deltaTime) {
    // Make this better
    playerSpeed = (keys['x']) ? 5 : 3;

    this.bottom = this.y + (this.h / boxSize);
    this.mid = this.y + ((this.h / boxSize) / 2);
    this.right = this.x + (this.w / boxSize);
    if (keys['ArrowRight']) {
      if (
        actualLevelArr[Math.floor(this.y)][Math.floor(this.x) + 1] !== 1 &&
        actualLevelArr[Math.floor(this.mid)][Math.floor(this.x) + 1] !== 1 &&
        actualLevelArr[Math.floor(this.bottom)][Math.floor(this.x) + 1] !== 1
      ) {
        this.x += playerSpeed * deltaTime;
        playerDirection = DIRECTIONS.RIGHT;
      }
    }
    if (keys['ArrowLeft']) {
      if (
        actualLevelArr[Math.floor(this.y)][Math.floor(this.x - playerSpeed * deltaTime)] !== 1 &&
        actualLevelArr[Math.floor(this.mid)][Math.floor(this.x - playerSpeed * deltaTime)] !== 1 &&
        actualLevelArr[Math.floor(this.bottom)][Math.floor(this.x - playerSpeed * deltaTime)] !== 1
      ) {
        this.x -= playerSpeed * deltaTime;
        playerDirection = DIRECTIONS.LEFT;
      }
    }
    if (keys['ArrowUp']) {
      if (
        actualLevelArr[Math.floor(this.y - playerSpeed * deltaTime)][Math.floor(this.x)] !== 1 &&
        actualLevelArr[Math.floor(this.y - playerSpeed * deltaTime)][Math.floor(this.right)] !== 1
      ) {
        this.y -= playerSpeed * deltaTime;
        playerDirection = DIRECTIONS.UP;
      }
    }
    if (keys['ArrowDown']) {
      if (
        actualLevelArr[Math.floor(this.bottom + playerSpeed * deltaTime)][Math.floor(this.x)] !== 1 &&
        actualLevelArr[Math.floor(this.bottom + playerSpeed * deltaTime)][Math.floor(this.right)] !== 1
      ) {
        this.y += playerSpeed * deltaTime;
        playerDirection = DIRECTIONS.DOWN;
      }
    }
  }
  draw() {
    const moving = (keys['ArrowRight'] || keys['ArrowLeft'] || keys['ArrowUp'] || keys['ArrowDown']);
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
    if (
      playerObj.x <= this.right && playerObj.right >= this.x &&
      playerObj.y <= this.bottom && playerObj.bottom >= this.y
    ) {
      this.action();
      this.destroyObj();
    }
  }
  draw() {
    drawSquare(
      this.x * boxSize, this.y * boxSize,
      this.w, this.h, 'red'
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
  }
}
const nextButtonNSAction = () => {
  const nameInput = document.querySelector('.name-selection-input');
  playerName = nameInput.value;
  hasSeenIntroduction = true;
  updateLevelSelectorLevels();
  setStory();
  initMainDialog(STORY.introduction, nameSelection);
}
const backLevelSelectorButtonAction = () => fadeScreen(levelSelector, mainTitle);
const backGameButtonAction = () => {
  fadeScreen(gameElement, levelSelector);
  gameClose();
}

function updateLevelSelectorLevels() {
  const levelElements = document.createDocumentFragment();
  const keys = Object.keys(levels);
  keys.forEach(key => {
    const l = document.createElement('button');
    l.type = 'button';
    l.classList.add('level');
    const text = (parseInt(key) + 1).toString();
    l.innerText = (key < 9) ? `0${text}` : text;
    const lT = document.createElement('div');
    lT.classList.add('level-tooltip');
    lT.innerText = levels[key].name;
    l.appendChild(lT);
    l.addEventListener('click', () => selectLevel(levels[key]));
    levelElements.appendChild(l);
  });
  levelSelectorBox.appendChild(levelElements);
}
function selectLevel(level) {
  fadeScreen(levelSelector, gameElement);
  setLevel(level);
  gameInit();
}

function addMenusButtonActions() {
  playButton.addEventListener('click', playButtonAction);
  nextButtonNameSelection.addEventListener('click', nextButtonNSAction);
  backButtonLevelSelector.addEventListener('click', backLevelSelectorButtonAction);
  // backButtonGame.addEventListener('click', backGameButtonAction);
}
addMenusButtonActions();
function removeMenusButtonActions() {
  playButton.removeEventListener('click', playButtonAction);
  nextButtonNameSelection.removeEventListener('click', nextButtonNSAction);
  backButtonLevelSelector.removeEventListener('click', backLevelSelectorButtonAction);
  // backButtonGame.removeEventListener('click', backGameButtonAction);
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
function appearPopup(text) {
  infoPopUp.innerText = text;
  infoPopUp.style.display = 'flex';
  infoPopUp.style.animation = '1s ease forwards appearPopup';
  setTimeout(() => infoPopUp.style.animation = '', 1000);
}
function disappearPopup() {
  infoPopUp.style.animation = '1s ease forwards disappearPopup';
  setTimeout(() => {
    infoPopUp.style.display = 'none';
    infoPopUp.style.animation = '';
  }, 1000)
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
  // todo lose
}
function gameInit() {
  updateCanvasDimensions([levelDimensions[0] * boxSize, levelDimensions[1] * boxSize]);
  activeKeyInput();
  drawMap(actualLevelArr);
  const playerInitPosition = actualLevelObj.initPosition;
  playerObj = new Player(playerInitPosition[0], playerInitPosition[1], boxSize, boxSize + boxSize / 2);
  inGameObj.push(playerObj);
  createLevelObjects();
  levelInitAction();
  isInGame = true;
  requestAnimationFrame(gameLoop);
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