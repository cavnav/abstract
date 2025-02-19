import './parking.css'


let outputCallback

export function init({container, output}) {
    outputCallback = output
    container.innerHTML=`
        <canvas id="gameCanvas" width="400" height="400"></canvas>
        <div id="status">Запаркуйте машину!</div>
    ` 
    
    generateGame()
}

function generateGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const carSize = 40;
    let car = { x: 20, y: 20 };
    let parkingSpot = { x: 320, y: 320 };
    let obstacles = [
        { x: 150, y: 150, width: 100, height: 20 },
        { x: 100, y: 250, width: 20, height: 100 }
    ];

    let gameOver = false;
    let startTime = Date.now();
    const timeLimit = 30000; // 30 секунд

    // Замените URL на нужный
    const carImage = new Image();
    carImage.src = "https://png.pngtree.com/png-clipart/20220628/original/pngtree-car-transportation-green-cartoon-png-image_8253021.png"; 

    function drawCar() {
        ctx.drawImage(carImage, car.x, car.y, carSize, carSize);
    }

    function drawParkingSpot() {
        ctx.fillStyle = "green";
        ctx.fillRect(parkingSpot.x, parkingSpot.y, carSize, carSize);
    }

    function drawObstacles() {
        ctx.fillStyle = "brown";
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function checkCollision(newX, newY) {
        return obstacles.some(obstacle =>
            newX < obstacle.x + obstacle.width &&
            newX + carSize > obstacle.x &&
            newY < obstacle.y + obstacle.height &&
            newY + carSize > obstacle.y
        );
    }

    function updateGame() {
        if (gameOver) return;

        let elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeLimit) {
            document.getElementById("status").textContent = "Вы проиграли! Время вышло!";
            gameOver = true;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawParkingSpot();
        drawObstacles();
        drawCar();

        if (car.x === parkingSpot.x && car.y === parkingSpot.y) {
            document.getElementById("status").textContent = "Поздравляем! Вы запарковались!";
            gameOver = true;
        }
    }

    document.addEventListener("keydown", (event) => {
        if (gameOver) return;

        let newX = car.x;
        let newY = car.y;

        if (event.key === "ArrowUp") newY -= 10;
        if (event.key === "ArrowDown") newY += 10;
        if (event.key === "ArrowLeft") newX -= 10;
        if (event.key === "ArrowRight") newX += 10;

        if (newX >= 0 && newX + carSize <= canvas.width &&
            newY >= 0 && newY + carSize <= canvas.height &&
            !checkCollision(newX, newY)) {
            car.x = newX;
            car.y = newY;
        }

        updateGame();
    })

    carImage.onload = updateGame; // Чтобы нарисовать машинку после загрузки изображения
}

function runCommand(){

}

export {
    runCommand,
}