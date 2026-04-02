const scene = document.getElementById("scene");
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

const stars = [];
const STAR_COUNT = 120;
let width = 0;
let height = 0;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function seedStars() {
  stars.length = 0;
  const palette = [
    [62, 111, 255],
    [18, 191, 168],
    [255, 138, 76],
  ];

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const tint = palette[Math.floor(Math.random() * palette.length)];
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.45 + 0.12,
      alpha: Math.random() * 0.7 + 0.15,
      tint,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed;
    if (star.y > height + 4) {
      star.y = -4;
      star.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(${star.tint[0]}, ${star.tint[1]}, ${star.tint[2]}, ${star.alpha * 0.7})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawStars);
}

function handlePointer(event) {
  const rect = scene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  const rotateY = x * 18;
  const rotateX = y * -16;

  scene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetScene() {
  scene.style.transform = "rotateX(0deg) rotateY(0deg)";
}

resizeCanvas();
seedStars();
drawStars();

window.addEventListener("resize", () => {
  resizeCanvas();
  seedStars();
});

scene.addEventListener("pointermove", handlePointer);
scene.addEventListener("pointerleave", resetScene);
