import Autocomplete from './autocomplete.js';
import { LineManager } from './lineManager.js';

import './editor.css'


let trainerAPI = null;
let currentLineIndex = 0
let numLines = 1
const namespace = { иван: 1, xdf: 1, xcc: 1, xvc: 1 }; // Пространство имен редактора
let specNamespace = {}

// Связываем редактор с тренажером
export function setTrainerAPI({runCommand, extendNamespace}) {
    trainerAPI = {runCommand}
    Object.assign(specNamespace, extendNamespace)
}


export function init(editorContainer) {
    // Глобальная переменная для выбора транслятора
    let translator = (command) => command; // По умолчанию трансляция отсутствует

    const pipeToEqualsTranslator = (command) => command.replace(/ \| /g, '=').replace(/\n/g, ';')


    setTranslator(pipeToEqualsTranslator)

    // Основной контейнер
    editorContainer.innerHTML = `    
    <div class="flex">    
        <textarea id="editor" placeholder="Введите текст здесь..."></textarea>
    </div>
    <div id="resultContainer">Результат: 
        <div id="result"></div>
    </div>
    `;

    // Инициализация редактора
    const editor = editorContainer.querySelector('#editor');
    const resultElement = editorContainer.querySelector('#result');

    // Подключаем модуль подсказок
    const autocomplete = new Autocomplete({editor, getSuggestions, addVariable});

    // Подключаем LineManager
    const lineManager = new LineManager({editor, editorContainer});

    // Устанавливаем фокус на редактор
    editor.focus();

    let debounceTimer = null; // Для отслеживания времени бездействия


    editor.addEventListener('click', () => {
        const text = editor.value; // Текущее значение текста
        const cursorPosition = editor.selectionStart; // Позиция курсора
        const lines = text.slice(0, cursorPosition).split('\n'); // Разделяем текст до курсора по строкам
        currentLineIndex = lines.length; // Номер строки - количество строк 
        console.log('currentLineIndex', currentLineIndex)
    });

    editor.addEventListener('keydown', (event) => {
        protectEditPipe(event);

        if (event.key === '|') {
            event.preventDefault();
            return;
        }

        const cursorPosition = editor.selectionStart; // Позиция курсора
        const text = editor.value; // Текущее содержимое редактора

        // Добавление `|` при нажатии пробела
        if (event.key === ' ') {
            event.preventDefault();
            autocomplete.hideSuggestions()
            const lastNewlineIndex = text.lastIndexOf('\n', cursorPosition - 1);
            const currentLine = text.slice(lastNewlineIndex + 1, cursorPosition);

            if (currentLine.includes('|')) {
                event.preventDefault();
                return;
            }

            const beforeCursor = text.slice(0, cursorPosition);
            const afterCursor = text.slice(cursorPosition);
            editor.value = `${beforeCursor} | ${afterCursor}`;
            editor.selectionStart = editor.selectionEnd = cursorPosition + 3;
        }

        // Если подсказки активны, передаём управление подсказкам
        if (autocomplete.handledByAutocomplete) {
            return;
        }

        if (event.key === 'ArrowDown') {
            if (currentLineIndex < numLines - 1) {
                currentLineIndex = currentLineIndex + 1
            }
        }

        if (event.key === 'ArrowUp') {
            if (currentLineIndex > 0) {
                currentLineIndex = currentLineIndex - 1
            }
        }

        if (event.key === 'Enter') {
            // enter does not break current line.
            event.preventDefault()
            handleEnterKey();            
        }

        if (event.key === 'Backspace') {
            // event.preventDefault()
            handleBackspaceKey()
        }
        // Сбрасываем старый таймер
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Устанавливаем новый таймер
        debounceTimer = setTimeout(updateResult, 1000);
    });


    function handleEnterKey(){
        const cursorPosition = editor.selectionStart; // Позиция курсора
        const text = editor.value;

        numLines = numLines + 1
        currentLineIndex = currentLineIndex + 1

        // Найти начало текущей строки
        let lastNewlineIndex = text.indexOf('\n', cursorPosition - 1);

        // Если курсор в начале строки
        if (cursorPosition === 0 || cursorPosition === lastNewlineIndex + 1) {
            // Разделить текст
            const beforeLine = text.slice(0, lastNewlineIndex + 1); // Всё до текущей строки
            const currentAndAfterLine = text.slice(lastNewlineIndex + 1); // Текущая строка и далее

            // Вставить новую строку выше
            editor.value = `${beforeLine}\n${currentAndAfterLine}`;

            // Курсор остаётся на той же позиции
            editor.selectionStart = editor.selectionEnd = cursorPosition + 1;
        } else {
            if (lastNewlineIndex === -1) {
                lastNewlineIndex = text.length
            }
            const beforeCursor = text.slice(0, lastNewlineIndex + 1); // До курсора
            const afterCursor = text.slice(lastNewlineIndex + 1); // После курсора

            // Вставить новую строку ниже, не разрывая текущую строку
            editor.value = `${beforeCursor}\n${afterCursor}`;
            editor.selectionStart = editor.selectionEnd = lastNewlineIndex + 1;
        }
        lineManager.updateLines(editor.value);
    }

    function handleBackspaceKey() {    
        lineManager.updateLines(editor.value);
    }


    function protectEditPipe(event) {
        const cursorPosition = editor.selectionStart;
        const text = editor.value;

        // Проверяем, есть ли разделитель ` | `
        const pipeIndex = text.indexOf(' | ');
        const hasPipe = pipeIndex !== -1; // Проверка наличия ` | `
        const pipePosition = hasPipe ? pipeIndex + 3 : -1; // Позиция после `_ | _` или -1, если `|` нет

        if (hasPipe) {
            // 1. Запрещаем ввод в области `_ | _`
            if (
                cursorPosition > pipeIndex && // Курсор находится после адреса
                cursorPosition < pipePosition && // Курсор в пределах `_ | _`
                event.key !== 'ArrowLeft' &&
                event.key !== 'ArrowRight' &&
                event.key !== 'Backspace'
            ) {
                event.preventDefault();
                return;
            }

            // 2. Удаляем `_ | _` при нажатии Backspace, если курсор прямо перед `_ | _`
            if (event.key === 'Backspace' && cursorPosition === pipePosition) {
                event.preventDefault();
                editor.value = text.slice(0, pipeIndex) + text.slice(pipePosition); // Убираем `_ | _`
                editor.selectionStart = editor.selectionEnd = pipeIndex; // Ставим курсор в конец адреса
                return;
            }
        } else {
            console.log(11, event.key)
            // 3. Если адреса еще нет, запрещаем ввод пробела без адреса
            if (cursorPosition === 0 && event.key === ' ') {
                event.preventDefault();
                return;
            }
        }
    }

    // Функция для выполнения кода и вывода результата
    function evaluateCode() {
        const lines = editor.value.split('\n');
        const variables = {};

        let result = '';
        for (let i = 0; i <= lines.length - 1; i++) {
            const line = lines[i]
            let [left, right = left] = line.split(' | ')

            try {            
                const value = new Function(...Object.keys(variables), `return ${right}`)(
                    ...Object.values(variables)
                )
                if (line.includes('|')) {
                    variables[left] = value;
                }
                
                result = `${left} = ${JSON.stringify(value)}`
            } catch (err) {
                variables[left] = undefined;
                result = `Ошибка: ${err.message}`
            }
        }

        return result
    }


    function updateResult() {
        const result = evaluateCode(); // Получаем команду из редактора
        resultElement.innerText = result; // Выводим результат в элемент

        const translatedCode = translator(editor.value); // Преобразуем команду с помощью транслятора
        handleCommand(translatedCode); // Отправляем команду в тренажер
    }

    function setTranslator(newTranslator) {
        translator = newTranslator;
    }
}

// Callback для получения подсказок
function getSuggestions(lastWord) {
    return Object.keys(specNamespace).concat(...Object.keys(namespace).filter((variable) =>
        variable.startsWith(lastWord)
    ));
}

// Callback для добавления новой переменной
function addVariable(variable) {
    if (!namespace[variable]) {
        namespace[variable] = null; // Новая переменная
        console.log(`Добавлена переменная: ${variable}`);
    }
}

function handleCommand(command) {
    try {
        trainerAPI?.runCommand?.(command); // Отправляем команду тренажеру
    } catch(error) {
        console.error('Тренажер не подключен или отсутствует метод runCommand.');
    }
}