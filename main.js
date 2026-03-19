const config = {
  canvas_width: 1000,
  canvas_height: 1000,
  defaultVelocity: 0.06,
};

const MAX_WIDTH = config.canvas_width;
const MAX_HEIGHT = config.canvas_height;
const BASE_FILL = "#0f172a";
const MOUSE_FILL = "#38bdf8";
var start = new Date().getTime();
const MOUSE = {
  x: MAX_WIDTH / 2,
  y: MAX_HEIGHT / 2,
  size: 20,
  collision: false,
};
var velocityFactor = config.defaultVelocity;

const canvas = document.getElementById("canvas");
const cursorCanvas = document.getElementById("cursor");

function getRandomNumber(MIN, MAX) {
  return Math.floor(Math.random() * (MAX - MIN) + MIN);
}

function clearCanvas(canvas) {
  const context = canvas.getContext("2d");
  context.fillStyle = BASE_FILL;
  context.fillRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
}

function renderMouse() {
  const context = cursorCanvas.getContext("2d");
  context.fillStyle = MOUSE_FILL;
  context.fillRect(
    MOUSE.x - MOUSE.size / 2,
    MOUSE.y - MOUSE.size / 2,
    MOUSE.size,
    MOUSE.size,
  );
}

function gameOver(collisionBlock) {
  renderMouse();
  clearCanvas(canvas);
  for (let index = 0; index < blocks.length; index++) {
    const collisionBlock = blocks[index];
    collisionBlock.drawInCanvas(canvas);
  }
  collisionBlock.drawInCanvas(canvas, "#f8fafc");
}

function isCollision(collisionBlock) {
  const minX = MOUSE.x - MOUSE.size / 2;
  const minY = MOUSE.y - MOUSE.size / 2;
  const maxX = minX + MOUSE.size;
  const maxY = minY + MOUSE.size;

  const points = [
    { x: minX, y: minY },
    { x: minX, y: maxY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
  ];

  for (let i = 0; i < 4; i++) {
    if (collisionBlock.pointIn(points[i])) {
      MOUSE.collision = true;
      gameOver(collisionBlock);
      return true;
    }
  }

  return false;
}

class VelocityVector {
  constructor() {
    this.yaw = getRandomNumber(0, 360); // 0 - 360 deg
    this.module = getRandomNumber(2, 2 + 15 * velocityFactor); // 0.00 - 10.00 units
  }

  // ← CAMBIO: recibe dt para escalar el movimiento
  calculeNewPosition(x, y, dt) {
    const newX = x + this.module * Math.cos((this.yaw * Math.PI) / 180) * dt;
    const newY = y + this.module * Math.sin((this.yaw * Math.PI) / 180) * dt;
    return { x: Math.floor(newX), y: Math.floor(newY) };
  }
}

class CollisionBlock {
  constructor() {
    if (Math.random() >= 0.5) {
      this.x = Math.random() >= 0.5 ? 0 : MAX_WIDTH;
      this.y = getRandomNumber(0, MAX_HEIGHT + 1);
    } else {
      this.x = getRandomNumber(0, MAX_WIDTH + 1);
      this.y = Math.random() >= 0.5 ? 0 : MAX_HEIGHT;
    }
    this.maxSize = getRandomNumber(20, 200);
    this.size = 2;
    if (this.maxSize % 2 != 0) this.maxSize++;
    this.velocity = new VelocityVector();
  }

  drawInCanvas(canvas, fillStyle) {
    const context = canvas.getContext("2d");
    context.fillStyle = fillStyle ? fillStyle : "#f43f5e";
    const drawX = this.x - this.size / 2;
    const drawY = this.y - this.size / 2;
    context.fillRect(drawX, drawY, this.size, this.size);
  }

  // ← CAMBIO: recibe dt para escalar movimiento y crecimiento
  nextFrame(dt) {
    let newPos = this.velocity.calculeNewPosition(this.x, this.y, dt);
    this.x = newPos.x;
    this.y = newPos.y;
    if (this.size < this.maxSize) this.size += 2 * dt;
  }

  isOut() {
    return (
      this.x + this.size / 2 < 0 ||
      this.x - this.size / 2 > MAX_WIDTH ||
      this.y + this.size / 2 < 0 ||
      this.y - this.size / 2 > MAX_HEIGHT
    );
  }

  pointIn({ x, y }) {
    return (
      this.x - this.size / 2 <= x &&
      this.x + this.size / 2 >= x &&
      this.y - this.size / 2 <= y &&
      this.y + this.size / 2 >= y
    );
  }
}

var blocks = [];

clearCanvas(canvas);

// ← CAMBIO: variable para trackear el timestamp del frame anterior
let lastTimestamp = null;

// ← CAMBIO: render ahora recibe el timestamp de requestAnimationFrame
function render(timestamp) {
  // Calcular delta time en ms; primer frame asume 16.67ms (60fps)
  const deltaMs = lastTimestamp ? timestamp - lastTimestamp : 16.67;
  lastTimestamp = timestamp;

  // Normalizar a factor 1.0 = 60fps
  const dt = deltaMs / 16.67;

  // Render collision blocks logic
  for (let index = 0; index < blocks.length; index++) {
    const collisionBlock = blocks[index];
    collisionBlock.drawInCanvas(canvas, BASE_FILL);
    if (isCollision(collisionBlock)) break;
    collisionBlock.nextFrame(dt); // ← CAMBIO: pasar dt
    if (collisionBlock.isOut())
      blocks.splice(blocks.indexOf(collisionBlock), 1);
  }

  // Constant collision blocks amount
  if (blocks.length < 20) {
    for (let index = 0; index < 2; index++) {
      const collisionBlock = new CollisionBlock();
      collisionBlock.drawInCanvas(canvas);
      blocks.push(collisionBlock);
    }
  }

  renderMouse();

  if (!MOUSE.collision) {
    requestAnimationFrame(render);
    for (let index = 0; index < blocks.length; index++) {
      const collisionBlock = blocks[index];
      collisionBlock.drawInCanvas(canvas);
    }
  }
}

// ← CAMBIO: arrancar con requestAnimationFrame para recibir el timestamp
requestAnimationFrame(render);

cursorCanvas.addEventListener("mousemove", function (event) {
  var canvasRect = cursorCanvas.getBoundingClientRect();
  var canvasX = canvasRect.left;
  var canvasMaxX = canvasRect.right;
  var canvasY = canvasRect.top;
  var canvasMaxY = canvasRect.bottom;

  const mouseX = Math.floor(
    (event.clientX * MAX_WIDTH) / (canvasMaxX - canvasX),
  );
  const mouseY = Math.floor(
    (event.clientY * MAX_HEIGHT) / (canvasMaxY - canvasY),
  );

  const context = cursorCanvas.getContext("2d");

  if (!MOUSE.collision) {
    // Clear cursor
    context.clearRect(
      MOUSE.x - MOUSE.size / 2,
      MOUSE.y - MOUSE.size / 2,
      MOUSE.size,
      MOUSE.size,
    );

    // Update mouse position
    MOUSE.x = mouseX;
    MOUSE.y = mouseY;
  }
});

setInterval(() => {
  const time = document.getElementById("time");
  const now = new Date().getTime();
  const diferences = now - start;
  const seconds = Math.floor(diferences / 1000);
  const minutes = Math.floor(seconds / 60);
  velocityFactor = diferences / (1000 * 100); // 100 seconds
  if (!MOUSE.collision) {
    time.innerHTML = `${minutes}m ${seconds % 60}s ${diferences % 1000}ms`;
  } else if (!time.innerHTML.endsWith("restart!")) {
    time.innerHTML += " Click to restart!";
  }
}, 1000 / 60);

cursorCanvas.addEventListener("click", () => {
  if (MOUSE.collision) {
    resetGame();
  }
});

function resetGame() {
  start = Date.now();
  velocityFactor = config.defaultVelocity;
  MOUSE.collision = false;
  lastTimestamp = null; // ← CAMBIO: resetear el timestamp al reiniciar
  requestAnimationFrame(render);
  blocks = [];
  clearCanvas(canvas);
}
