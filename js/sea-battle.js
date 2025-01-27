// Функция для загрузки стилей
function loadStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './js/sea-battle.css'; // Путь к вашему CSS-файлу
  document.head.appendChild(link);
}

// Вызываем функцию загрузки стилей при инициализации тренажера
loadStyles();

// Пример контекста для тренажера
let field = {
  a1: 'water', a2: 'water', a3: 'water',
  b1: 'water', b2: 'water', b3: 'water',
  c1: 'water', c2: 'water', c3: 'water',
};

// Функция для выполнения команды в контексте
function runCommand(command) {
  // Создаем деструктурированные переменные для всех ключей объекта context
  const contextKeys = Object.keys(field);
  const contextValues = Object.values(field);

  // Выполняем код в контексте с созданными переменными
  try {
    const newValues = new Function(...contextKeys, `
    "use strict"; 
    ${command}
    
    // После выполнения кода соберем измененные значения обратно в объект
    const updatedContext = { ${contextKeys.map(key => `${key}: ${key}`).join(', ')} };
    
    return updatedContext; // Возвращаем новый объект с обновленными значениями
  `)(...contextValues); // 

    // Обновляем поле новым значением
    field = newValues;

    // Обновляем рендеринг поля
    renderField();
  } catch (error) {
    console.error('Ошибка выполнения команды:', error);
  }
}

// Функция для рендеринга поля
function renderField() {
  for (const key in field) {
    const cell = document.getElementById(key);
    // Используем эмодзи для отображения состояния ячейки
    cell.textContent = field[key] === 'water' ? '🌊' :
      field[key] === 'hit' ? '🔥' :
        field[key] === 'miss' ? '💥' : '🚢';
  }
}

// Инициализация тренажера и рендеринг начального состояния
export function init(content) {
  content.innerHTML = `
    <h2>Морской бой</h2>
    <div id="game-board">
      <div id="a1" class="cell"></div>
      <div id="a2" class="cell"></div>
      <div id="a3" class="cell"></div>
      <div id="b1" class="cell"></div>
      <div id="b2" class="cell"></div>
      <div id="b3" class="cell"></div>
      <div id="c1" class="cell"></div>
      <div id="c2" class="cell"></div>
      <div id="c3" class="cell"></div>
    </div>
  `;
  renderField(); // Отображаем начальное поле
}

export { runCommand }