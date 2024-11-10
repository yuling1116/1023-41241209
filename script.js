let canvas, ctx, ball, paddle, bricks, score, lives, gameInterval;
let rightPressed = false, leftPressed = false;
let brickRowCount = 3, brickColumnCount = 5, brickWidth = 75, brickHeight = 20, brickPadding = 10;
let brickOffsetTop = 30, brickOffsetLeft = 30;
let difficulty = 'medium';

function startGame(difficultyLevel) {
  difficulty = difficultyLevel;
  document.getElementById('difficultySelector').style.display = 'none'; // 隱藏難度選擇畫面
  document.getElementById('gameContainer').style.display = 'block'; // 顯示遊戲畫面
  document.getElementById('gameOver').style.display = 'none'; // 隱藏遊戲結束畫面
  setupGame();
  gameInterval = setInterval(gameLoop, 10);
}

function setupGame() {
  // Initialize canvas
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  score = 0;
  lives = 3;
  
  // Initialize ball
  ball = { radius: 10, x: canvas.width / 2, y: canvas.height - 30, dx: 2, dy: -2 };

  // Initialize paddle
  paddle = { width: 75, height: 10, x: (canvas.width - 75) / 2 };

  // Initialize bricks based on difficulty
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      let strength = (difficulty === 'easy' ? 1 : difficulty === 'medium' ? (r % 2 + 1) : 3);
      bricks[c][r] = { x: 0, y: 0, status: 1, strength: strength };
    }
  }

  // Set game behavior based on difficulty
  if (difficulty === 'easy') {
    ball.dx = 2;
    ball.dy = -2;
    brickRowCount = 3;
    brickColumnCount = 5;
  } else if (difficulty === 'medium') {
    ball.dx = 3;
    ball.dy = -3;
    brickRowCount = 4;
    brickColumnCount = 6;
  } else if (difficulty === 'hard') {
    ball.dx = 4;
    ball.dy = -4;
    brickRowCount = 5;
    brickColumnCount = 7;
  }

  // Event listeners for paddle movement (keyboard and mouse)
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);
}

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width / 2;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
          ball.dy = -ball.dy;
          b.strength--;
          if (b.strength <= 0) {
            b.status = 0;
            score++;
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = getBrickColor(bricks[c][r].strength);
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function getBrickColor(strength) {
  if (strength === 3) {
    return "#FF0000"; // Red for most durable
  } else if (strength === 2) {
    return "#FFFF00"; // Yellow for medium durability
  } else {
    return "#00FF00"; // Green for weakest
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("得分: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("生命: " + lives, canvas.width - 65, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // Ball's movement and wall collision
  if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
    ball.dx = -ball.dx;
  }
  if (ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > canvas.height - ball.radius) {
    // Ball touches bottom - Game over condition
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      ball.dy = -ball.dy;
    } else {
      lives--;
      if (!lives) {
        gameOver();
      } else {
        resetBall();
      }
    }
  }

  // Paddle movement
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += 7;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= 7;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = 2;
  ball.dy = -2;
  paddle.x = (canvas.width - paddle.width) / 2;
}

function gameOver() {
  clearInterval(gameInterval);
  document.getElementById('gameOver').style.display = 'block';
  document.getElementById('finalScore').innerText = '得分: ' + score;
  // Show the restart button
  document.getElementById('restartButton').style.display = 'block';
}

function restartGame() {
  document.getElementById('gameOver').style.display = 'none';
  document.getElementById('restartButton').style.display = 'none';
  document.getElementById('difficultySelector').style.display = 'block';
  document.getElementById('gameContainer').style.display = 'none';
}

function gameLoop() {
  draw();
}
