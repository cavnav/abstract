const STRING = 'строка'

// Функция для загрузки стилей
function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './js/autocomplete.css'; // Путь к вашему CSS-файлу
    document.head.appendChild(link);
}
// Вызываем функцию загрузки стилей при инициализации тренажера
loadStyles();

export default class Autocomplete {
    constructor({editor, getSuggestionsCallback, addVariableCallback}) {
        this.editor = editor
        this.getSuggestions = getSuggestionsCallback; // Функция получения подсказок
        this.addVariable = addVariableCallback; // Функция добавления переменной
        this.handledByAutocomplete = false // флаг обработки события подсказками


        this.init();
    }

    init() {
        this.suggestionBox = document.createElement('div');
        this.suggestionBox.id = 'suggestion-box';
        this.suggestionBox.style.display = 'none';
        this.suggestionBox.style.position = 'absolute';
        this.suggestionBox.style.zIndex = '1000';
        this.suggestionBox.style.backgroundColor = 'white';
        this.suggestionBox.style.border = '1px solid #ccc';
        this.suggestionBox.style.padding = '5px';
        this.suggestionBox.style.borderRadius = '4px';
        document.body.appendChild(this.suggestionBox);


        editor.addEventListener('input', (event) => this.handleInput(event));
        editor.addEventListener('keydown', (event) => this.handleKeyDown(event));

    }

    getCursorPosition(editor) {
        const range = editor.selectionStart; // Позиция курсора
        const rect = editor.getBoundingClientRect();
        const lines = editor.value.substr(0, range).split('\n');
        const lineHeight = 30; // Высота строки (подстрой под стиль текста)

        const x = rect.left + lines[lines.length - 1].length * 8; // 8px — ширина символа (подстрой при необходимости)
        const y = rect.top + lines.length * lineHeight;

        return { x, y };
    }


    handleInput(event) {
        const inputValue = this.editor.value.substring(0, this.editor.selectionStart);
        const lastWordMatch = inputValue.match(/\b[a-zA-Z0-9_]+$/);

        if (lastWordMatch) {
            const lastWord = lastWordMatch[0];
            const suggestions = this.getSuggestions(lastWord);

            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
            } else {
                this.hideSuggestions();
            }
        } else {
            this.hideSuggestions();
        }

        // Если пользователь нажал пробел, создаем переменную
        if (event.inputType === 'insertText' && event.data === ' ') {
            const words = inputValue.trim().split(/\s+/);
            const newVariable = words[words.length - 2]; // Предпоследнее слово

            if (newVariable && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newVariable)) {
                this.addVariable(newVariable);
                console.log('add new')
            }
        }
    }

    handleKeyDown(event) {
        console.log('arrowDown autocomplete')
        if (this.suggestionBox.style.display === 'block') {
            const activeItem = this.suggestionBox.querySelector('.active');
            const items = Array.from(this.suggestionBox.children);

            this.handledByAutocomplete = false

            if (event.key === 'ArrowDown') {
                event.preventDefault()
                this.handledByAutocomplete = true
                const nextItem = activeItem
                    ? activeItem.nextElementSibling || items[0]
                    : items[0];
                if (activeItem) activeItem.classList.remove('active');
                nextItem.classList.add('active');
                return true; // Событие обработано
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()
                this.handledByAutocomplete = true
                const prevItem = activeItem
                    ? activeItem.previousElementSibling || items[items.length - 1]
                    : items[items.length - 1];
                if (activeItem) activeItem.classList.remove('active');
                prevItem.classList.add('active');
                return true; // Событие обработано
            }

            if (event.key === 'Enter') {                
                if (activeItem) {
                    event.preventDefault();
                    this.handledByAutocomplete = false;

                    const inputValue = this.editor.value.substring(0, this.editor.selectionStart);
                    const lastWordMatch = inputValue.match(/[\w]+$/); // Ищем последнее слово вне кавычек
                    const lastWord = lastWordMatch ? lastWordMatch[0] : "";

                    if (activeItem.textContent === STRING && lastWord) {
                        this.insertAtCursor(`"${lastWord}"`);
                    } else {
                        this.insertAtCursor(activeItem.textContent);
                    }
                }
                this.hideSuggestions();
            }
        }
    }




    showSuggestions(suggestions) {
        const cursorPos = this.getCursorPosition(this.editor);

        this.suggestionBox.style.left = `${cursorPos.x}px`; // Используй позицию курсора
        this.suggestionBox.style.top = `${cursorPos.y + 10}px`;
        this.suggestionBox.style.display = 'block';
        this.suggestionBox.innerHTML = '';

        [STRING].concat(...suggestions).forEach((suggestion) => {
            const item = document.createElement('div');
            item.textContent = suggestion;
            item.className = 'suggestion-item';
            item.style.padding = '2px 5px';
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                this.insertAtCursor(suggestion);
                this.hideSuggestions();
            });
            this.suggestionBox.appendChild(item);
        });
    }


    hideSuggestions() {
        this.suggestionBox.style.display = 'none';
    }

    insertAtCursor(text) {
        // Получаем позиции курсора
        const start = this.editor.selectionStart; // Начало выделения (или курсора)
        const end = this.editor.selectionEnd; // Конец выделения (или курсора)

        // Получаем текст, который был введен (до курсора)
        const inputText = this.editor.value.substring(0, start);

        // Находим последнее введенное слово
        const lastWord = inputText.split(/\s+/).pop();

        // Заменяем введенное слово на подсказку
        this.editor.value =
            this.editor.value.substring(0, start - lastWord.length) + // Убираем введенное слово
            text + // Вставляем подсказку
            this.editor.value.substring(end); // Добавляем оставшийся текст после курсора

        // Устанавливаем новый курсор в конец вставленной подсказки
        this.editor.selectionStart = this.editor.selectionEnd = start - lastWord.length + text.length;

        // Фокусируем редактор
        this.editor.focus();
    }
}
