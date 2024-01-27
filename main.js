const config = {
  canvas_width: 1000,
  canvas_height: 1000,
  defaultVelocity: 0.06,
};

const MAX_WIDTH = config.canvas_width;
const MAX_HEIGHT = config.canvas_height;
const BASE_FILL = "rgb(200, 200, 200)";
const MOUSE_FILL = "rgb(255,0,0)";
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
    MOUSE.size
  );
}

function gameOver(collisionBlock) {
  renderMouse();
  clearCanvas(canvas);
  for (let index = 0; index < blocks.length; index++) {
    const collisionBlock = blocks[index];
    collisionBlock.drawInCanvas(canvas);
  }
  collisionBlock.drawInCanvas(canvas, "rgb(0,0,255)");
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

  calculeNewPosition(x, y) {
    const newX = x + this.module * Math.cos((this.yaw * Math.PI) / 180);
    const newY = y + this.module * Math.sin((this.yaw * Math.PI) / 180);
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
    context.fillStyle = fillStyle ? fillStyle : "rgb(0, 0, 0)";
    const drawX = this.x - this.size / 2;
    const drawY = this.y - this.size / 2;
    context.fillRect(drawX, drawY, this.size, this.size);
  }

  nextFrame() {
    let newPos = this.velocity.calculeNewPosition(this.x, this.y);
    this.x = newPos.x;
    this.y = newPos.y;
    if (this.size < this.maxSize) this.size += 2;
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

function render() {
  // Render collision blocks logic
  for (let index = 0; index < blocks.length; index++) {
    const collisionBlock = blocks[index];
    collisionBlock.drawInCanvas(canvas, BASE_FILL);
    if (isCollision(collisionBlock)) break;
    collisionBlock.nextFrame();
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

render();

cursorCanvas.addEventListener("mousemove", function (event) {
  var canvasRect = cursorCanvas.getBoundingClientRect();
  var canvasX = canvasRect.left;
  var canvasMaxX = canvasRect.right;
  var canvasY = canvasRect.top;
  var canvasMaxY = canvasRect.bottom;

  const mouseX = Math.floor(
    (event.clientX * MAX_WIDTH) / (canvasMaxX - canvasX)
  );
  const mouseY = Math.floor(
    (event.clientY * MAX_HEIGHT) / (canvasMaxY - canvasY)
  );

  const context = cursorCanvas.getContext("2d");

  if (!MOUSE.collision) {
    // Clear cursor
    context.clearRect(
      MOUSE.x - MOUSE.size / 2,
      MOUSE.y - MOUSE.size / 2,
      MOUSE.size,
      MOUSE.size
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
  requestAnimationFrame(render);
  blocks = [];
  clearCanvas(canvas);
}
