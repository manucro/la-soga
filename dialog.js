"use strict";

// ---- Sistema de diálogos e historia de La Soga ----

// Textos
const STORY = {
  'introduction': [
    'Esto es un texto de prueba para ver que tal funciona el sistema de textos',
    'El perro del ex esposo de mi tía necesita un galón de leche descremada.',
    'La hermeneutica telúrica icaica transtrueca la peripatrética notrética de la filosofía aristotélica, de los diálogos socráticos no dogmáticos.'
  ]
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
function initMainDialog(dialog) {
  fadeScreen(mainTitle, dialogScreen, 1);
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