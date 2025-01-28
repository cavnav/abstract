// Функция для загрузки стилей
function loadStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './js/sea-battle.css'; // Путь к вашему CSS-файлу
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
    console.log(111, playerField)
    //renderField({playerField, containerId: 'player-field'});
  } catch (error) {
    console.error('Ошибка выполнения команды:', error);
  }
}

// Рендеринг конкретного поля
function renderField({field, containerId}) {
  const container = document.getElementById(containerId);

  // Проверяем, существует ли контейнер
  if (!container) {
    console.error(`Элемент с id="${containerId}" не найден.`);
    return;
  }

  // Очищаем содержимое контейнера
  container.innerHTML = "";

  // Добавляем подписи
  const rowLabels = ["1", "2", "3"];
  const colLabels = ["A", "B", "C"];
  container.innerHTML = `
    <div class="board-row">
      <div class="label"></div>
      ${colLabels.map((col) => `<div class="label">${col}</div>`).join("")}
    </div>
  `;

  // Добавляем строки с ячейками
  rowLabels.forEach((row, rowIndex) => {
    container.innerHTML += `
      <div class="board-row">
        <div class="label">${row}</div>
        ${colLabels
        .map((col, colIndex) => {
          const cellId = col.toLowerCase() + (rowIndex + 1);
          return `<div id="${cellId}" class="cell"></div>`;
        })
        .join("")}
      </div>
    `;
  });

  // Обновляем состояние ячеек
  for (const key in field) {
    const cell = document.getElementById(key);

    // Защита от несуществующих ячеек
    if (!cell) {
      console.warn(`Ячейка с id="${key}" не найдена.`);
      continue;
    }

    cell.textContent =
      field[key] === "water"
        ? "🌊"
        : field[key] === "hit"
          ? "🔥"
          : field[key] === "miss"
            ? "💥"
            : "🚢";
  }
}


// Функция для начала игры
function startGame(content) {
  content.innerHTML = `
    <h2>Морской бой</h2>
    <div class="player-board">
      <h3>Поле игрока</h3>
      <div id="player-field" class="board">
        ${renderBoardHTML()}
      </div>
    </div>
    <div class="computer-board">
      <h3>Поле компьютера</h3>
      <div id="computer-field" class="board">
        ${renderBoardHTML()}
      </div>
    </div>
  `;
  renderField();

  alert("Разместите ваш корабль, выбрав ячейку.");
}

// Функция для генерации HTML поля
function renderBoardHTML() {
  return `
    <div id="a1" class="cell"></div>
    <div id="a2" class="cell"></div>
    <div id="a3" class="cell"></div>
    <div id="b1" class="cell"></div>
    <div id="b2" class="cell"></div>
    <div id="b3" class="cell"></div>
    <div id="c1" class="cell"></div>
    <div id="c2" class="cell"></div>
    <div id="c3" class="cell"></div>
  `;
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

  const size = 3
  generateBattlefield({ size, containerId: 'player-field' })
  generateBattlefield({ size, containerId: 'computer-field' })
}

function generateBattlefield({ size, containerId }) {
  const rows = size
  const cols = size
  const container = document.getElementById(containerId)

  const table = document.createElement('table');

  const letters = ['a', 'b', 'c'];
  const textures = {
    water: '🌊',
    ship: '🚢',
    rocket: '🚀',
    explosion: '💥',
    miss: '❌'
  };

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
      td.dataset.col = letters[col];
      td.textContent = textures.water; // Устанавливаем текстуру воды по умолчанию

      // Добавляем обработчик клика для примера
      td.addEventListener('click', () => {
        if (td.textContent === textures.water) {
          td.textContent = textures.miss; // Помечаем "мимо"
        } else if (td.textContent === textures.ship) {
          td.textContent = textures.explosion; // Попадание
        }
      });

      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  container.appendChild(table);
}

// Генерация поля 3x3


export { runCommand };
