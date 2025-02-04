// Основной контейнер для отображения контента
const getEditorContainer = () => document.getElementById('editor-container');
const getTrainerContainer = () => document.getElementById('trainer-container');

// Функция для загрузки редактора
let editorAPI = null;
export async function loadEditor() {
    const editorContainer = getEditorContainer()
    editorContainer.innerHTML = '<p>Загрузка редактора...</p>';
    try {
        resetContainer(getTrainerContainer())
        const editorModule = await import('./editor.js');
        editorModule.init(editorContainer); // Инициализация редактора
        editorAPI = editorModule; // Сохраняем ссылку на API редактора
    } catch (error) {
        editorContainer.innerHTML = `<p>Ошибка загрузки редактора: ${error.message}</p>`;
    }
}

async function loadTrainer(trainer) {
    resetContainer(getTrainerContainer())
    const trainerContainer = getTrainerContainer()
    trainerContainer.innerHTML = '<p>Загрузка тренажера...</p>';
    try {        
        const trainerModule = await import(`./trainers/${trainer}.js`);
        trainerModule.init({container: trainerContainer, output: editorAPI.output}); // Инициализация тренажера

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
document.querySelectorAll('#menu .trainers a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const trainer = event.target.dataset.trainer;
        loadTrainer(trainer);
    });
});

document.getElementById('editor-link').addEventListener('click', () => {
    loadEditor()
})


function resetContainer(container) {
    if (container) {
        const wrapper = container.parentNode;

        // Создаем новый контейнер
        const newContainer = document.createElement('div');
        newContainer.id = container.id;

        // Заменяем старый контейнер на новый
        wrapper.replaceChild(newContainer, container);
    } else {
        console.warn(`Контейнер не найден.`);
    }
}




// Загружаем редактор по умолчанию
loadEditor();
