const main = document.getElementById("main");
const audio = {
  themeSong: new Audio("./assets/audio/themesong.mp3"),
  audioEatingApple: new Audio("./assets/audio/biting-into-an-apple.mp3"),
  audioGold: new Audio("./assets/audio/gold.mp3"),
  audioSlow: new Audio("./assets/audio/slow.mp3"),
  audioInvincibleStart: new Audio("./assets/audio/invincible-start.mp3"),
  audioInvincibleRun: new Audio("./assets/audio/invincible-run.mp3"),
  audioHurt: new Audio("./assets/audio/umph.mp3"),
  audioBurn: new Audio("./assets/audio/electricity.mp3")
}

// Nhấn vào start btn -> chạy nhạc và bắt đầu chạy game
let startButton = document.querySelector(".start__button");

function updateScore(score) {
  window.parent.postMessage({ type: "SNAKE_SCORE", score }, "*");
}


function handleStartButtonClick() {
  audio.themeSong.play();
  startGame();

  // Remove event listener for "Enter" key
  document.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    audio.themeSong.play();
    startGame();
    document.removeEventListener("keydown", handleKeyDown);
  }
}

if (startButton !== null) {
  startButton.addEventListener("click", handleStartButtonClick);
  document.addEventListener("keydown", handleKeyDown);
}

// khi nhạc kết thúc -> restart
audio.themeSong.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

// hàm bắt đầu game
function startGame() {
  main.innerHTML = `
  <div class="background">
  </div>
<div class="modal">
    <div class="modal__overlay"></div>
    <div class="modal__content">
      <div class="content">
        <img src="./assets/img/modal/trophy.png" alt="" />
        <h4 class="high-score"></h4>
      </div>
      <div class="content">
        <img src="./assets/img/modal/star.png" alt="" />
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
  </div>
  `;


  const boxGame = document.querySelector(".box__game");
  const scoreElement = document.querySelector(".heading__current-score");
  const highScoreElement = document.querySelector(".heading__high-score");
  const scoreModal = document.querySelector(".score");
  const highScoreModal = document.querySelector(".high-score");
  const replayBtn = document.querySelector(".modal__content button");
  const controlBtn = document.querySelectorAll(".control button");

  let snakeX = 15;
  let snakeY = 15;
  let foodX = Math.floor(Math.random() * 30 + 1);
  let foodY = Math.floor(Math.random() * 30 + 1);
  let velocityX = 0;
  let velocityY = 0;
  let rockX, rockY;
  let rockCount = Math.floor((30 * 10) / 30);
  let rockList = [];
  let appleElement;

  let snakeBody = [];
  let gameOver = false;
  let score = 0;

  let originSpeed = 100;
  let speedEffect = originSpeed;
  let through = false;
  let flagEffect = false;

  let randomAll,randomNoTime;

  let modal = document.querySelector(".modal");

  const listChoose = [
    {
      name: "normal",
      point: 1,
      percent: 50 / 100,
      time: undefined,
    },
    {
      name: "gold",
      point: 5,
      percent: 20 / 100,
      time: undefined,
    },
    {
      name: "slow",
      time: 15,
      speed: speedEffect + Math.floor(speedEffect * (25 / 100)),
      point: 2,
      percent: 15 / 100,
    },
    {
      name: "invincible",
      time: 10,
      point: 5,
      speed: speedEffect - Math.floor(speedEffect * (10 / 100)),
      through: true,
      percent: 15 / 100,
    },
  ];

  // mảng choose loại bỏ các effect k có time
  let listChooseEffectHasTime = listChoose.filter(
    (time) => time.time !== undefined
  );

  let listEffect = [];
  let selectListEffectLength = 100;
  // tạo 1 mảng dựa vào % của  các phần tử trong mảng listChoose
  function EffectListinGame(percent, obj) {
    for (let i = 1; i <= Math.floor(selectListEffectLength * percent); i++) {
      listEffect.unshift(obj);
    }
  }

  listChoose.forEach((effect) => {
    EffectListinGame(effect.percent, effect);
  });

  // chia list effect thành 2 loại: không giới hạn thời gian và giới hạn thời gian
  let listEffectNoTime = [];
  listEffect.forEach(function (effect) {
    if (effect.time === undefined) {
      listEffectNoTime.push(effect);
    }
  });

  let effectTimeDisplayList = document.querySelectorAll(
    ".heading__effect .heading__effect-time"
  );

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

  let highScore = localStorage.getItem("high-score") ?? "MA==";
  highScore = Number(atob(highScore));
  highScoreElement.innerText = `High Score: ${highScore}`;
  highScoreModal.innerText = `High Score: ${highScore}`;

  let intervalId;
  let intervalItem;
  // random tọa độ của đá
  const randomRock = () => {
    for (let i = 0; i < rockCount; i++) {
      rockX = Math.floor(Math.random() * 30 + 1);
      rockY = Math.floor(Math.random() * 30 + 1);
      rockList.push([rockX, rockY]);
    }
  };

  randomRock();

  // nếu đá spawn trên rắn thì xóa tảng đá đó đi
  rockList.forEach(function (rock, index) {
    if (rock[0] === snakeX && rock[1] === snakeY) {
      rockList.splice(index, 1);
    }
  });

  // random tọa độ của táo
  const randomFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
  };

  // kiểm tra xem random có trùng với index không, nếu có thì add class theo tên của effect thứ index
  function displayAppleEffect(listEffectType, random) {
    listEffectType.forEach((effect, index) => {
      if (index === random) {
        if (document.querySelector(".game__apple")) {
          appleElement = document.querySelector(".game__apple").classList;
          if (appleElement) {
            appleElement.add(`${effect.name}`);
          }
        }
      }
    });
  }

  //  áp dụng thuộc tính của effect;
  function effectActive(list, random) {
    list.forEach((effect, index) => {
      if (index === random) {
        for (let i = 1; i <= effect.point; i++) {
          score++;
        }
        let timeEffect;
        listChooseEffectHasTime.forEach((timeItem, index) => {
          if (effect.time === timeItem.time) {
            timeEffect = timeItem.time;
            effectTimeDisplayList[
              index
            ].innerText = `${timeItem.name}-${timeEffect}s`;
            intervalItem = setInterval(() => {
              if (timeEffect > 0) {
                return (
                  (flagEffect = true),
                  timeEffect--,
                  (effectTimeDisplayList[
                    index
                  ].innerText = `${timeItem.name}: ${timeEffect}s`)
                );
              }
              if (timeEffect === 0 || timeEffect === undefined) {
                newSpeed(2);
                return (
                  (flagEffect = false),
                  timeEffect,
                  (through = false),
                  (setTimeout(function () {
                    effectTimeDisplayList[index].innerText = "";
                  }, 500)),
                  clearInterval(intervalItem)
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
  }

  let htmlMarkup;
  function initGame() {
    // nếu tọa độ của food trùng với tọa độ của đá-> tạo quả táo khác
    rockList.forEach((rock) => {
      if ((foodX !== rock[0], foodY !== rock[1])) {
        htmlMarkup = `<div class="game__apple" style = 'grid-area: ${foodY} / ${foodX}'><div class = 'apple'></div></div>`;
      } else {
        randomFoodPosition();
      }
    });
    // hiển thị đá ra
    rockList.forEach(function (rock) {
      htmlMarkup += ` <div class = "rock" style = 'grid-area: ${rock[1]} / ${rock[0]}'></div>`;
    });
    // lùi tọa độ body của con rắn về 1 index
    for (let i = snakeBody.length - 1; i > 0; i--) {
      snakeBody[i] = snakeBody[i - 1];
    }

    // gán tọa độ cho đầu là giá trị mặc định
    snakeBody[0] = [snakeX, snakeY];

    // khi rắn ăn táo điểm +1
    if (snakeX === foodX && snakeY === foodY) {
      // check class để xác định effect, tùy từng effect sẽ phát ra các âm thanh khác nhau
      switch (document.querySelector(".game__apple").classList[1]) {
        case "normal":
          audio.audioGold.play();
          break;
        case "gold":
          audio.audioGold.play();
          break;
        case "slow":
          audio.audioGold.play();
          audio.audioSlow.play();
          break;
        case "invincible":
          audio.audioGold.play();
          audio.audioInvincibleStart.play();
          setTimeout(function () {
            audio.audioInvincibleRun.play();
          }, 700);

          break;
        default:
          audio.audioEatingApple.play();
          break;
      }
      // nếu đang có hiệu ứng thì sẽ áp dụng hiệu ứng không giới hạn thời gian, ngược lại thì áp dụng tất cả các hiệu ứng
      if (flagEffect === true) {
        effectActive(listEffectNoTime, randomNoTime);
      } else {
        effectActive(listEffect, randomAll);
      }

      // random effect index
      randomAll = Math.floor(Math.random() * listEffect.length);
      randomNoTime = Math.floor(Math.random() * listEffectNoTime.length);

      // spawn táo
      randomFoodPosition();

      // random apple effect
      snakeBody.push([foodX, foodY]);

      // while high score > score -> high score = score;
      highScore = score > highScore ? score : highScore;
      let encodedHighScore = btoa(highScore.toString());
      localStorage.setItem("high-score", encodedHighScore);
      scoreElement.innerText = `Score: ${score}`;
      highScoreElement.innerText = `High Score: ${highScore}`;
      scoreModal.innerText = `Score: ${score}`;
      highScoreModal.innerText = `High Score: ${highScore}`;
    }

    // cập nhật tọa độ đầu rắn
    snakeX += velocityX;
    snakeY += velocityY;

    for (let i = 0; i < snakeBody.length; i++) {
      // Thêm một div cho mỗi phần body của con rắn
      htmlMarkup += `<div class="game__snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]};"></div>`;
      // nếu con rắn tự đụng vào body thì game over,nếu through = true thì k sao
      if (
        i != 0 &&
        snakeBody[0][1] === snakeBody[i][1] &&
        snakeBody[0][0] === snakeBody[i][0]
      ) {
        if (through === false) {
          audio.audioHurt.play();
          gameOver = true;
          updateScore(score);
        }
      }
    }

    //   nếu rắn đụng vào đá thì game over,nếu through = true thì k sao
    rockList.forEach(function (rock) {
      if (snakeX === rock[0] && snakeY === rock[1]) {
        if (through === false) {
          audio.audioHurt.play();
          gameOver = true;
          updateScore(score);
        }
      }
    });

    //   nếu rắn đụng vào tường thì game over,nếu through = true thì k sao
    if (snakeX < 0.75 || snakeX > 30.75 || snakeY < 0.75 || snakeY > 30.75) {
      if (through === false) {
        audio.audioBurn.play();
        gameOver = true;
        updateScore(score);
      } else {
        // nếu con rắn ra khỏi map-> teleport
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

    //   set snake head color = yellowgreen
    let snakeLength = document.querySelectorAll(".game__snake");
    if (snakeLength.length === 1) {
      snakeLength[0].style.filter = "brightness(120%)";
    }
    // nếu đang có hiệu ứng thì sẽ hiển thị hiệu ứng không giới hạn thời gian, ngược lại thì hiển thị tất cả các hiệu ứng
    if (flagEffect === true) {
      displayAppleEffect(listEffectNoTime, randomNoTime);
    } else {
      displayAppleEffect(listEffect, randomAll);
    }

    if (gameOver) {
      handleGameOver();
    }
  }

  // random lại effect index mới
  randomAll = Math.floor(Math.random() * listEffect.length);
  randomNoTime = Math.floor(Math.random() * listEffectNoTime.length);

  function handleKeyPress() {
    document.addEventListener("keydown", function (e) {
      // change velocity when key down
      if ((e.key === "ArrowUp" || e.key === "w") && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
      } else if ((e.key === "ArrowDown" || e.key === "s") && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
      } else if ((e.key === "ArrowLeft" || e.key === "a") && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
      } else if ((e.key === "ArrowRight" || e.key === "d") && velocityX != -1) {
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

  handleKeyPress();

  intervalId = setInterval(initGame, speedEffect);
  // Game over

  const handleGameOver = () => {
    clearInterval(intervalId);
    modal.classList.add("show");

    function replayGame(e) {
      if (e.type === "click" || e.key === "Enter") {
        modal.classList.remove("show");
        startGame();
        removeEventListeners();
      }
    }

    replayBtn.addEventListener("click", replayGame);
    document.addEventListener("keydown", replayGame);

    function removeEventListeners() {
      replayBtn.removeEventListener("click", replayGame);
      document.removeEventListener("keydown", replayGame);
      document.removeEventListener("keydown", handleKeyPress);
      document.addEventListener("keydown", handleKeyPress);
    }
    gameOver = false;
  };
}
