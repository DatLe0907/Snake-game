const boxGame = document.querySelector(".box__game");
const scoreElement = document.querySelector(".heading__current-score");
const highScoreElement = document.querySelector(".heading__high-score");
const scoreModal = document.querySelector(".score");
const highScoreModal = document.querySelector(".high-score");
const replayBtn = document.querySelector(".modal__content button");
const controlBtn = document.querySelectorAll(".control button");
// const audioEatingApple = new Audio("./assets/audio/biting-into-an-apple.mp3");
// const audioHurt = new Audio("./assets/audio/umph.mp3");
// const themeSong = new Audio("./assets/audio/Snake Game - Theme Song.mp3");

let snakeX = 15,
  snakeY = 15;
let randomArr = [1, -1];
let foodX, foodY;
let velocityX = 0,
  velocityY = 0;
let rockX, rockY;
let rockList = [];

let speed = 100;
let snakeBody = [];
let gameOver = false;
let modal = document.querySelector(".modal");
let score = 0;

let highScore = localStorage.getItem("heading__high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;
highScoreModal.innerText = `High Score: ${highScore}`;

let intervalId;

const reset = () => {
  snakeY = 15;
  snakeX = 15;
  randomArr = [1, -1];
  foodX = 0;
  foodY = 0;
  velocityX = 0;
  velocityY = 0;
  rockList = [];
  rockX = 0;
  rockY = 0;
  speed = 100;
  snakeBody = [];
  gameOver = false;
  score = 0;
};

// Creat random rock position
const randomRock = () => {
  for (let i = 0; i < 10; i++) {
    rockX = Math.floor(Math.random() * 30 + 1);
    rockY = Math.floor(Math.random() * 30 + 1);
    rockList.push([rockX, rockY]);
  }
};
// creat random food if food position != rock position else recreate
const randomFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
};
function initGame(){
      // update snake head position
  snakeX = snakeX + velocityX;
  snakeY = snakeY + velocityY;

  //   shift snake body
  for (let i = snakeBody.length - 1; i >= 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

  let htmlMarkup;
  rockList.forEach((rock) => {
    if ((foodX !== rock[0], foodY !== rock[1])) {
      htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
    } else {
      randomFoodPosition();
    }
  });
  //   create rock
  rockList.forEach(function (rock) {
    htmlMarkup += ` <div class = 'rock' style = 'grid-area: ${rock[1]} / ${rock[0]}'></div>`;
  });

  //   if food has eaten -> snake length + 1
  if (snakeX === foodX && snakeY === foodY) {
    // audioEatingApple.play();
    randomFoodPosition();
    snakeBody.push([foodX, foodY]);
    score++;

    // while score % 10 == 0 -> snake speed up
    // if (score % 10 === 0 && score !== 0) {
    //   speed -= 10;
    // }

    // while high score > score -> high score = score;
    highScore = score > highScore ? score : highScore;

    localStorage.setItem("heading__high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    scoreModal.innerText = `Score: ${score}`;
    highScoreModal.innerText = `High Score: ${highScore}`;
  }

  //   if snake reach rock -> game over
  rockList.forEach(function (rock) {
    if (snakeX === rock[0] && snakeY === rock[1]) {
      // audioHurt.play();
      gameOver = true;
    }
  });

  for (let i = 0; i < snakeBody.length; i++) {
    // Adding a div for each part of the snake's body
    htmlMarkup += `<div class="game__snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]};"></div>`;
    // if snake head reach snake body -> game over
    if (
      i != 0 &&
      snakeBody[0][1] === snakeBody[i][1] &&
      snakeBody[0][0] === snakeBody[i][0]
    ) {
      // audioHurt.play();
      gameOver = true;
    }
  }

  //   if snake reach wall -> game over
  if (snakeX < 1 || snakeX > 30 || snakeY < 1 || snakeY > 30) {
    // audioHurt.play();

    gameOver = true;
  }

  boxGame.innerHTML = htmlMarkup;
  //   set snake head color = yellowgreen
  let snakeLength = document.querySelectorAll(".game__snake");
  if (snakeLength.length === 1) {
    snakeLength[0].style.background = "#ffff00";
  }

  if (gameOver) {
    handleGameOver();
  }
};
// random rock and food
function random() {
  randomRock();
  randomFoodPosition();
}

function control() {
  document.addEventListener("keydown", function (e) {
    // change velocity when key down
    if (e.key === "ArrowUp" && velocityY != 1) {
      velocityX = 0;
      velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
      velocityX = 0;
      velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
      velocityX = -1;
      velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
      velocityX = 1;
      velocityY = 0;
    }
  });

  controlBtn.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (this.classList[0] === "up" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
      } else if (this.classList[0] === "down" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
      } else if (this.classList[0] === "left" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
      } else if (this.classList[0] === "right" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
      }
    });
  });
}

function startGame() {
  random();
  control();
  intervalId = setInterval(initGame, speed);
}

startGame();

// Game over
const handleGameOver = () => {
  clearInterval(intervalId);
  modal.classList.add("show");
  replayBtn.addEventListener("click", function (e) {
    reset();
    startGame()
    modal.classList.remove("show");
  });
  if (modal.classList.contains("show")) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        reset();
        startGame()
        modal.classList.remove("show");
      }
    });
  }
};
