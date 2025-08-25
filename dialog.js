"use strict";

// ---- Sistema de diálogos e historia de La Soga ----

// Textos
let STORY;
function setStory() {
  // Actualiza los diálogos para que aparezca el nombre del jugador
  STORY = {
    'introduction': [
      `A ${playerName} le gustaban los juegos peligrosos...`,
      'Subir por la escalera de mano del tanque, tirarse por el tragaluz del techo, encender papeles en la chimenea, entre otros pasatiempos...',
      'Estos juegos lo entretuvieron, hasta que descubrió algo en el patio de su casa.',
      'Algo que cambiaría su vida para siempre.'
    ]
  }
}
const PRESS_ENTER = 'Presiona ENTER para continuar.';

// Constantes
const dialogBox = document.getElementById('dialog-box');
const dialogBoxText = document.querySelector('.dialog-box-text');
const dialogBoxLabel = document.querySelector('.dialog-box-label');

// Variables
let currentDialog = [];
let showingText = '';
let currentChain = 0;
let currentChar = 0;
let generationInterval;
let textSpeed = 50;

// Funciones
function initMainDialog(dialog, currentScreen) {
  fadeScreen(currentScreen, dialogScreen, 1);
  currentDialog = dialog;
  setTimeout(() => {
    startInterval();
    window.addEventListener('keydown', passChain);
  }, 1000);
}
function startInterval() {
  generationInterval = setInterval(generateCharInterval, textSpeed);
}
function generateCharInterval() {
  if (showingText == currentDialog[currentChain]) {
    // Si el texto ya está completo, limpia el intervalo
    clearInterval(generationInterval);
    dialogBoxLabel.innerText = PRESS_ENTER;
  } else {
    // Si el texto no está completo, genera un caracter
    showingText += currentDialog[currentChain][currentChar];
    currentChar++;
    updateText();
  }
}
function passChain(ev) {
  if (ev.key !== 'Enter') return;
  if (showingText != currentDialog[currentChain]) {
    // Autocompletar texto
    showingText = currentDialog[currentChain];
    clearInterval(generationInterval);
    dialogBoxLabel.innerText = PRESS_ENTER;
    updateText();
  } else if (currentChain + 1 !== currentDialog.length) {
    // Pasar cadena
    currentChar = 0;
    currentChain++;
    showingText = '';
    startInterval();
    dialogBoxLabel.innerText = '';
  } else finishText(); // Terminar diálogo
}
const updateText = () => dialogBoxText.innerText = showingText;
function finishText() {
  dialogBox.style.opacity = 0;
  window.removeEventListener('keydown', passChain);
  setTimeout(() => fadeScreen(dialogScreen, levelSelector), 1000);
}