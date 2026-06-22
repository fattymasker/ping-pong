const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.querySelector('#playerScore');
const computerScoreEl = document.querySelector('#computerScore');
const startButton = document.querySelector('#startButton');

const keys = new Set();
const state = {
  running: false,
  winner: '',
  playerScore: 0,
  computerScore: 0,
  paddleWidth: 14,
  paddleHeight: 96,
  playerY: canvas.height / 2 - 48,
  computerY: canvas.height / 2 - 48,
  ball: { x: canvas.width / 2, y: canvas.height / 2, vx: 6, vy: 3.4, radius: 10 },
};

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  state.ball.x = canvas.width / 2;
  state.ball.y = canvas.height / 2;
  state.ball.vx = 6 * direction;
  state.ball.vy = (Math.random() * 5 - 2.5) || 2;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateScore() {
  playerScoreEl.textContent = state.playerScore;
  computerScoreEl.textContent = state.computerScore;
}

function startGame() {
  state.playerScore = 0;
  state.computerScore = 0;
  state.winner = '';
  state.running = true;
  startButton.textContent = 'Restart game';
  updateScore();
  resetBall();
}

function movePaddles() {
  if (keys.has('w') || keys.has('arrowup')) state.playerY -= 8;
  if (keys.has('s') || keys.has('arrowdown')) state.playerY += 8;
  state.playerY = clamp(state.playerY, 0, canvas.height - state.paddleHeight);

  const target = state.ball.y - state.paddleHeight / 2;
  state.computerY += clamp(target - state.computerY, -5.3, 5.3);
  state.computerY = clamp(state.computerY, 0, canvas.height - state.paddleHeight);
}

function collideWithPaddle(paddleX, paddleY, isPlayer) {
  const b = state.ball;
  const hit = b.x + b.radius > paddleX && b.x - b.radius < paddleX + state.paddleWidth && b.y > paddleY && b.y < paddleY + state.paddleHeight;
  if (!hit) return;

  const relativeHit = (b.y - (paddleY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
  b.vx = Math.abs(b.vx) * (isPlayer ? 1 : -1) * 1.045;
  b.vy = relativeHit * 7;
  b.x = isPlayer ? paddleX + state.paddleWidth + b.radius : paddleX - b.radius;
}

function step() {
  if (!state.running) return;
  movePaddles();

  const b = state.ball;
  b.x += b.vx;
  b.y += b.vy;

  if (b.y - b.radius <= 0 || b.y + b.radius >= canvas.height) b.vy *= -1;
  collideWithPaddle(32, state.playerY, true);
  collideWithPaddle(canvas.width - 46, state.computerY, false);

  if (b.x < -b.radius) {
    state.computerScore += 1;
    resetBall(1);
  }
  if (b.x > canvas.width + b.radius) {
    state.playerScore += 1;
    resetBall(-1);
  }

  updateScore();
  if (state.playerScore >= 7 || state.computerScore >= 7) {
    state.running = false;
    state.winner = state.playerScore > state.computerScore ? 'Player wins!' : 'Computer wins!';
  }
}

function drawNet() {
  ctx.setLineDash([14, 16]);
  ctx.strokeStyle = '#304160';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  ctx.fillStyle = '#7df9ff';
  ctx.fillRect(32, state.playerY, state.paddleWidth, state.paddleHeight);
  ctx.fillStyle = '#95ff7d';
  ctx.fillRect(canvas.width - 46, state.computerY, state.paddleWidth, state.paddleHeight);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  ctx.fill();

  if (!state.running) {
    ctx.fillStyle = '#ffffffdd';
    ctx.font = '700 34px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.winner || 'Click Start to Play', canvas.width / 2, canvas.height / 2 - 20);
  }
}

function loop() {
  step();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') state.running = !state.running;
  keys.add(event.key.toLowerCase());
});
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.height / rect.height;
  state.playerY = clamp((event.clientY - rect.top) * scale - state.paddleHeight / 2, 0, canvas.height - state.paddleHeight);
});
startButton.addEventListener('click', startGame);

updateScore();
resetBall();
loop();
