// Основной контейнер для отображения контента
const content = document.getElementById('content');
const editorContainer = document.getElementById('editor-container');
const trainerContainer = document.getElementById('trainer-container');

// Функция для загрузки редактора
let editorAPI = null;
async function loadEditor() {
    editorContainer.innerHTML = '<p>Загрузка редактора...</p>';
    try {
        const editorModule = await import('./editor.js');
        editorModule.init(editorContainer); // Инициализация редактора
        editorAPI = editorModule; // Сохраняем ссылку на API редактора
    } catch (error) {
        editorContainer.innerHTML = `<p>Ошибка загрузки редактора: ${error.message}</p>`;
    }
}

async function loadTrainer(trainer) {
    trainerContainer.innerHTML = '<p>Загрузка тренажера...</p>';
    try {
        const trainerModule = await import(`./${trainer}.js`);
        trainerModule.init(trainerContainer); // Инициализация тренажера

        // Передаем API тренажера редактору
        if (editorAPI) {
            editorAPI.setTrainerAPI({
                runCommand: trainerModule.runCommand,
                extendNamespace: trainerModule.namespace,
            });
        }
    } catch (error) {
        trainerContainer.innerHTML = `<p>Ошибка загрузки тренажера: ${error.message}</p>`;
    }
}

// Добавляем обработчики для пунктов меню
document.querySelectorAll('#menu a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const trainer = event.target.dataset.trainer;
        loadTrainer(trainer);
    });
});

// Загружаем редактор по умолчанию
loadEditor('editor');
