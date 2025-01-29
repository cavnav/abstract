// Функция для загрузки стилей
import './draw.css'

function runCommand(command) {
  try {
    // command = `
    // brush({color: 'red', size: 3});
    // circle({x: 100, y: 100, r: 40}); 
    // line({x1: 100, y1: 100, x2: 200, y2: 200});
    // fill({x: 90, y: 90, fillColor: 'blue', borderColor: 'red'});
    // `;
    new Function('circle, line, brush, fill, clear', 
      `"use strict"; ${command}`
    )(drawCircle, drawLine, setBrush, floodFill, clearCanvas);
  } catch (error) {
    console.error('Ошибка выполнения команды:', error);
  }
}

let canvas, context;
let brushColor = 'black';
let brushSize = 2;

function initCanvas(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Контейнер с id "${containerId}" не найден.`);
    return;
  }

  // Создаем канвас
  canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  canvas.willReadFrequently = true;
  context = canvas.getContext('2d');
  // Устанавливаем атрибут willReadFrequently
  container.appendChild(canvas);
}

function drawCircle({ x, y, r }) {
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.lineWidth = brushSize;
  context.strokeStyle = brushColor;
  context.stroke();  // Обводим круг
  context.closePath();
}

function drawLine({ x1, y1, x2, y2 }) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineWidth = brushSize;
  context.strokeStyle = brushColor;
  context.stroke();
  context.closePath();
}

function setBrush({ color, size }) {
  brushColor = color;
  brushSize = size;
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Функция для получения цвета пикселя
function getPixelColor(x, y) {
  const imageData = context.getImageData(x, y, 1, 1);
  return [imageData.data[0], imageData.data[1], imageData.data[2]]; // [R, G, B]
}

// Функция для проверки совпадения цветов
function colorsMatch(color1, color2) {
  return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
}

// Функция заливки
function floodFill({x, y, fillColor, borderColor}) {
  const targetColor = getPixelColor(x, y);
  fillColor = colorToRgb(fillColor)
  const boundaryColor = colorToRgb(borderColor);

  // Проверяем, если начальный цвет совпадает с цветом границы или цветом заливки
  if (colorsMatch(targetColor, boundaryColor) || colorsMatch(targetColor, fillColor)) return;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const stack = [[x, y]];

  while (stack.length) {
      const [px, py] = stack.pop();
      const index = (py * imageData.width + px) * 4;

      // Пропускаем, если текущий пиксель не совпадает с целевым цветом
      if (!colorsMatch([pixels[index], pixels[index + 1], pixels[index + 2]], targetColor)) continue;

      // Заливаем пиксель
      pixels[index] = fillColor[0];   // R
      pixels[index + 1] = fillColor[1]; // G
      pixels[index + 2] = fillColor[2]; // B
      pixels[index + 3] = 255;         // A (прозрачность)

      // Добавляем соседние пиксели для дальнейшей заливки
      if (px + 1 < canvas.width) stack.push([px + 1, py]);
      if (px - 1 >= 0) stack.push([px - 1, py]);
      if (py + 1 < canvas.height) stack.push([px, py + 1]);
      if (py - 1 >= 0) stack.push([px, py - 1]);
  }

  context.putImageData(imageData, 0, 0);
}

// Функция для преобразования шестнадцатеричного цвета в RGB
function colorToRgb(color) {
  // Создаем элемент div для использования встроенного браузерного метода
  const tempDiv = document.createElement('div');
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);

  // Получаем вычисленный цвет
  const computedColor = window.getComputedStyle(tempDiv).color;

  // Удаляем временный элемент
  document.body.removeChild(tempDiv);

  // Преобразуем строку цвета в массив RGB
  const rgbArray = computedColor.match(/\d+/g);
  
  // Проверяем, что rgbArray не null, и преобразуем в массив чисел
  return rgbArray ? rgbArray.map(Number) : null; // Возвращает массив [R, G, B] или null
}

export function init(content) {
  content.innerHTML = '<div id="draw-container"></div>';
  initCanvas('draw-container');
}

const namespace = {
  circle: 1,
  line: 1, 
  fill: 1,
  brush: 1,
  clear: 1
}

export { 
  runCommand,
  namespace
 }

