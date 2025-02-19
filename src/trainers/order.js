import './order.css'

const colors = {
    "🍅": "#ff0000", // Красный - помидор
    "🥕": "#ff8000", // Оранжевый - морковь
    "🍋": "#ffff00", // Жёлтый - лимон
    "🥒": "#00ff00", // Зелёный - огурец
    "🫐": "#0000ff", // Синий - черника
    "🍆": "#800080", // Фиолетовый - баклажан
    "🧄": "#ffffff", // Белый - чеснок
    "🫒": "#333333", // Чёрный - чёрная олива
    "🥔": "#a52a2a"  // Коричневый - картошка
};

const house = {};
const roomCoordinates = [
    "a1", "a2", "a3",
    "b1", "center", "b3",
    "c1", "c2", "c3"
];
let outputCallback = null;

// Заполняем комнаты случайными цветами
function generateHouse() {
    const availableColors = Object.values(colors);
    const shuffledColors = [...availableColors].sort(() => Math.random() - 0.5).slice(0, roomCoordinates.length);

    roomCoordinates.forEach((coord, i) => {
        house[coord] = {
            color: shuffledColors[i], // Назначаем случайный цвет
            object: coord === "center" ? null : Object.keys(colors)[i % Object.keys(colors).length] // Центр пустой
        };
    });

    renderHouse();
}

// Отображение дома
function renderHouse() {
    roomCoordinates.forEach(coord => {
        const div = document.getElementById(coord);
        if (div) {
            div.style.background = house[coord].color;
            div.textContent = house[coord].object || " ";
        }
    });
    checkWin();
}

// Интерпретатор команд
function runCommand(command) {
    try {
        new Function("house", `
            "use strict"; 
            ${command}
        `)(house);

        renderHouse();
    } catch (error) {
        console.error('Ошибка выполнения команды:', error);
        outputCallback({message: 'Ошибка в команде!'});
    }
}

// Проверка победы
function checkWin() {
    const allCorrect = roomCoordinates.every(coord => {
        const room = house[coord];
        return room.object && colors[room.object] === room.color;
    });

    outputCallback({ message: allCorrect ? "Порядок наведен! 🎉" : "" });
}

// Инициализация интерфейса
export function init({ container, output }) {
    outputCallback = output;

    container.innerHTML = `
        <h1>Порядок</h1>
        <div class="grid-container">
            <div></div> <!-- Пустая ячейка для верхнего угла -->
            <div class="grid-header">a</div>
            <div class="grid-header">b</div>
            <div class="grid-header">c</div>

            <div class="grid-header">1</div>
            <div id="a1" class="room"></div>
            <div id="b1" class="room"></div>
            <div id="c1" class="room"></div>

            <div class="grid-header">2</div>
            <div id="a2" class="room"></div>
            <div id="center" class="room center"></div>
            <div id="b2" class="room"></div>

            <div class="grid-header">3</div>
            <div id="a3" class="room"></div>
            <div id="b3" class="room"></div>
            <div id="c3" class="room"></div>
        </div>
    `;

    generateHouse();
}

export { runCommand };
