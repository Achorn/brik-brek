import sfx from "./classes/SoundController";

var audioOnImg = new Image();
import * as url from "../static/images/speaker-filled-audio-tool.png";
// import * as url from '../images/webpack_logo.png';

audioOnImg.src = url.default;

var audioOffImg = new Image();
import * as offUrl from "../static/images/no-sound.png";
audioOffImg.src = offUrl.default;
let imgLoaded = false;
audioOnImg.onload = () => (imgLoaded = true);
let audioOn = false;

const canvasWidth = 1400;
const canvasHeight = 1800;
let cursorPosX = canvasWidth / 2;
//COLORS
const lightPink = "#f0dede";
// const lightPink = "#2b2c3a";

const darkPink = "#cf3673";
const greyBlue = "#748cbb";
const titleElement = document.querySelector("#title-container");
const gameOverElement = document.querySelector("#game-over");
const gameOverTitleElement = document.querySelector("#game-over-title");
// const scoreElement = document.querySelector("#score");
// const levelElement = document.querySelector("#level");
const gameWrapperElement = document.querySelector("#game-wrapper");
const debugEl = document.querySelector("#debug-container");

let canvas = document.querySelector("#my-canvas");
let elemLeft = canvas.offsetLeft + canvas.clientLeft;
let elemTop = canvas.offsetTop + canvas.clientTop;
let elements = [];

// https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
// https://codepen.io/devellopah/pen/dZLVOG
let toggleAudioMute = () => {
  for (const [key, value] of Object.entries(sfx)) {
    value.mute(!audioOn);
  }
};
canvas.addEventListener(
  "click",
  function (event) {
    var x = event.pageX - canvas.getBoundingClientRect().left,
      y = event.pageY;
    x = getXPosInScaledCanvas(event.pageX);
    y = getYPosInScaledCanvas(event.pageY);
    // Collision detection between clicked offset and element.
    elements.forEach(function (element) {
      if (
        y > element.top &&
        y < element.top + element.height &&
        x > element.left &&
        x < element.left + element.width
      ) {
        audioOn = !audioOn;
        toggleAudioMute();
      }
    });
  },
  false
);

let ctx = canvas.getContext("2d");
const updateCanvasSize = (windowWidth) => {
  let widthFrac = windowWidth / 1400;
  let windowHeight = (windowWidth / 1400) * 1800;
  // 1400/1800
  widthFrac *= 100;
  if (windowWidth < 700) {
    canvas.style.transform = `scale(${widthFrac}%)`;
    gameWrapperElement.style.width = `${windowWidth}px`;
    gameWrapperElement.style.height = `${windowHeight}px`;
    gameWrapperElement.style.transform = "translate(0,-10%)";
  } else {
    canvas.style.transform = "scale(50%)";
    gameWrapperElement.style.width = "700px";
    gameWrapperElement.style.height = `${(700 / 1400) * 1800}px`;
  }
};
updateCanvasSize(window.innerWidth);

window.addEventListener("resize", (e) => {
  updateCanvasSize(e.target.innerWidth);
});

let score = 0;
let lives = 3;
let level = 1;
let gamePad = { up: false, left: false, right: false, reset: false };
let paddingTop = 120 * 2;
let paddingSides = 45 * 2;
ctx.imageSmoothingEnabled = false;
let balls = [];
let ballSpeed = 0.5 * 2;
let powerSpeed = 1;
let levelSpeed = 1;
let ballRadius = 20 * 2;
let blocks = [];
let powerups = [];
// start, playing, pause game over
let state = "START";

//create Level of Blocks

let blockGroup = {
  entering: false,
  offset: 0,
};
let updateBlockGroup = (deltaTime) => {
  // update offset
  if (blockGroup.entering) {
    if (blockGroup.offset < 0) {
      let moveDistance = deltaTime * 0.7;
      blockGroup.offset += moveDistance;
      blocks.forEach((block) => {
        if (block.id != "paddle") {
          block.startY = block.startY + moveDistance;
        }
      });
    } else blockGroup.entering = false;
  }
};
const createBlocks = () => {
  //randomly select powerups

  //more with level youre on

  let spaceLeft = canvasWidth - paddingSides * 2;
  console.log(spaceLeft);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      let randomNum = Math.random();
      let powerNum = Math.random();
      // let powerNum = 0.75;
      let color =
        randomNum < 0.333333
          ? darkPink
          : randomNum < 0.66666
          ? "#855c8c"
          : greyBlue;
      blocks.push({
        startX: 25 * 2 + i * 136 * 2,
        startY: paddingTop + j * 50 * 2 + blockGroup.offset,
        width: 100 * 2,
        height: 40 * 2,
        toDispose: false,
        id: i + j,
        color: color,
        power:
          powerNum > 0.8
            ? "ball"
            : powerNum > 0.7
            ? "speed"
            : powerNum > 0.6
            ? "paddle"
            : "",
      });
    }
  }
};
createBlocks();
let centerOfBlock = (block) => {
  return {
    x: block.startX + block.width * 0.5,
    y: block.startY + block.height * 0.5,
  };
};
let drawBlocks = () => {
  blocks.forEach((block) => {
    ctx.fillStyle = block.color;
    ctx.fillRect(block.startX, block.startY, block.width, block.height);
    if (block.power) {
      if (block.power == "ball") {
        ctx.beginPath();
        ctx.arc(
          block.startX + block.width * 0.5,
          block.startY + block.height * 0.5,
          block.height * 0.3,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = lightPink;
        ctx.fill();
      }
      if (block.power == "speed") {
        let triangleWidth = block.height * 0.3;
        ctx.beginPath();
        ctx.beginPath();
        //point
        ctx.moveTo(
          block.startX - block.width * 0.5 + triangleWidth + block.width - 3,
          block.startY + block.height * 0.5
        );
        //topLeft
        ctx.lineTo(
          block.startX + block.width * 0.5 - triangleWidth,
          block.startY + block.height * 0.5 - triangleWidth
        );

        //bottomLeft
        ctx.lineTo(
          block.startX + block.width * 0.5 - triangleWidth,
          block.startY + block.height * 0.5 + triangleWidth
        );

        ctx.fillStyle = lightPink;
        ctx.fill();
      }
      if (block.power == "paddle") {
        ctx.fillStyle = block.color;
        ctx.fillStyle = lightPink;
        ctx.fillRect(
          block.startX + 25 * 2,
          block.startY + 10 * 2,
          block.width - 50 * 2,
          block.height - 20 * 2
        );
        ctx.fill();
      }
    }
  });
};
let activateBlockPower = (block) => {
  if (!block.power) return;
  // if (level != 1) return;
  if (block.power == "ball") {
    let blockCenter = centerOfBlock(block);
    let ball = {
      radius: ballRadius,
      positionX: blockCenter.x,
      positionY: blockCenter.y,
      xDirection: 0.6370204626000374,
      yDirection: -0.7708468915607264,
      speed: ballSpeed,
      color: block.color,
      toDispose: false,
      touchedPaddleLast: false,
    };
    balls.push(ball);
  }
  if (block.power == "speed") {
    powerups.push(new BallSpeedPowerUp());
  }
  if (block.power == "paddle") {
    powerups.push(new PaddleGrowPowerUp());
  }
};

const paddleHeight = 25 * 2;
let paddle = {
  startX: canvas.width * 0.5 - 150 * 0.5 * 2,
  startY: canvas.height - paddleHeight * 3,
  width: 150 * 2,
  height: paddleHeight,
  toDispose: false,
  color: greyBlue,
  id: "paddle",
};
blocks.push(paddle);

let touchObject = { moving: false, positionX: 0 };
const updatePaddle = (deltaTime) => {
  if (touchObject.moving) {
    paddle.startX = touchObject.positionX - paddle.width * 0.5;
  } else {
    let direction = 0;
    if (gamePad.left) direction -= 0.5 * deltaTime * 2;
    if (gamePad.right) direction += 0.5 * deltaTime * 2;

    paddle.startX = paddle.startX + direction;
  }
  if (paddle.startX <= 0) paddle.startX = 5;
  if (paddle.startX + paddle.width >= canvas.width)
    paddle.startX = canvas.width - paddle.width - 5;

  //find cursor position. and move it to there...
};

let primaryBall = {
  radius: ballRadius,
  positionX: canvas.width / 2,
  positionY: canvas.width / 2,
  xDirection: 0.6370204626000374,
  yDirection: -0.7708468915607264,
  speed: ballSpeed,
  color: "white",
  life: 1,
  toDispose: false,
  touchedPaddleLast: false,
};
primaryBall.positionY = canvas.height - 80;

balls.push(primaryBall);

let updateBalls = (deltaTime) => {
  if (state == "START") {
    //update primary ball
    balls[0].positionX = paddle.startX + paddle.width * 0.5;
    balls[0].positionY = paddle.startY - ballRadius * 2;
  } else {
    balls.forEach((ball) => updateBall(ball, deltaTime));
  }
};
let updateBall = (ball, deltaTime) => {
  ball.positionX +=
    ball.speed * levelSpeed * powerSpeed * deltaTime * ball.xDirection;
  ball.positionY +=
    ball.speed * levelSpeed * powerSpeed * deltaTime * ball.yDirection;
  // if (ball.positionY + ball.radius >= canvas.height) ball.yDirection = -1;
  let impact = false;
  if (ball.positionY - ball.radius <= 0) {
    ball.yDirection = Math.abs(ball.yDirection);
    impact = true;
  }
  if (ball.positionX + ball.radius >= canvas.width) {
    ball.xDirection = -Math.abs(ball.xDirection);
    impact = true;
  }
  if (ball.positionX - ball.radius <= 0) {
    ball.xDirection = Math.abs(ball.xDirection);
    impact = true;
  }
  if (impact) {
    sfx.impact.play();
    ball.touchedPaddleLast = false;
  }

  //out of bounds
  if (ball.positionY - ball.radius > canvas.height) {
    ball.toDispose = true;
    if (ball.life == 1) {
      lives -= 1;
    }
  }
};

let drawBalls = () => {
  balls.forEach((ball) => drawBall(ball));
};
let drawBall = (ball) => {
  ctx.beginPath();
  ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, 2 * Math.PI);
  ctx.fillStyle = ball.color;
  ctx.fill();
  // ctx.stroke();
};
const disposeBalls = () => {
  balls = balls.filter((ball) => !ball.toDispose);
};

const checkCollision = () => {
  //have ball
  // check every block to see if it is colliding with ball
  blocks.forEach((block) => {
    balls.forEach((ball) => {
      if (isColliding(block, ball)) {
        let side = calculateCollisionSide(block, ball);
        if (side == 1) ball.yDirection = ball.yDirection * -1; //bottom
        if (side == 2) ball.xDirection = ball.xDirection * -1; //left
        if (side == 3) ball.xDirection = ball.xDirection * -1; //right
        if (side == 4) ball.yDirection = ball.yDirection * -1; //top
        if (block.id != "paddle") {
          activateBlockPower(block);
          block.toDispose = true;
          ball.touchedPaddleLast = false;
          sfx.explosion.play();
          score += 50;
        } else {
          if (!ball.touchedPaddleLast) {
            sfx.impact.play();
            ball.touchedPaddleLast = true;
          }
          //calculate ball angle hitting paddle
          let blockSurface = {
            start: block.startX,
            end: block.startX + block.width,
            center: block.startX + block.width * 0.5,
          };
          let frac = ball.positionX - blockSurface.start;
          let center = blockSurface.center - blockSurface.start;
          let angle = (frac - center) / block.width;
          let distanceFromCenter = (frac - center) / block.width;
          distanceFromCenter = Math.max(-0.3, distanceFromCenter);
          distanceFromCenter = Math.min(0.3, distanceFromCenter);
          distanceFromCenter *= 2;

          distanceFromCenter *= 90;
          distanceFromCenter <= 0
            ? (distanceFromCenter += 90)
            : (distanceFromCenter -= 90);
          // distanceFromCenter = -distanceFromCenter;

          // ball position
          // convert to angle from 0-180
          // angle = 180 - (distanceFromCenter + 0.5) * 180;
          let direction = distanceFromCenter <= 0 ? 1 : -1;
          let alpha = Math.abs(distanceFromCenter);
          let c = 1;
          let alphaRad = (alpha * Math.PI) / 180;
          // Calculate side a

          const a = c * Math.sin(alphaRad);

          // Calculate side b
          const b = c * Math.cos(alphaRad);
          // paddle position
          // normalize or whatever
          // generate angle with window of tolerance
          ball.xDirection = b * direction;
          ball.yDirection = -a;
        }
        // ball.speed += 0.005;
      }
    });
  });
};
const isColliding = (block, ball) => {
  //X intersecting
  // # Find the closest point on the square
  let blockCenter = centerOfBlock(block);
  let blockX = blockCenter.x;
  let blockY = blockCenter.y;
  let diff_x = ball.positionX - blockX;
  let diff_y = ball.positionY - block.startY;

  let closest_x =
    blockX + Math.max(Math.min(diff_x, block.width / 2), -block.width / 2);
  let closest_y =
    blockY + Math.max(Math.min(diff_y, block.height / 2), -block.height / 2);

  // # Calculate the distance
  let distance = Math.sqrt(
    (ball.positionX - closest_x) ** 2 + (ball.positionY - closest_y) ** 2
  );
  // # Check for collision
  return distance <= ball.radius;
};
const calculateCollisionSide = (block, ball) => {
  //lower quadrent
  // between angle from center of block to lower left angle to andle of block to lower right angle
  let blockCenter = {
    x: block.startX + block.width * 0.5,
    y: block.startY + block.height * 0.5,
  };
  let ballAngle = Math.atan2(
    blockCenter.x - ball.positionX,
    blockCenter.y - ball.positionY
  );

  let bottomLeftPosition = { x: block.startX, y: block.startY + block.height };
  let bottomRightPosition = {
    x: block.startX + block.width,
    y: block.startY + block.height,
  };

  let topLeftPosition = { x: block.startX, y: block.startY };
  let topRightPosition = {
    x: block.startX + block.width,
    y: block.startY,
  };

  let bottomLeftAngle = Math.atan2(
    blockCenter.x - bottomLeftPosition.x,
    blockCenter.y - bottomLeftPosition.y
  );

  let bottomRightAngle = Math.atan2(
    blockCenter.x - bottomRightPosition.x,
    blockCenter.y - bottomRightPosition.y
  );

  let topLefttAngle = Math.atan2(
    blockCenter.x - topLeftPosition.x,
    blockCenter.y - topLeftPosition.y
  );

  let topRightAngle = Math.atan2(
    blockCenter.x - topRightPosition.x,
    blockCenter.y - topRightPosition.y
  );
  let angle = 4;

  if (ballAngle > bottomLeftAngle || ballAngle < bottomRightAngle) {
    // Bottom
    angle = 1;
    // block.color = greyBlue;
  } else if (ballAngle > topLefttAngle && ballAngle < bottomLeftAngle) {
    // Left
    angle = 2;
    // block.color = darkPink;
  } else if (ballAngle > bottomRightAngle && ballAngle < topRightAngle) {
    // Right
    angle = 3;
    // block.color = darkPink;
  } else {
    // Top
    // block.color = greyBlue;
  }
  return angle;
};
const updatePowerups = (deltaTime) => {
  powerups = powerups.filter((power) => !power.toDispose);

  powerups.forEach((power) => {
    power.update(deltaTime);
  });
};
class PowerUp {
  constructor() {
    this.toDispose = false;
  }
  initPowerUp() {}
  update(deltaTime) {}
}
class BallSpeedPowerUp extends PowerUp {
  constructor() {
    super();
    this.timeLeft = 5000; //seconds
    this.initPowerUp();
  }
  initPowerUp() {
    powerSpeed = 1.25;
  }
  update(deltaTime) {
    this.timeLeft -= deltaTime;
    if (this.timeLeft <= 0) {
      this.toDispose = true;
      powerSpeed = 1;
    }
  }
}
class PaddleGrowPowerUp extends PowerUp {
  constructor() {
    super();
    this.timeLeft = 5000; //seconds
    this.initPowerUp();
  }
  initPowerUp() {
    paddle.width = 250 * 2;
  }
  update(deltaTime) {
    this.timeLeft -= deltaTime;

    if (this.timeLeft <= 0) {
      this.toDispose = true;
      paddle.width = 150 * 2;
    }
  }
}

// Lives class

class Lives {
  constructor() {
    this.startX = 45 * 2;
    this.startY = paddingTop * 0.5;
    this.padding = paddingSides;
    this.stroke = 4 * 2;
    this.radius = ballRadius - this.stroke;
  }
  update(deltaTime) {}
  draw() {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        this.padding + (this.radius + this.stroke * 8) * i,
        this.startY,
        this.radius,
        0,
        2 * Math.PI
      );
      if (lives > i) {
        //LIFE
        ctx.fillStyle = "white";
        ctx.fill();
      }
      ctx.lineWidth = this.stroke;
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }
}
let livesObject = new Lives();

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    e.preventDefault();

    gamePad.left = true;
  }
  if (e.code === "ArrowRight") {
    e.preventDefault();

    gamePad.right = true;
  }
  if (e.code === "ArrowUp" || e.code === "Space") {
    e.preventDefault();

    if (state === "START") state = "PLAYING";
    gamePad.up = true;
  }
  if (e.code === "KeyR") {
    gamePad.reset = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") {
    gamePad.left = false;
  }
  if (e.code === "ArrowRight") {
    gamePad.right = false;
  }
  if (e.code === "ArrowUp" || e.code === "Space") {
    gamePad.up = false;
  }
  if (e.code === "KeyR") {
    gamePad.reset = false;
  }
});

const getXPosInScaledCanvas = (clientX) => {
  let x = clientX - canvas.getBoundingClientRect().left; // remove padding between start of screen and start of canvas
  let canvasWidth =
    canvas.getBoundingClientRect().right - canvas.getBoundingClientRect().left;

  let xPos = canvasWidth - (canvasWidth - x);
  let normalize = xPos / canvasWidth; // reduce to size between

  let growth = 1400 * normalize; //resize to canvas internal res

  return growth;
};

const getYPosInScaledCanvas = (clientY) => {
  let y = clientY - canvas.getBoundingClientRect().top; // remove padding between top of screen and top of canvas
  let canvasHeight =
    canvas.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top;

  let yPos = canvasHeight - (canvasHeight - y);
  let normalize = yPos / canvasHeight; // reduce to size between

  let growth = 1800 * normalize; //resize to canvas internal res

  return growth;
};
const handleStart = (evt) => {
  evt.preventDefault();
  const touch = evt.changedTouches[0];
  touchObject.initPos = [touch.pageX, touch.pageY];
};
const handleMove = (evt) => {
  touchObject.moving = true;
  const touch = evt.changedTouches[0];
  let xPos = getXPosInScaledCanvas(touch.clientX);
  touchObject.positionX = xPos;
};
const handleEnd = (evt) => {
  touchObject.moving = false;
  // const touch = evt.changedTouches[0];
  //TODO check if in same spot then only play
  if (state === "START") state = "PLAYING";
};

window.addEventListener("touchstart", handleStart);
window.addEventListener("touchend", handleEnd);
// canvas.addEventListener("touchcancel", handleCancel);
window.addEventListener("touchmove", handleMove);

const disposeBlocks = () => {
  blocks = blocks.filter((block) => !block.toDispose);
};
// const updateScore = () => {
//   scoreElement.innerHTML = score;
// };
const drawScore = () => {
  ctx.font = "bold 105px Gothic A1";
  ctx.fillStyle = greyBlue;

  let paddingSides = 45 * 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(score, canvasWidth / 2, paddingTop * 0.5);
  // ctx.textAlign = "end";
  // ctx.fillText(score, 150, 80);
};

elements.push({
  height: 130,
  left: canvasWidth - paddingSides - 130,
  top: paddingTop * 0.5 - 130 * 0.5,
  width: 130,
});
const drawMenu = () => {
  if (!imgLoaded) return;
  let selectedImg = audioOn ? audioOnImg : audioOffImg;
  let size = 130;
  let startX = canvasWidth - paddingSides - size;
  let startY = paddingTop * 0.5 - size * 0.5;
  // ctx.globalCompositeOperation = "source-over";

  // // draw color
  ctx.fillStyle = audioOn ? greyBlue : darkPink;
  ctx.fillRect(startX, startY, size, size);
  // set composite mode
  ctx.globalCompositeOperation = "destination-in";
  // // draw image
  ctx.drawImage(selectedImg, startX, startY, size, size);
  ctx.globalCompositeOperation = "source-over";
};

let lastTime = 16;
let gameLoop = (currentTime) => {
  // Calculate deltaTime in milliseconds
  const deltaTime = currentTime - lastTime;

  if (deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkCollision();

    updatePaddle(deltaTime);
    updateBlockGroup(deltaTime);
    updateBalls(deltaTime);
    updatePowerups(deltaTime);
    livesObject.update(deltaTime);

    if (state == "PLAYING") {
      titleElement.style.display = "none";

      disposeBlocks();
      disposeBalls();

      if (blocks.length == 1) {
        // NEXT LEVEL
        level = level + 1;
        levelSpeed += 0.05;
        blockGroup.entering = true;
        blockGroup.offset = -400 * 2;
        // levelElement.innerHTML = level;
        createBlocks();
        // gameOverElement.style.display = "flex";
      }
      if (balls.length == 0) {
        if (lives === 0) {
          state = "OVER";
          gameOverElement.style.display = "flex";
        } else {
          state = "START";
          balls.push({
            radius: ballRadius,
            positionX: paddle.startX + paddle.width * 0.5,
            positionY: paddle.startY - 30,
            xDirection: 0.6370204626000374,
            yDirection: -0.7708468915607264,
            speed: ballSpeed,
            color: "white",
            life: 1,
            toDispose: false,
          });
        }
      }
    }
    if (state == "OVER") {
      if (gamePad.reset) location.reload();
    }

    // drawPaddle();
    drawMenu();
    drawBlocks();
    drawBalls();
    livesObject.draw();
    // updateScore();
    drawScore();
    // Store the current time for the next frame
    lastTime = currentTime;
  }
  requestAnimationFrame(gameLoop);
};

gameLoop();
