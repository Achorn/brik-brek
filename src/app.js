const canvasWidth = 1000;
const canvasHeight = 600;
let cursorPosX = canvasWidth / 2;
//COLORS
const lightPink = "#f0dede";
const darkPink = "#cf3673";
const greyBlue = "#748cbb";
let canvas = document.querySelector("#my-canvas");
let ctx = canvas.getContext("2d");
let balls = [];
let blocks = [];
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
    calculateCollisionSide(block);
    ctx.fillStyle = block.color;
    ctx.fillRect(block.startX, block.startY, block.width, block.height);
  });
};
let activateBlockPower = (block) => {
  // return;
  if (!block.power) return;
  let blockCenter = centerOfBlock(block);
  let ball = {
    radius: 20,
    positionX: blockCenter.x,
    positionY: blockCenter.y,
    xDirection: 1,
    yDirection: -1,
    speed: 0.29,
    color: block.color,
    life: 1,
    toDispose: false,
  };
  balls.push(ball);
};
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

let paddle = {
  startX: canvas.width + 150 * 0.5,
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

const updatePaddle = () => {
  paddle.startX = cursorPosX;
  //find cursor position. and move it to there...
};

let ball = {
  radius: 20,
  positionX: canvas.width / 2,
  positionY: canvas.width / 2,
  xDirection: 1,
  yDirection: -1,
  speed: 0.29,
  color: "white",
  life: 1,
  toDispose: false,
};
ball.positionY = canvas.height - ball.radius - 30;

balls.push(ball);

let updateBalls = (deltaTime) => {
  balls.forEach((ball) => updateBall(ball, deltaTime));
};
let updateBall = (ball, deltaTime) => {
  ball.positionX += ball.speed * deltaTime * ball.xDirection;
  ball.positionY += ball.speed * deltaTime * ball.yDirection;
  // if (ball.positionY + ball.radius >= canvas.height) ball.yDirection = -1;
  if (ball.positionY - ball.radius <= 0) ball.yDirection = +1;
  if (ball.positionX + ball.radius >= canvas.width) ball.xDirection = -1;
  if (ball.positionX - ball.radius <= 0) ball.xDirection = +1;

  //out of bounds
  if (ball.positionY - ball.radius > canvas.height) {
    console.log("ball out of bounds");
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
        let side = calculateCollisionSide(block);
        if (side == 1) ball.yDirection = 1; //bottom
        if (side == 2) ball.xDirection = -1; //left
        if (side == 3) ball.xDirection = 1; //right
        if (side == 4) ball.yDirection = -1; //top
        if (block.id != "paddle") {
          activateBlockPower(block);
          block.toDispose = true;
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
const calculateCollisionSide = (block) => {
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

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect(); // Get canvas position relative to viewport
  const x = event.clientX - rect.left; // Calculate mouse position relative to canvas
  cursorPosX = x - paddle.width * 0.5;
  const y = event.clientY - rect.top;
  // console.log(Math.atan2(canvas.width * 0.5 - x, canvas.height * 0.5 - y));
});
const disposeBlocks = () => {
  blocks = blocks.filter((block) => !block.toDispose);
};

let lastTime = 16;
let gameLoop = (currentTime) => {
  // Calculate deltaTime in milliseconds
  const deltaTime = currentTime - lastTime;
  if (deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkCollision();
    updatePaddle(deltaTime);
    updateBalls(deltaTime);
    disposeBlocks();
    disposeBalls();

    // drawPaddle();
    drawBlocks();
    drawBalls();
    // Store the current time for the next frame
    lastTime = currentTime;
  }
  requestAnimationFrame(gameLoop);
};

gameLoop();
