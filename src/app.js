const canvasWidth = 1000;
const canvasHeight = 700;
let cursorPosX = canvasWidth / 2;
//COLORS
const lightPink = "#f0dede";
const darkPink = "#cf3673";
const greyBlue = "#748cbb";

const titleElement = document.querySelector("#title-container");
const gameOverElement = document.querySelector("#game-over");
const gameOverTitleElement = document.querySelector("#game-over-title");

const scoreElement = document.querySelector("#score");

const livesElement = document.querySelector("#lives");
let score = 0;
let lives = 3;
let gamePad = { up: false, left: false, right: false, reset: false };

let canvas = document.querySelector("#my-canvas");
let ctx = canvas.getContext("2d");
let balls = [];
let ballSpeed = 0.45;
let blocks = [];

// start, playing, pause game over
let state = "START";
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 7; j++) {
    let randomNum = Math.random();
    let color =
      randomNum < 0.333333
        ? darkPink
        : randomNum < 0.66666
        ? "#855c8c"
        : greyBlue;
    blocks.push({
      startX: 25 + i * 140,
      startY: 25 + j * 50,
      width: 100,
      height: 20,
      toDispose: false,
      id: i + j,
      color: color,
      power: "ball",
    });
  }
}
let centerOfBlock = (block) => {
  return {
    x: block.startX + block.width * 0.5,
    y: block.startY + block.height * 0.5,
  };
};
let drawBlocks = () => {
  blocks.forEach((block) => {
    // calculateCollisionSide(block);
    ctx.fillStyle = block.color;
    ctx.fillRect(block.startX, block.startY, block.width, block.height);
  });
};
let activateBlockPower = (block) => {
  if (!block.power) return;
  let blockCenter = centerOfBlock(block);
  let ball = {
    radius: 15,
    positionX: blockCenter.x,
    positionY: blockCenter.y,
    xDirection: 1,
    yDirection: 1,
    speed: ballSpeed,
    color: block.color,
    life: 1,
    toDispose: false,
  };
  balls.push(ball);
};
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

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

// const drawPaddle = () => {
//   ctx.fillStyle = paddle.color;
//   //   ctx.fillRect(
//   //     paddle.startX - paddle.width * 0.5,
//   //     canvas.height - 20 - 20,
//   //     paddle.width,
//   //     paddle.height
//   //   );
// };

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
  balls.forEach((ball) => updateBall(ball, deltaTime));
};
let updateBall = (ball, deltaTime) => {
  ball.positionX += ball.speed * deltaTime * ball.xDirection;
  ball.positionY += ball.speed * deltaTime * ball.yDirection;
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
document.addEventListener("keydown", (e) => {
  if (state === "START") state = "PLAYING";
  if (e.code === "ArrowLeft") {
    gamePad.left = true;
  }
  if (e.code === "ArrowRight") {
    gamePad.right = true;
  }
  if (e.code === "ArrowUp") {
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

// canvas.addEventListener("mousemove", (event) => {
//   const rect = canvas.getBoundingClientRect(); // Get canvas position relative to viewport
//   const x = event.clientX - rect.left; // Calculate mouse position relative to canvas
//   cursorPosX = x - paddle.width * 0.5;
//   const y = event.clientY - rect.top;
// });
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

    if (state == "PLAYING") {
      titleElement.style.display = "none";
      updatePaddle(deltaTime);
      updateBalls(deltaTime);
      disposeBlocks();
      disposeBalls();

      if (blocks.length == 1) {
        state = "OVER";
        gameOverElement.style.display = "flex";
      }
      if (balls.length == 0) {
        if (lives === 0) {
          state = "OVER";
          gameOverElement.style.display = "flex";
        } else {
          console.log("removing life ");
          lives -= 1;
          livesElement.innerHTML = lives;
          balls.push({
            radius: 15,
            positionX: canvas.width / 2,
            positionY: canvas.width / 2,
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
    updateScore();
    // Store the current time for the next frame
    lastTime = currentTime;
  }
  requestAnimationFrame(gameLoop);
};

gameLoop();
