const main = document.querySelector(".main");

function onloaded() {
  main.innerHTML = `
  <div class="modal">
        <div class="modal__overlay"></div>
        <div class="modal__content">
          <div class="content">
            <img src="./assets/img/modal/trophy.jpeg" alt="" />
            <h4 class="high-score"></h4>
          </div>
          <div class="content">
            <img src="./assets/img/modal/star.jpg" alt="" />
            <h4 class="score">Score: 0</h4>
          </div>
          <button>Play Again</button>
        </div>
      </div>
      <div class="snake-box">
          <div class="box__detail">
            <h4 class="heading__high-score">Hight Score: 0</h4>
            <div class = "heading__effect">
              <h4 class="heading__effect-time"></h4>
              <h4 class="heading__effect-time"></h4>
              <h4 class="heading__effect-time"></h4>
            </div>
            <h4 class="heading__current-score">Score: 0</h4>
          </div>
          
        <div class="wrapper">
          <div class="box__game"></div>
        </div>
      </div>
      <div class="control">
        <button class="up">
          <i class="fa-solid fa-chevron-up"></i>
        </button>
        <button class="down">
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <button class="left">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="right">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div class="footer">
        <i>Source: Datle0907</i>
        <span>From: Team IT07</span>
      </div>`;

  const boxGame = document.querySelector(".box__game");
  const scoreElement = document.querySelector(".heading__current-score");
  const highScoreElement = document.querySelector(".heading__high-score");
  const scoreModal = document.querySelector(".score");
  const highScoreModal = document.querySelector(".high-score");
  const replayBtn = document.querySelector(".modal__content button");
  const controlBtn = document.querySelectorAll(".control button");

  const audioEatingApple = new Audio("./assets/audio/biting-into-an-apple.mp3");
  const audioGold = new Audio("./assets/audio/gold.mp3");
  const audioSlow = new Audio("./assets/audio/slow.mp3");
  const audioInvincible = new Audio("./assets/audio/invincible.mp3");
  const audioInvincibleSecond = new Audio("./assets/audio/invincible-2.mp3");
  const audioHurt = new Audio("./assets/audio/umph.mp3");

  let snakeX = 15,
    snakeY = 15;
  let randomArr = [1, -1];
  let foodX = snakeX + randomArr[Math.floor(Math.random() * randomArr.length)],
    foodY = snakeY + randomArr[Math.floor(Math.random() * randomArr.length)];
  let velocityX = 0,
    velocityY = 0;
  let rockX, rockY;
  let rockList = [];

  let snakeBody = [];
  let gameOver = false;
  let modal = document.querySelector(".modal");
  let score = 0;
  let random;
  let originSpeed = 70;
  let speedEffect = originSpeed;
  let through = false;
  let listChoose = [
    {
      name: "normal",
      point: 1,
      percent: 70 / 100,
      time: undefined,
    },
    {
      name: "gold",
      point: 10,
      percent: 15 / 100,
      time: undefined,
    },
    {
      name: "slow",
      time: 15,
      speed: speedEffect + Math.floor(speedEffect * (20 / 100)),
      point: 2,
      percent: 10 / 100,
    },
    {
      name: "invincible",
      time: 10,
      point: 5,
      speed: speedEffect - Math.floor(speedEffect * (30 / 100)),
      through: true,
      percent: 5 / 100,
    },
  ];
  let listEffect = [];
  let selectListEffectLength = 100;
  function EffectListinGame(percent, obj) {
    for (let i = 1; i <= Math.floor(selectListEffectLength * percent); i++) {
      listEffect.unshift(obj);
    }
  }

  listChoose.forEach((effect) => {
    EffectListinGame(effect.percent, effect);
  });
  let listEffectHasTime = [];
  listChoose.forEach((item) => {
    listEffectHasTime.push(item);
  });
  let listEffectHasTimeFilter = listEffectHasTime.filter(
    (time) => time.time !== undefined
  );

  let effectTimeDisplayList = document.querySelectorAll(
    ".heading__effect .heading__effect-time"
  );
  // random effect index

  random = Math.floor(Math.random() * listEffect.length);
  function randomAppleEffect() {
    listEffect.forEach((effect, index) => {
      if (index === random) {
        // if random effect index = effect item -> add effect model
        document.querySelector(".game__apple").classList.add(`${effect.name}`);
      }
    });
  }

  let highScore = localStorage.getItem("heading__high-score") || 0;
  highScoreElement.innerText = `High Score: ${highScore}`;
  highScoreModal.innerText = `High Score: ${highScore}`;

  let intervalId;
  // Creat random rock position
  (() => {
    for (let i = 0; i < 10; i++) {
      rockX = Math.floor(Math.random() * 30 + 1);
      rockY = Math.floor(Math.random() * 30 + 1);
      rockList.push([rockX, rockY]);
    }
  })();

  // if rock spawn on snake -> hidden
  rockList.forEach(function (rock, index) {
    if (rock[0] === snakeX && rock[1] === snakeY) {
      rockList.splice(index, 1);
    }
  });

  // creat random food if food position
  const randomFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
  };

  //hàm để xóa hàm init cũ và gọi lại  hàm để cập nhật speed //----NOTE
  function newSpeed(type) {
    switch (type) {
      case 1:
        // dùng khi ăn táo có hiệu ứng ( có time Effect ) cập nhật time mới đó
        clearInterval(intervalId);
        intervalId = setInterval(initGame, speedEffect);
        break;
      case 2:
        // dùng khi táo hết thời gian hiệu ứng để xóa speed và set như cũ
        clearInterval(intervalId);
        intervalId = setInterval(initGame, originSpeed);
        break;
    }
  }

  let htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
  function initGame() {
    // check if rock position = food position -> creat new food
    rockList.forEach((rock) => {
      if ((foodX !== rock[0], foodY !== rock[1])) {
        htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
      } else {
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

    //   if food has eaten -> snake length + 1
    if (snakeX === foodX && snakeY === foodY) {
      switch (document.querySelector(".game__apple").classList[1]) {
        case "normal":
          audioEatingApple.play();
          break;
        case "gold":
          audioEatingApple.play();
          audioGold.play();
          break;
        case "slow":
          audioEatingApple.play();
          audioSlow.play();
          break;
        case "invincible":
          audioEatingApple.play();
          audioInvincibleSecond.play();
          setTimeout(() => {
            audioInvincible.play();
          },700)
          break;
      }
      listEffect.forEach((effect, index) => {
        if (index === random) {
          score += effect.point;
          // let speedUpCount = score / 10;
          // for (let i = 1; i <= speedUpCount; i++) {
          //   if (speedEffect >= 30) {
          //     speedEffect -= Math.floor(originSpeed * (5 / 100));
          //     speedUpCount-= i
          //   }
          //   newSpeed(1);
          // }
          let timeEffect;
          listEffectHasTimeFilter.forEach((timeItem, index) => {
            if (effect.time === timeItem.time) {
              timeEffect = timeItem.time;
              effectTimeDisplayList[
                index
              ].innerText = `${timeItem.name}-${timeEffect}s`;
              let intervalItem = setInterval(() => {
                if (timeEffect > 0) {
                  return (
                    timeEffect--,
                    (effectTimeDisplayList[
                      index
                    ].innerText = `${timeItem.name}: ${timeEffect}s`)
                  );
                }
                if (timeEffect === 0 || timeEffect === undefined) {
                  newSpeed(2);
                  setTimeout(function () {
                    effectTimeDisplayList[index].innerText = "";
                  }, 500);
                  return (
                    timeEffect, (through = false), clearInterval(intervalItem)
                  );
                }
              }, 1000);
            }
          });
          if (timeEffect) {
            if (effect.through) {
              through = effect.through;
            }
            if (effect.speed) {
              speedEffect = effect.speed;
              newSpeed(1);
            }
          }
        }
      });

      randomFoodPosition();
      random = Math.floor(Math.random() * listEffect.length);

      // random apple effect
      snakeBody.push([foodX, foodY]);

      // while high score > score -> high score = score;
      highScore = score > highScore ? score : highScore;

      localStorage.setItem("heading__high-score", highScore);
      scoreElement.innerText = `Score: ${score}`;
      highScoreElement.innerText = `High Score: ${highScore}`;
      scoreModal.innerText = `Score: ${score}`;
      highScoreModal.innerText = `High Score: ${highScore}`;
    }

    // update snake head position
    snakeX += velocityX;
    snakeY += velocityY;

    for (let i = 0; i < snakeBody.length; i++) {
      // Adding a div for each part of the snake's body
      htmlMarkup += `<div class="game__snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]};"></div>`;
      // if snake head reach snake body -> game over
      if (
        i != 0 &&
        snakeBody[0][1] === snakeBody[i][1] &&
        snakeBody[0][0] === snakeBody[i][0]
      ) {
        if (through === false) {
          audioHurt.play();
          gameOver = true;
        } else {
        }
      }
    }

    //   if snake reach rock -> game over
    rockList.forEach(function (rock) {
      if (snakeX === rock[0] && snakeY === rock[1]) {
        if (through === false) {
          audioHurt.play();
          gameOver = true;
        }
      }
    });

    //   if snake reach wall -> game over
    if (snakeX < 1 || snakeX > 30 || snakeY < 1 || snakeY > 30) {
      if (through === false) {
        audioHurt.play();
        gameOver = true;
      } else {
        if (snakeX === 0) {
          snakeX = 30;
        }
        if (snakeX === 31) {
          snakeX = 1;
        }
        if (snakeY === 0) {
          snakeY = 30;
        }
        if (snakeY === 31) {
          snakeY = 1;
        }
      }
    }

    boxGame.innerHTML = htmlMarkup;
    randomAppleEffect();
    //   set snake head color = yellowgreen
    let snakeLength = document.querySelectorAll(".game__snake");
    if (snakeLength.length === 1) {
      snakeLength[0].style.filter = "brightness(120%)";
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
  intervalId = setInterval(initGame, speedEffect);
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
          location.reload();
          modal.classList.remove("show");
        }
      });
    }
  };
}
