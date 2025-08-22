'use strict';

// ---- Código La Soga, proyecto Lengua y Literatura ----

// Constantes
const playButton = document.getElementById('play-button');
const mainTitle = document.getElementById('main-title');
const levelSelector = document.getElementById('level-selector');
const levelSelectorBox = document.getElementById('level-selector-box');
const gameElement = document.getElementById('game');
const timeElement = document.getElementById('time');
const label = document.getElementById('label');
const backButtonLevelSelector = document.getElementById('level-selector-back-button');
const backButtonGame = document.getElementById('game-back-button');

const boxSize = 48;
const gameDelay = 200;
const wallColor = '#000';
const floorColor = '#666';
const playerColor = '#E8AD31';
const winColor = '#0c0';
const loseColor = '#f00';

const inGameObj = [];

// Enums
const DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
}



// Variables
let gameMainLoop, gameClock, playerObj, playerDirection;
let actualLevelObj, actualLevelArr;
let levelDimensions = [10, 10];
let timer = 0;
let positionsQuery = [];
let stringPositionsQuery = [];



// Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
updateCanvasDimensions([320, 320]);



// Objetos del juego
class Player {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = playerColor;
    this.draw();
  }

  draw() {
    drawSquare(
      boxSize * this.x,
      boxSize * this.y,
      this.w, this.h,
      this.c
    );
  }
  move(movX, movY) {
    this.savePosition();
    this.x += movX;
    this.y += movY;
    this.checkWall();
  }
  savePosition() {
    const posArray = [this.x, this.y];
    positionsQuery.push(posArray);
    stringPositionsQuery.push(JSON.stringify(posArray));
  }
  checkWall() {
    const posArray = [this.x, this.y];
    if (
      actualLevelArr[this.y][this.x] === 1 ||
      stringPositionsQuery.includes(JSON.stringify(posArray))
    ) {
      gameStop('Perdiste! Presiona enter para volverlo a intentar', loseColor);
      this.c = 'transparent';
    }
  }
}



// Eventos de menús
playButton.addEventListener('click', () => {
  mainTitle.style.display = 'none';
  levelSelector.style.display = 'flex';
});

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
updateLevelSelectorLevels();

function selectLevel(level) {
  levelSelector.style.display = 'none';
  gameElement.style.display = 'flex';
  setLevel(level);
  gameInit();
}
backButtonLevelSelector.addEventListener('click', () => {
  levelSelector.style.display = 'none';
  mainTitle.style.display = 'flex';
});
backButtonGame.addEventListener('click', () => {
  gameElement.style.display = 'none';
  levelSelector.style.display = 'flex';
  gameClose();
});


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
  actualLevelArr = actualLevelObj.array;
  levelDimensions = [actualLevelArr[0].length, actualLevelArr.length];
}



// Funciones del canvas
function drawSquare(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function updateCanvasDimensions(dim) {
  canvas.style.width = dim[0];
  canvas.style.height = dim[1];
  canvas.width = dim[0];
  canvas.height = dim[1];
}



// Main loop del juego
function mainLoop() {
  if (!playerDirection) return;
  if (!gameClock) gameClock = setInterval(() => {
    timer--;
    timeElement.innerText = timer;
    if (timer <= 0) gameStop('Ganaste! Presiona ENTER para volverlo a intentar', winColor);
  }, 1000); 
  playerObj.move(
    (playerDirection === DIRECTIONS.RIGHT) ? 1 : (playerDirection === DIRECTIONS.LEFT) ? -1 : 0,
    (playerDirection === DIRECTIONS.DOWN) ? 1 : (playerDirection === DIRECTIONS.UP) ? -1 : 0
  )
  if (gameMainLoop) playerObj.draw();
}
function gameInit() {
  updateCanvasDimensions([levelDimensions[0] * boxSize, levelDimensions[1] * boxSize]);
  activeKeyInput();
  drawMap(actualLevelArr);
  const playerInitPosition = actualLevelObj.initPosition;
  playerObj = new Player(playerInitPosition[0], playerInitPosition[1], boxSize, boxSize);
  timer = actualLevelObj.time;
  timeElement.innerText = timer;

  gameMainLoop = setInterval(mainLoop, gameDelay);
}
function gameStop(phrase, color) {
  clearInterval(gameMainLoop);
  clearInterval(gameClock);
  gameMainLoop = null;
  gameClock = null;
  playerDirection = null;
  removeKeyInput();
  positionsQuery.forEach(pos => {
    drawSquare(pos[0] * boxSize, pos[1] * boxSize, boxSize, boxSize, color);
  });
  positionsQuery = [];
  stringPositionsQuery = [];
  label.innerText = phrase;
  label.style.color = color;
  window.addEventListener('keydown', checkEnterRestart);
}
function gameRestart() {
  label.innerText = '';
  label.style.color = 'white';
  removeEnterRestart();
  gameInit();
}
function checkEnterRestart(ev) {
  if (ev.key !== 'Enter') return;
  gameRestart();
}
function removeEnterRestart() {
  window.removeEventListener('keydown', checkEnterRestart);
}
function gameClose() {
  clearInterval(gameMainLoop);
  clearInterval(gameClock);
  removeKeyInput();
  removeEnterRestart();
  gameMainLoop = null;
  gameClock = null;
  playerDirection = null;
  positionsQuery = [];
  stringPositionsQuery = [];
  label.innerText = '';
  label.style.color = 'white';
}


// Lectura de las teclas presionadas
const keys = {};
const setDirection = (ev) => {
  const possibleArrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
  if (!possibleArrows.includes(ev.key)) return;

  switch (ev.key) {
    case 'ArrowUp': playerDirection = DIRECTIONS.UP; return;
    case 'ArrowRight': playerDirection = DIRECTIONS.RIGHT; return;
    case 'ArrowDown': playerDirection = DIRECTIONS.DOWN; return;
    case 'ArrowLeft': playerDirection = DIRECTIONS.LEFT; return;
  }
};
function activeKeyInput() {
  // Activa la lectura de las teclas
  window.addEventListener("keydown", setDirection);
}
function removeKeyInput() {
  // Desactiva la lectura de las teclas
  window.removeEventListener("keydown", setDirection);
  const objectKeys = Object.keys(keys);
  objectKeys.forEach(key => delete keys[key]);
}