const boxGame = document.querySelector(".box__game");
const scoreElement = document.querySelector(".heading__current-score");
const highScoreElement = document.querySelector(".heading__high-score");
const scoreModal = document.querySelector(".score");
const highScoreModal = document.querySelector(".high-score");
const replayBtn = document.querySelector(".modal__content button");
const controlBtn = document.querySelectorAll(".control button");
const audioEatingApple = new Audio("./assets/audio/biting-into-an-apple.mp3");
const audioHurt = new Audio("./assets/audio/umph.mp3");
const themeSong = new Audio("./assets/audio/Snake Game - Theme Song.mp3");

let snakeX = 15,
  snakeY = 15;
let randomArr = [1, -1];
let foodX = snakeX + randomArr[Math.floor(Math.random() * randomArr.length)], foodY = snakeY + randomArr[Math.floor(Math.random() * randomArr.length)];
let velocityX = 0,
  velocityY = 0;
let rockX, rockY;
let rockList = [];

let speed = 70;
let snakeBody = [];
let gameOver = false;
let modal = document.querySelector(".modal");
let score = 0;
let random;
let allEffect = [];
let through = false;

let listEffect = [
  {
    name: 'normal',
    time: undefined,
    speed: 70,
    point: 1,
    through: false
  },
  {
    name: 'normal',
    time: undefined,
    speed: 70,
    point: 1,
    through: false
  },
  {
    name: 'normal',
    time: undefined,
    speed: 70,
    point: 1,
    through: false
  },
  {
    name: 'gold',
    time: undefined,
    speed: 70,
    point: 10,
    through: false
  },
  {
    name: 'slow',
    time: 15,
    speed: 125,
    point: 2,
    through: false
  },
  {
    name: 'invincible',
    time: 10,
    speed: 70,
    point: 5,
    through: true
  }
]

random = Math.floor(Math.random() * listEffect.length);
function randomAppleEffect(){
  listEffect.forEach((effect, index) => {
    if(index === random){
      document.querySelector('.game__apple').classList.add(`${effect.name}`)
    }
  })
}


let highScore = localStorage.getItem("heading__high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;
highScoreModal.innerText = `High Score: ${highScore}`;

let intervalId;
let randomEffect;
// Creat random rock position
(() => {
  for (let i = 0; i < 10; i++) {
    rockX = Math.floor(Math.random() * 30 + 1);
    rockY = Math.floor(Math.random() * 30 + 1);
    rockList.push([rockX, rockY]);
  }
})()

// if rock spawn on snake -> hidden
rockList.forEach(function(rock,index){
  if(rock[0] === snakeX && rock[1] === snakeY){
    rockList.splice(index, 1);
  }
})

// creat random food if food position
const randomFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
};


let htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
function initGame() {

  // check if rock position = food position -> creat new food
  rockList.forEach((rock) => {
    if ((foodX !== rock[0], foodY !== rock[1])) {
        htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
    } 
    else {
      randomFoodPosition();
    }
  });
  //   create rock
  rockList.forEach(function (rock) {
    htmlMarkup += ` <div class = "rock" style = 'grid-area: ${rock[1]} / ${rock[0]}'></div>`;
  });
  //   shift snake body
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

    // update snake head position
    snakeX += velocityX;
    snakeY +=  velocityY;



  //   if food has eaten -> snake length + 1
  if (snakeX === foodX && snakeY === foodY) {
    audioEatingApple.play();
    listEffect.forEach((effect,index) => {
      if(index === random){
        score += effect.point;
        through = effect.through;
        speed = effect.speed;
      }
    })
    
    randomFoodPosition();
    random = Math.floor(Math.random() * listEffect.length);

    // random apple effec
    snakeBody.push([foodX, foodY]);



    // while high score > score -> high score = score;
    highScore = score > highScore ? score : highScore;

    localStorage.setItem("heading__high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
    scoreModal.innerText = `Score: ${score}`;
    highScoreModal.innerText = `High Score: ${highScore}`;
  }



  for (let i = 0; i < snakeBody.length; i++) {
    // Adding a div for each part of the snake's body
    htmlMarkup += `<div class="game__snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]};"></div>`;
    // if snake head reach snake body -> game over
    if (
      i != 0 &&
      snakeBody[0][1] === snakeBody[i][1] &&
      snakeBody[0][0] === snakeBody[i][0]
    ) {
      if(through === false){
        audioHurt.play();
        gameOver = true;
      }
      else {

      }
    }
  }

    //   if snake reach rock -> game over
    rockList.forEach(function (rock) {
      if (snakeX === rock[0] && snakeY === rock[1]) {
        if(through === false){
        audioHurt.play();
        gameOver = true;
      }
      }
    });

  //   if snake reach wall -> game over
  if (snakeX < 1 || snakeX > 30 || snakeY < 1 || snakeY > 30) {
    if(through === false){
      audioHurt.play();
      gameOver = true;
    }
    else {
      if(snakeX === 0){
        snakeX = 30
      }
      if(snakeX === 31){
        snakeX = 1
      }
      if(snakeY === 0){
        snakeY = 30
      }
      if(snakeY === 31){
        snakeY = 1
      }
    }
  }

  boxGame.innerHTML = htmlMarkup;
  randomAppleEffect()
  //   set snake head color = yellowgreen
  let snakeLength = document.querySelectorAll(".game__snake");
  if (snakeLength.length === 1) {
    snakeLength[0].style.filter = 'brightness(120%)'
  }

  if (gameOver) {
    handleGameOver();
  }
}

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


intervalId = setInterval(initGame,speed);
// Game over
const handleGameOver = () => {
  clearInterval(intervalId);
  modal.classList.add("show");
  replayBtn.addEventListener("click", function (e) {
    location.reload();
    modal.classList.remove("show");
  });
  if (modal.classList.contains("show")) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        location.reload()
        modal.classList.remove("show");
      }
    });
  }
};



