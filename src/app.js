const canvasWidth = 700;
const canvasHeight = 700;
let cursorPosX = canvasWidth / 2;
//COLORS
const lightPink = "#f0dede";
// const lightPink = "#2b2c3a";

const darkPink = "#cf3673";
const greyBlue = "#748cbb";

const titleElement = document.querySelector("#title-container");
const gameOverElement = document.querySelector("#game-over");
const gameOverTitleElement = document.querySelector("#game-over-title");
const scoreElement = document.querySelector("#score");
const levelElement = document.querySelector("#level");

let score = 0;
let lives = 3;
let level = 1;
let gamePad = { up: false, left: false, right: false, reset: false };
let paddingTop = 65;
let canvas = document.querySelector("#my-canvas");
let ctx = canvas.getContext("2d");
let balls = [];
let ballSpeed = 0.45;
let powerSpeed = 1;
let blocks = [];
let powerups = [];
// start, playing, pause game over
let state = "START";

//create Level of Blocks

let blockGroup = {
  entering: false,
  Offset: 0,
};
let updateBlockGroup = (deltaTime) => {
  // update offset
  if (blockGroup.entering) {
    if (blockGroup.Offset < 0) {
      let moveDistance = deltaTime * 0.4;
      blockGroup.Offset += moveDistance;
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
        startX: 25 + i * 136,
        startY: paddingTop + j * 50 + blockGroup.Offset,
        width: 100,
        height: 30,
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
          block.startX + 25,
          block.startY + 10,
          block.width - 50,
          block.height - 20
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
      radius: 15,
      positionX: blockCenter.x,
      positionY: blockCenter.y,
      xDirection: 1,
      yDirection: -1,
      speed: ballSpeed,
      color: block.color,
      life: 1,
      toDispose: false,
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

let paddle = {
  startX: canvas.width * 0.5 - 150 * 0.5,
  startY: canvas.height - 50,
  width: 150,
  height: 20,
  toDispose: false,
  color: greyBlue,
  id: "paddle",
};
blocks.push(paddle);

const updatePaddle = (deltaTime) => {
  let direction = 0;
  if (gamePad.left) direction -= 0.5 * deltaTime;
  if (gamePad.right) direction += 0.5 * deltaTime;

  paddle.startX = paddle.startX + direction;
  if (paddle.startX <= 0) paddle.startX = 5;
  if (paddle.startX + paddle.width >= canvas.width)
    paddle.startX = canvas.width - paddle.width - 5;

  //find cursor position. and move it to there...
};

let primaryBall = {
  radius: 15,
  positionX: canvas.width / 2,
  positionY: canvas.width / 2,
  xDirection: 0,
  yDirection: -1,
  speed: ballSpeed,
  color: "white",
  life: 1,
  toDispose: false,
};
primaryBall.positionY = canvas.height - 80;

balls.push(primaryBall);

let updateBalls = (deltaTime) => {
  if (state == "START") {
    //update primary ball
    balls[0].positionX = paddle.startX + paddle.width * 0.5;
    balls[0].positionY = paddle.startY - 30;
  } else {
    balls.forEach((ball) => updateBall(ball, deltaTime));
  }
};
let updateBall = (ball, deltaTime) => {
  ball.positionX += ball.speed * powerSpeed * deltaTime * ball.xDirection;
  ball.positionY += ball.speed * powerSpeed * deltaTime * ball.yDirection;
  // if (ball.positionY + ball.radius >= canvas.height) ball.yDirection = -1;
  if (ball.positionY - ball.radius <= 0)
    ball.yDirection = Math.abs(ball.yDirection);
  if (ball.positionX + ball.radius >= canvas.width)
    ball.xDirection = -Math.abs(ball.xDirection);
  if (ball.positionX - ball.radius <= 0)
    ball.xDirection = Math.abs(ball.xDirection);

  //out of bounds
  if (ball.positionY - ball.radius > canvas.height) {
    ball.toDispose = true;
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
        if (side == 1) ball.yDirection = 1; //bottom
        if (side == 2) ball.xDirection = -1; //left
        if (side == 3) ball.xDirection = 1; //right
        if (side == 4) ball.yDirection = -1; //top
        if (block.id != "paddle") {
          activateBlockPower(block);
          block.toDispose = true;
          score += 50;
        } else {
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
          const alphaRad = (alpha * Math.PI) / 180;

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
  console.log("ball power: ", powerSpeed);
  powerups = powerups.filter((power) => !power.toDispose);
  console.log(powerups);

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
    // console.log("in init: powerspeed: ", powerSpeed);
    powerSpeed = 1.35;
  }
  update(deltaTime) {
    this.timeLeft -= deltaTime;
    // console.log(deltaTime);
    // console.log(this.timeLeft);
    if (this.timeLeft <= 0) {
      console.log("disposing");
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
    // console.log("in init: powerspeed: ", powerSpeed);
    paddle.width = 250;
  }
  update(deltaTime) {
    this.timeLeft -= deltaTime;
    // console.log(deltaTime);
    // console.log(this.timeLeft);
    if (this.timeLeft <= 0) {
      this.toDispose = true;
      paddle.width = 150;
    }
  }
}

// Lives class

class Lives {
  constructor() {
    this.startX = 45;
    this.startY = 35;
    this.padding = 45;
    this.radius = 13;
  }
  update(deltaTime) {}
  draw() {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        this.startX + this.padding * i,
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
      ctx.lineWidth = 4;
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }
}
let ject = new Lives();

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    gamePad.left = true;
  }
  if (e.code === "ArrowRight") {
    gamePad.right = true;
  }
  if (e.code === "ArrowUp") {
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
  if (e.code === "ArrowUp") {
    gamePad.up = false;
  }

  if (e.code === "KeyR") {
    gamePad.reset = false;
  }
});

const disposeBlocks = () => {
  blocks = blocks.filter((block) => !block.toDispose);
};
const updateScore = () => {
  scoreElement.innerHTML = score;
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
    ject.update(deltaTime);

    if (state == "PLAYING") {
      titleElement.style.display = "none";

      disposeBlocks();
      disposeBalls();

      if (blocks.length == 1) {
        // NEXT LEVEL
        level = level + 1;
        blockGroup.entering = true;
        blockGroup.Offset = -400;
        levelElement.innerHTML = level;
        createBlocks();
        // gameOverElement.style.display = "flex";
      }
      if (balls.length == 0) {
        if (lives === 0) {
          state = "OVER";
          gameOverElement.style.display = "flex";
        } else {
          state = "START";
          lives -= 1;
          balls.push({
            radius: 15,
            positionX: paddle.startX + paddle.width * 0.5,
            positionY: paddle.startY - 30,
            xDirection: 0,
            yDirection: -1,
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
    drawBlocks();
    drawBalls();
    ject.draw();
    updateScore();
    // Store the current time for the next frame
    lastTime = currentTime;
  }
  requestAnimationFrame(gameLoop);
};

gameLoop();
