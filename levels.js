'use strict';

// ---- Niveles juego La Soga ----

// 0 - Espacio vacío
// 1 - Pared

let inGameEnemyInterval;
let enemyIntervalFrec = 1500;

const levels = {
  0: {
    'name': 'El encuentro',
    'initPosition': [4, 6],
    'initAction': () => {
      setTimeout(() => appearPopup('Usa W-A-S-D para moverte', 0), 500);
      setTimeout(() => disappearPopup(0), 4500);
      setTimeout(() => appearPopup('Manten pulsado M para correr', 0), 6000);
      setTimeout(() => disappearPopup(0), 10000);
    },
    'objects': [
      [Collectable, [21, 14, 48, 48, () => {
        enemyIntervalFrec = 1500;
        dialogQuery = 1;
        canvas.style.filter = 'brightness(20%)';
        appearPopup(`Todo un año, de su vida de siete años, ${playerName} había esperado a que le dieran este artilugio.`, 1);
        setTimeout(() => disappearPopup(1), 5500);
        setTimeout(() => appearPopup('La soga hizo que se olvidara de sus previos entretenimientos...', 1), 7000);
        setTimeout(() => disappearPopup(1), 12000);
        setTimeout(() => appearPopup('Incluso si eso conllevaba que, a veces, esta lo atacara por sorpresa...', 1), 13500);
        setTimeout(() => disappearPopup(1), 18000);
        setTimeout(() => canvas.style.filter = 'brightness(100%)', 18500);
        setTimeout(() => {
          dataElement.style.opacity = '1';
          setTime(30);
        }, 19000);
        setTimeout(() => {
          inGameEnemyInterval = setInterval(generateEnemy, enemyIntervalFrec);
          setTimeout(() => {
            console.log('Difficulty has changed');
            clearInterval(inGameEnemyInterval);
            enemyIntervalFrec /= 3;
            inGameEnemyInterval = setInterval(generateEnemy, enemyIntervalFrec);
            setTimeout(() => clearInterval(inGameEnemyInterval), 20000);
          }, 10000)
        }, 20000);
      }]]
    ],
    'unlocked': false,
    'completed': false,
    'screens': [ 
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ]
    ]
  }
  // 1: {
  //   'name': 'La Calavera',
  //   'initPosition': [7, 16],
  //   'time': 18,
  //   'unlocked': false,
  //   'completed': false,
  //   'array': [
  //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //     [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  //     [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  //     [1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
  //     [1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
  //     [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  //     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //     [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  //     [1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1],
  //     [1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1],
  //     [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  //   ]
  // }
}

function generateEnemy() {
  const bulletX = Math.floor(Math.random() * canvas.width / boxSize);
  const bulletY = (Math.random() > 0.5) ? 1 : levelDimensions[1] - 1;
  const enemyDirection = Math.atan((playerObj.y - bulletY) / (playerObj.x - bulletX)) + ((bulletX > playerObj.x) ? Math.PI : 0);
  const enemySpeed = bulletSpeedBase + Math.floor(Math.random() * bulletSpeedVariation);
  addGameInstance(Bullet, [bulletX, bulletY, boxSize * 2, boxSize * 2, enemyDirection, enemySpeed]);
}