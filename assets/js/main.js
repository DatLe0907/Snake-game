const boxGame = document.querySelector(".box__game");
const scoreElement = document.querySelector(".heading__current-score");
const highScoreElement = document.querySelector(".heading__high-score");
const scoreModal = document.querySelector(".score");
let highScoreModal = document.querySelector(".high-score");
const replayBtn = document.querySelector(".modal__content button");
const controlBtn = document.querySelectorAll(".control button");
const audioEatingApple = new Audio("./assets/audio/biting-into-an-apple.mp3");
const audioHurt = new Audio("./assets/audio/umph.mp3");
const themeSong = new Audio("./assets/audio/Snake Game - Theme Song.mp3");

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


function randomRock() {
    for (let i = 0; i < 10; i++) {
        rockX = Math.floor(Math.random() * 30 + 1);
        rockY = Math.floor(Math.random() * 30 + 1);
        rockList.push([rockX, rockY]);
    }
}
randomRock();

const handleGameOver = () => {
  clearInterval(setInterValId);
  modal.classList.add("show");
  replayBtn.addEventListener("click", function (e) {
    location.reload();
  });
  if (modal.classList.contains("show")) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        location.reload();
      }
    });
  }
};

let htmlMarkup;
const randomFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
  rockList.forEach((rock) => {
    if ((foodX !== rock[0], foodY !== rock[1])) {
      htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
    } else {
      randomFoodPosition();
    }
    
  });
};

randomFoodPosition();

const initGame = () => {
  if (gameOver) {
    handleGameOver();
  }

  rockList.forEach(function (rock) {
    htmlMarkup += ` <div class = 'rock' style = 'grid-area: ${rock[1]} / ${rock[0]}'></div>`;
  });

  if (snakeX === foodX && snakeY === foodY) {
    audioEatingApple.play();
    randomFoodPosition();
    snakeBody.push([foodX, foodY]);
    console.log(snakeBody)

    score++;
    if (score % 10 === 0) {
      speed -= 10;
    }
    highScore = score > highScore ? score : highScore;

    localStorage.setItem("heading__high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    scoreModal.innerText = `Score: ${score}`;
    highScoreModal.innerText = `High Score: ${highScore}`;
  }

  rockList.join("");
  rockList.forEach(function (rock) {
    if (snakeX === rock[0] && snakeY === rock[1]) {
      audioHurt.play();
      gameOver = true;
    }
  });

  // update snake head position
  snakeX = snakeX + velocityX;
  snakeY = snakeY + velocityY;

  for (let i = snakeBody.length - 1; i >= 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

  for (let i = 0; i < snakeBody.length; i++) {
    htmlMarkup += `<div class="game__snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]};"></div>`;
    if (
      i != 0 &&
      snakeBody[0][1] === snakeBody[i][1] &&
      snakeBody[0][0] === snakeBody[i][0]
    ) {
      audioHurt.play();

      gameOver = true;
    }
  }

  if (snakeX < 1 || snakeX > 30 || snakeY < 1 || snakeY > 30) {
    audioHurt.play();

    gameOver = true;
  }

  boxGame.innerHTML = htmlMarkup;
  let snakeLength = document.querySelectorAll(".game__snake");
  if (snakeLength.length === 1) {
    snakeLength[0].style.background = "#ffff00";
  }
};

let setInterValId = setInterval(initGame, speed);

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
