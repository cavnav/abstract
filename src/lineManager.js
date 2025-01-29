// Функция для загрузки стилей
function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './src/lineManager.css'; // Путь к вашему CSS-файлу
    document.head.appendChild(link);
  }
loadStyles();

class LineManager { 
    constructor({ editor, editorContainer }) { 
        if (!editor || !editorContainer) { 
            console.error('Both editor and editorContainer are required for LineManager.'); 
            return; 
        } 
 
        this.editor = editor; 
        this.editorContainer = editorContainer; 
        this.lineNumbersContainer = document.createElement('div'); 
        this.lineNumbersContainer.id = 'lineNumbers'; 
 
        // Вставляем блок с номерами строк перед редактором 
        this.editor.before(this.lineNumbersContainer); 
 
        // Обновление номеров строк при инициализации 
        this.updateLines(this.editor.value || ''); 
 
        // Синхронизация высоты и прокрутки 
        this.syncStyles(); 
 
        // Обработчики событий 
        this.editor.addEventListener('input', () => this.updateLines(this.editor.value)); // Обработчик input для обновления номеров строк 
        this.editor.addEventListener('scroll', () => this.syncScroll()); 
        this.editor.addEventListener('click', () => this.highlightActiveLine()); 
        this.editor.addEventListener('keydown', () => {
            // Используем setTimeout для отложенного вызова
            setTimeout(() => this.highlightActiveLine(), 0);
        }); 
 
        // Слежение за изменением размера редактора 
        this.resizeObserver = new ResizeObserver(() => this.syncStyles()); 
        this.resizeObserver.observe(this.editor); 
    } 
 
    // Метод для обновления номеров строк 
    updateLines(text) { 
        if (!this.editor || typeof text !== 'string') return; 
 
        const lines = text.split('\n'); 
        this.lineNumbersContainer.innerHTML = ''; // Очистка предыдущих номеров строк 
 
        lines.forEach((_, index) => { 
            const lineNumberElement = document.createElement('div'); 
            lineNumberElement.textContent = index + 1; 
            lineNumberElement.classList.add('line-number'); 
            this.lineNumbersContainer.appendChild(lineNumberElement); 
        }); 
 
        this.syncScroll(); 
        this.highlightActiveLine(); 
    } 
 
    // Синхронизация прокрутки номеров строк с редактором 
    syncScroll() { 
        if (!this.editor || !this.lineNumbersContainer) return; 
 
        // Синхронизируем прокрутку 
        this.lineNumbersContainer.scrollTop = this.editor.scrollTop; 
    } 
 
    // Метод для синхронизации стилей (включая высоту и шрифты) с переменными 
    syncStyles() { 
        if (!this.editor || !this.lineNumbersContainer) return; 
 
        // Синхронизируем размеры и шрифты, используя те же переменные 
        const editorStyles = getComputedStyle(this.editor); 
 
        // Применяем переменные стилей для шрифтов и высоты строк 
        this.lineNumbersContainer.style.fontSize = editorStyles.fontSize; 
        this.lineNumbersContainer.style.lineHeight = editorStyles.lineHeight; 
        
        // Подождём, пока offsetHeight станет доступен
        requestAnimationFrame(() => {
            const editorHeight = this.editor.offsetHeight;
            if (editorHeight > 0) {
                this.lineNumbersContainer.style.height = `${editorHeight}px`;
            } else {
                console.warn('Editor height is still not available.');
            }
            this.lineNumbersContainer.style.overflow = 'hidden'; 
        });
    } 
 
    // Метод для подсветки текущей активной строки 
    highlightActiveLine() { 
        if (!this.editor) return; 
 
        const cursorPosition = this.editor.selectionStart; 
        const text = this.editor.value; 
 
        if (cursorPosition === undefined || !text) return; 
 
        // Определяем активную строку на основе позиции курсора 
        const activeLineIndex = text.substring(0, cursorPosition).split('\n').length - 1; 
        const lineNumberElements = this.lineNumbersContainer.querySelectorAll('.line-number'); 
 
        // Немедленное обновление подсветки строки
        lineNumberElements.forEach((element, index) => { 
            element.classList.toggle('active', index === activeLineIndex); 
        }); 
    } 
} 
 
export { LineManager };
