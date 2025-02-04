import './robot.css'

let thoughts
let commandString
const delay = 3000;
const variables = {}; // Переменные и их клетки
let cells
let robot
let robotApi


export function init({ container, output }) {
    container.innerHTML = `
    <div><h2>Робот</h2></div>
    <div class="controls">      
        <div>Команда: <span id="command"/></div>  
        <div>Вычисления робота: <span class="thoughts" id="robotThoughts"/></div>        
    </div>
    
    <div class="container"> 
        <div id="robot"></div>       
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
    </div>
    `

    thoughts = document.querySelector('#robotThoughts')
    commandString = document.querySelector('#command')
    cells = document.querySelectorAll('.cell')
    robot = document.querySelector('#robot')
    robotApi = {
        x: 0,
        y: -80,
    
        sendMessage({ value }) {
            robot.textContent = value;
        },
        sendOutput({ value }) {            
            thoughts.textContent = value
        },
        gotoStart() {
            robot.style.left = `${this.x}px`;
            robot.style.top = `${this.y}px`;
        }
    }
}

async function runCommand(command) {
    if (!command) return;
    const [lastCommand] = command.split(';').slice(-1)

    robotApi.sendMessage({ value: '' })
    commandString.textContent = lastCommand.replace('=', ' | ')

    const parts = lastCommand.split('=');
    if (parts.length === 2) {
        await writeVariable({ name: parts[0], expression: parts[1] })
    } else if (parts.length === 1) {
        await readVariable({ name: parts[0] })
    }

    robotApi.gotoStart()
}

async function writeVariable({ name, expression }) {
    if (!/^[a-z]$/i.test(name)) {
        robotApi.sendMessage({ value: "Допустимы только одиночные буквы (a-z)" });
        return;
    }

    const value = await evalExpression({ expression })
    await writeCell({ cell: variables[name], name, value })

}

async function evalExpression({ expression }) {
    // Разделяем выражение на части (операнды и операции)
    const parts = expression.split(/([+\-*/^()])/).map(p => p.trim()).reverse();

    // Обрабатываем арифметическое выражение
    let operation = null;
    let currentValue = 0;
    let currentExpression = [];

    // Обрабатываем операнды и операции справа налево
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        currentExpression.push(part)
        robotApi.sendOutput({ value: currentExpression.join('') })

        if (["+", "-", "*", "/", "^"].includes(part)) {
            // Если это оператор, выполняем операцию
            operation = part;
        } else {
            let operand

            if (!isNaN(part)) {
                // Если это число, выполняем операцию с числом
                operand = parseFloat(part);
            }
            else {
                const cell = variables[part];
                operand = await readCell({ cell })
            }

            if (operation) {
                if (operation === "+") currentValue += operand;
                if (operation === "-") currentValue -= operand;
                if (operation === "*") currentValue *= operand;
                if (operation === "/") currentValue /= operand;
                if (operation === "^") currentValue = Math.pow(currentValue, operand);
                operation = null; // Сбрасываем оператор
            } else {
                currentValue = operand;
            }

            currentExpression = currentExpression.slice(0, -1).concat(operand)
            robotApi.sendOutput({ value: currentExpression.join('') })

            await new Promise((resolve) => setTimeout(resolve, delay));
            robotApi.sendMessage({ value: currentValue })
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return currentValue;
}


async function readVariable({ name }) {
    if (!(name in variables)) {
        robotApi.sendMessage({ value: `нет "${name}"` })
        return;
    }
    const cell = variables[name]

    return await readCell({ cell })
}


async function readCell({ cell }) {
    await gotoCell({ cell })
    openCell({ cell })
    const value = getCellValue({ cell })
    robotApi.sendMessage({ value })

    await new Promise((resolve) => setTimeout(resolve, delay))
    return value
}

async function gotoCell({ cell }) {
    // определить координаты клетки и задать их роботу. 
    const targetX = cell.offsetLeft + (cell.offsetWidth / 2) - (robot.clientWidth / 2);
    const targetY = cell.offsetTop + (cell.offsetHeight / 2) - (robot.clientHeight / 2);

    // Меняем только координаты, transition уже есть в CSS
    robot.style.transition = `all ${delay / 1000}s ease`;
    robot.style.left = `${targetX}px`;
    robot.style.top = `${targetY}px`;

    return new Promise((resolve) => setTimeout(resolve, delay))
}

async function writeCell({ cell, name, value }) {
    let targetCell = cell

    // найти первую свободную клетку.
    if (!targetCell) {
        targetCell = Array.from(cells).find(cell => !cell.dataset.varName);
        if (!targetCell) {
            alert("Достигнуто максимальное количество переменных (9)");
            return;
        }
    }


    await gotoCell({ cell: targetCell })


    if (cell != targetCell) {
        setCellName({ cell: targetCell, name })
    }

    openCell({ cell: targetCell })

    setCellValue({ cell: targetCell, value })

}


function setCellName({ cell, name }) {
    variables[name] = cell;
    cell.dataset.varName = name;
    const label = document.createElement("div");
    label.classList.add("label");
    label.textContent = name.toUpperCase();
    cell.appendChild(label);

}

function setCellValue({ cell, value }) {
    cell.dataset.value = value;
}

function getCellValue({ cell }) {
    return Number(cell.dataset.value)
}


function openCell({ cell }) {
    cell.style.backgroundColor = "lightgreen";
    setTimeout(() => {
        cell.style.backgroundColor = "lightgray";
    }, 1000);
}

export {
    runCommand
}