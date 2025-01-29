// Функция для загрузки стилей
function loadStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './src/sea-battle.css'; // Путь к вашему CSS-файлу
  document.head.appendChild(link);
}

// Вызываем функцию загрузки стилей при инициализации тренажера
loadStyles();

// Поля для игрока и компьютера
let playerField = {
  a1: 'water', a2: 'water', a3: 'water',
  b1: 'water', b2: 'water', b3: 'water',
  c1: 'water', c2: 'water', c3: 'water',
};

let computerField = {
  a1: 'water', a2: 'water', a3: 'water',
  b1: 'water', b2: 'water', b3: 'water',
  c1: 'water', c2: 'water', c3: 'water',
};

// Функция для выполнения команды в контексте поля
function runCommand(command) {
  const contextKeys = Object.keys(playerField);
  const contextValues = Object.values(playerField);

  try {
    // Выполняем команду в контексте
    const updatedContext = new Function(...contextKeys, `
      "use strict"; 
      ${command}
      
      // Собираем изменённое состояние обратно в объект
      const updatedContext = { ${contextKeys.map(key => `${key}: ${key}`).join(', ')} };
      return updatedContext;
    `)(...contextValues);

    Object.assign(playerField, updatedContext)

    // Обновляем рендеринг
    generateBattlefield({field: playerField, containerId: 'player-field'});
  } catch (error) {
    console.error('Ошибка выполнения команды:', error);
  }
}

// Экспортируем функции
// Инициализация
export function init(content) {
  content.innerHTML = `
    <div><h2>Морской бой</h2></div>
    <div class="flex">
      <div class="player-board">
        <h3>Твоя карта</h3>
        <div id="player-field" class="board"></div>
      </div>
      <div class="computer-board">
        <h3>Карта противника</h3>
        <div id="computer-field" class="board"></div>
      </div>
    </div>
  `;

  generateBattlefield({ containerId: 'player-field', field: playerField })
  generateBattlefield({ containerId: 'computer-field', field: computerField })
}

function generateBattlefield({ size = 3, containerId, field }) {
  const rows = size
  const cols = size
  const container = document.getElementById(containerId)

  // Проверяем, существует ли контейнер
  if (!container) {
    console.error(`Элемент с id="${containerId}" не найден.`);
    return;
  }

  // Очищаем содержимое контейнера
  container.innerHTML = "";

  const table = document.createElement('table');

  const letters = ['a', 'b', 'c'];
  const texturesMap = getSpecNames();
  const textures = Object.values(texturesMap)

  // Создаем заголовок таблицы
  const headerRow = document.createElement('tr');
  const emptyHeader = document.createElement('th');
  headerRow.appendChild(emptyHeader); // Пустая ячейка

  for (let col = 0; col < cols; col++) {
    const th = document.createElement('th');
    th.textContent = letters[col];
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Создаем строки таблицы
  for (let row = 1; row <= rows; row++) {
    const tr = document.createElement('tr');

    // Заголовок строки
    const rowHeader = document.createElement('th');
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);

    // Ячейки
    for (let col = 0; col < cols; col++) {
      const td = document.createElement('td');
      td.dataset.row = row;
      td.dataset.col = letters[col]
      const key = letters[col]+row
      let texture = textures.find(code => code === field[key])
      if (texture && texture === texturesMap.rocket) {
        texture = texturesMap.miss
      }
      td.textContent = texture || texturesMap.water

      tr.appendChild(td);      
    }

    table.appendChild(tr);
  }

  container.appendChild(table);
}

function getSpecNames() {
  return {
    water: '🌊',
    ship: '🚢',
    rocket: '🚀',
    explosion: '💥',
    miss: '❌'
  }
}

const namespace = Object.values(getSpecNames()).reduce((res, value) => {res[value] = 1; return res;}, {})
export { 
  runCommand,
  namespace
 };
