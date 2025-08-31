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
    ],
    'level2Intro': [
      `${playerName} podía hacer con la soga ahora lo que quisiera...`,
      `Primeramente hizo una hamaca, un arnés para caballo, una liana, un salvavidas, una horca para los reos, y finalmente una serpiente.`,
      `Tirándola con fuerza hacia adelante, la soga se retorcía y se volvía con la cabeza hacia atrás, con ímpetu, como dispuesta a morder.`,
      `Tanto asi que parecía una serpiente real, de la que ${playerName} tenía que escapar...`
    ],
    'level3Intro': [
      `${playerName} siempre tenía cuidado de evitar que la soga lo tocara; era parte del juego.`,
      `Yo lo vi llamar a la soga, como quien llama a un perro, y la soga se le acercaba.`,
      `Con tanta maestría ${playerName} lanzaba la soga y le daba aquel movimiento de serpiente maligna y retorcida.`,
      `Nadie se atrevía a decirle "${playerName}, no juegues con la soga"...`
    ],
    'level4Intro': [
      `La soga parecía tranquila cuando dormía sobre la mesa o en el suelo`,
      `Nadie la hubiera creído capaz de ahorcar a nadie.`,
      `Con el tiempo se volvió más flexible y oscura, casi verde y, por último, un poco viscosa y desagradable.`,
      `${playerName} la bautizó con el nombre de "Prímula".`
    ],
    'level5Intro': [
      `Una tarde de diciembre, el sol, como una bola de fuego, brillaba en el horizonte.`,
      `Aquella vez la soga volvió hacia atrás con la energía de siempre.`,
      `Pero esta vez, ${playerName} no retrocedió para esquivarla...`
    ],
    'final': [
      `Así murió ${playerName}. Yo lo ví, tendido, con los ojos abiertos.`,
      `La soga, con el flequillo despeinado, enroscada junto a él, lo valaba.`,
      `FIN`
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
let finishDialogAction = () => void 0;

// Funciones
function initMainDialog(dialog, currentScreen, dialogAction) {
  finishDialogAction = dialogAction;
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
  setTimeout(() => {
    finishDialogAction();
    dialogBox.style.opacity = 1;
    currentChar = 0;
    currentChain = 0;
    showingText = '';
    updateText();
  }, 1000);
}