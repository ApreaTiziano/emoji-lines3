const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { alpha: false });

const area = document.querySelector("#touchArea");
const emptyMessage = document.querySelector("#emptyMessage");
const menu = document.querySelector("#menu");
const photoInput = document.querySelector("#photoInput");

const modeButton = document.querySelector("#modeButton");
const frequencyButton = document.querySelector("#frequencyButton");
const backgroundButton = document.querySelector("#backgroundButton");
const emojiButton = document.querySelector("#emojiButton");
const sizeButton = document.querySelector("#sizeButton");
const saveButton = document.querySelector("#saveButton");
const clearButton = document.querySelector("#clearButton");

let mode = "drag";
let holdClickActive = false;

let frequency = 40;
let emojiSize = 42;

let background = "gradient";
let customColor = "#8f3cff";
let backgroundImage = null;

const MAX_PARTICLES = 420;
const MIN_DISTANCE = 22;
const MAX_SELECTED_EMOJIS = 10;

const emojiCatalog = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳",
  "🤩", "🥺", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
  "😣", "😖", "😫", "😩", "🥹", "😢", "😭", "😤", "😠", "😡",
  "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓",
  "🤗", "🤔", "🫣", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬",
  "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪",
  "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑",
  "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️",
  "👽", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
  "😿", "😾",

  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🩷", "🩵", "🤍",
  "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
  "💟", "💫", "💥", "💯", "💢", "💦", "💨", "💤", "✨", "⭐",
  "🌟", "🌙", "☀️", "🌤️", "🌈", "🔥", "❄️", "🌸", "🌺", "🌻",
  "🌷", "🌹", "🥀", "🌼", "🪻", "🍀", "🌿", "🍃", "🍂", "🍁",
  "🌴", "🌵", "🌱", "🌲", "🌳", "🌊", "☁️", "🌧️", "⛈️",

  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒",
  "🍑", "🍍", "🥝", "🥭", "🍏", "🥑", "🍕", "🍔", "🍟", "🌮",
  "🍩", "🍪", "🎂", "🍰", "🍭", "🍬", "🍫", "🍿", "☕", "🧋",
  "🧁",

  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔",
  "🐧", "🐦", "🐤", "🦄", "🐝", "🦋", "🐌", "🐞", "🐢", "🐍",
  "🦎", "🦖", "🐙", "🦀", "🐠", "🐟", "🐬", "🐳", "🦈",

  "🌍", "🌎", "🌏", "🌕", "🌑", "🚀", "🪐", "🌌", "☄️", "🛸",
  "🎈", "🎉", "🎊", "🎁", "🎀", "🎵", "🎶", "🎸", "🎨", "🎭",
  "📸", "💎", "👑", "🪩", "🧸", "🪄", "🕯️", "🔮", "🧿", "🧩",
  "🛼", "⚡", "☮️", "☯️", "♾️", "✅", "❌", "❗", "❓"
];

function getRandomEmojis(amount = 10) {
  const uniqueEmojis = [...new Set(emojiCatalog)];

  const shuffled = uniqueEmojis.sort(() => {
    return Math.random() - 0.5;
  });

  return shuffled.slice(0, amount);
}

// Al iniciar la página aparecen 10 emojis aleatorios.
let selectedEmojis = getRandomEmojis(10);

let particles = [];

let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

let pointerInside = false;
let lastPoint = null;
let lastSpawnPoint = null;

let holdAnimationId = null;
let lastHoldSpawn = 0;

let holdClickAnimationId = null;
let lastHoldClickSpawn = 0;

let lastSpawnTime = 0;
let renderAnimationId = null;
let needsRender = true;


// ========================================
// AJUSTAR CANVAS
// ========================================

function resizeCanvas() {
  const rect = area.getBoundingClientRect();

  canvasWidth = Math.max(1, rect.width);
  canvasHeight = Math.max(1, rect.height);

  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(canvasWidth * pixelRatio);
  canvas.height = Math.floor(canvasHeight * pixelRatio);

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  requestRender();
}


// ========================================
// RENDERIZADO OPTIMIZADO
// ========================================

function requestRender() {
  needsRender = true;

  if (renderAnimationId === null) {
    renderAnimationId = requestAnimationFrame(render);
  }
}

function render() {
  renderAnimationId = null;

  if (!needsRender) return;

  draw();

  needsRender = false;
}


// ========================================
// FONDOS
// ========================================

function drawBackground() {
  if (backgroundImage) {
    ctx.drawImage(
      backgroundImage,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    return;
  }

  if (background === "blue") {
    ctx.fillStyle = "#1c66c8";
  } else if (background === "red") {
    ctx.fillStyle = "#bd284b";
  } else if (background === "black") {
    ctx.fillStyle = "#050509";
  } else if (background === "white") {
    ctx.fillStyle = "#f7f7fb";
  } else if (background === "solid") {
    ctx.fillStyle = customColor;
  } else {
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    gradient.addColorStop(0, "#4c24a8");
    gradient.addColorStop(0.45, "#bb238f");
    gradient.addColorStop(1, "#ff6b35");

    ctx.fillStyle = gradient;
  }

  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}


// ========================================
// DIBUJAR EMOJIS
// ========================================

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackground();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = "rgba(0, 0, 0, 0.20)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;

  for (const particle of particles) {
    ctx.save();

    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    ctx.globalAlpha = particle.alpha;

    ctx.font = `${particle.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

    ctx.fillText(
      particle.emoji,
      0,
      0
    );

    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  emptyMessage.style.display = particles.length
    ? "none"
    : "grid";
}


// ========================================
// EMOJIS SELECCIONADOS
// ========================================

function randomEmoji() {
  if (selectedEmojis.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * selectedEmojis.length
  );

  return selectedEmojis[randomIndex];
}


// ========================================
// AGREGAR UN EMOJI
// ========================================

function addOneEmoji(point) {
  if (!point) return;

  // Si el usuario quitó todos los emojis,
  // no se agrega ninguno.
  if (selectedEmojis.length === 0) {
    return;
  }

  if (particles.length >= MAX_PARTICLES) {
    particles.splice(
      0,
      Math.max(1, Math.floor(MAX_PARTICLES * 0.08))
    );
  }

  const emoji = randomEmoji();

  if (!emoji) return;

  particles.push({
    emoji: emoji,
    x: point.x,
    y: point.y,
    size: emojiSize * (0.94 + Math.random() * 0.12),
    rotation: (Math.random() - 0.5) * 0.18,
    alpha: 1
  });

  requestRender();
}


// ========================================
// POSICIÓN DEL MOUSE
// ========================================

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: Math.max(
      0,
      Math.min(
        canvasWidth,
        event.clientX - rect.left
      )
    ),

    y: Math.max(
      0,
      Math.min(
        canvasHeight,
        event.clientY - rect.top
      )
    )
  };
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.hypot(dx, dy);
}


// ========================================
// FRECUENCIA
// ========================================

function getSpawnDelay() {
  return Math.max(40, 190 - frequency);
}

function canSpawn(now) {
  if (now - lastSpawnTime < getSpawnDelay()) {
    return false;
  }

  lastSpawnTime = now;

  return true;
}


// ========================================
// MODO CLICK
// ========================================

function handlePointerDown(event) {
  if (mode !== "click") return;

  const point = getPoint(event);

  addOneEmoji(point);
}


// ========================================
// MODO ARRASTRANDO
// ========================================

function handlePointerMove(event) {
  const point = getPoint(event);

  pointerInside = true;
  lastPoint = point;

  if (mode !== "drag") {
    return;
  }

  if (!lastSpawnPoint) {
    lastSpawnPoint = point;

    addOneEmoji(point);

    lastSpawnTime = performance.now();

    return;
  }

  const now = performance.now();

  if (
    distanceBetween(point, lastSpawnPoint) >= MIN_DISTANCE &&
    canSpawn(now)
  ) {
    addOneEmoji(point);

    lastSpawnPoint = point;
  }
}


// ========================================
// MODO MANTENER
// ========================================

function startHoldMode() {
  stopHoldMode();

  lastHoldSpawn = 0;

  function holdLoop(timestamp) {
    if (
      mode !== "hold" ||
      !pointerInside ||
      !lastPoint
    ) {
      holdAnimationId = null;

      return;
    }

    if (
      timestamp - lastHoldSpawn >= getSpawnDelay()
    ) {
      addOneEmoji(lastPoint);

      lastHoldSpawn = timestamp;
    }

    holdAnimationId = requestAnimationFrame(holdLoop);
  }

  holdAnimationId = requestAnimationFrame(holdLoop);
}

function stopHoldMode() {
  if (holdAnimationId !== null) {
    cancelAnimationFrame(holdAnimationId);

    holdAnimationId = null;
  }
}


// ========================================
// MODO MANTENER CLIC - NUEVO
// ========================================

function startHoldClickMode() {
  stopHoldClickMode();

  if (
    !holdClickActive ||
    mode !== "holdClick" ||
    !pointerInside ||
    !lastPoint
  ) {
    return;
  }

  lastHoldClickSpawn = 0;

  function holdClickLoop(timestamp) {
    if (
      mode !== "holdClick" ||
      !holdClickActive ||
      !pointerInside ||
      !lastPoint
    ) {
      holdClickAnimationId = null;

      return;
    }

    if (
      timestamp - lastHoldClickSpawn >= getSpawnDelay()
    ) {
      addOneEmoji(lastPoint);

      lastHoldClickSpawn = timestamp;
    }

    holdClickAnimationId =
      requestAnimationFrame(holdClickLoop);
  }

  holdClickAnimationId =
    requestAnimationFrame(holdClickLoop);
}

function stopHoldClickMode() {
  if (holdClickAnimationId !== null) {
    cancelAnimationFrame(holdClickAnimationId);

    holdClickAnimationId = null;
  }
}


// ========================================
// CAMBIAR MODO
// ========================================

function changeMode(newMode) {
  mode = newMode;

  lastPoint = null;
  lastSpawnPoint = null;

  holdClickActive = false;

  stopHoldMode();
  stopHoldClickMode();

  if (
    mode === "hold" &&
    pointerInside
  ) {
    startHoldMode();
  }
}


// ========================================
// MENÚS
// ========================================

function closeMenu() {
  menu.classList.add("hidden");
}

function showMenu(elements) {
  menu.replaceChildren(...elements);

  menu.classList.remove("hidden");
}

function createMenuButton(
  text,
  callback,
  active = false
) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;

  if (active) {
    button.classList.add("active");
  }

  button.addEventListener("click", event => {
    event.stopPropagation();

    callback();

    closeMenu();
  });

  return button;
}


// ========================================
// BOTÓN MODO
// ========================================

modeButton.addEventListener("click", () => {
  showMenu([
    createMenuButton(
      "Por click",
      () => changeMode("click"),
      mode === "click"
    ),

    createMenuButton(
      "Arrastrando",
      () => changeMode("drag"),
      mode === "drag"
    ),

    createMenuButton(
      "Mantener",
      () => changeMode("hold"),
      mode === "hold"
    ),

    createMenuButton(
      "Mantener clic",
      () => changeMode("holdClick"),
      mode === "holdClick"
    )
  ]);
});


// ========================================
// BOTÓN FRECUENCIA
// ========================================

frequencyButton.addEventListener("click", () => {
  showMenu(
    [20, 40, 60, 80, 100].map(value => {
      return createMenuButton(
        String(value),

        () => {
          frequency = value;
        },

        frequency === value
      );
    })
  );
});


// ========================================
// BOTÓN TAMAÑO
// ========================================

sizeButton.addEventListener("click", () => {
  showMenu(
    [24, 34, 42, 56, 70].map(value => {
      return createMenuButton(
        `${value} px`,

        () => {
          emojiSize = value;
        },

        emojiSize === value
      );
    })
  );
});


// ========================================
// BOTÓN FONDO
// ========================================

backgroundButton.addEventListener("click", () => {
  const backgroundButtons = [
    ["Degradado", "gradient"],
    ["Azul", "blue"],
    ["Rojo", "red"],
    ["Negro", "black"],
    ["Blanco", "white"]
  ].map(([label, value]) => {
    return createMenuButton(
      label,

      () => {
        background = value;
        backgroundImage = null;

        requestRender();
      },

      background === value &&
      !backgroundImage
    );
  });

  const colorBox = document.createElement("label");

  colorBox.className = "color-picker-row";
  colorBox.textContent = "Color personalizado";

  const colorInput = document.createElement("input");

  colorInput.type = "color";
  colorInput.value = customColor;

  colorInput.setAttribute(
    "aria-label",
    "Elegir color de fondo"
  );

  colorInput.addEventListener("change", event => {
    event.stopPropagation();

    customColor = event.target.value;
    background = "solid";
    backgroundImage = null;

    requestRender();
  });

  colorInput.addEventListener("input", event => {
    event.stopPropagation();
  });

  colorInput.addEventListener("click", event => {
    event.stopPropagation();
  });

  colorBox.appendChild(colorInput);

  const photoButton = createMenuButton(
    "Subir foto",
    () => photoInput.click()
  );

  const resetButton = createMenuButton(
    "Quitar foto",

    () => {
      backgroundImage = null;
      background = "gradient";

      requestRender();
    }
  );

  showMenu([
    ...backgroundButtons,
    colorBox,
    photoButton,
    resetButton
  ]);
});


// ========================================
// BOTÓN PERSONALIZAR EMOJIS
// ========================================

emojiButton.addEventListener("click", () => {
  const container = document.createElement("div");

  container.style.width = "100%";

  const info = document.createElement("div");

  info.textContent =
    `Seleccionados: ${selectedEmojis.length}/10`;

  info.style.color = "white";
  info.style.fontWeight = "bold";
  info.style.fontSize = "13px";
  info.style.marginBottom = "10px";

  const controls = document.createElement("div");

  controls.style.display = "flex";
  controls.style.gap = "8px";
  controls.style.marginBottom = "10px";
  controls.style.flexWrap = "wrap";

  const clearSelectionButton = createMenuButton(
    "Quitar todos",

    () => {
      selectedEmojis = [];

      updateAllEmojiButtons();
      openEmojiMenu();
    }
  );

  const randomTenButton = createMenuButton(
    "Elegir 10 al azar",

    () => {
      selectedEmojis = getRandomEmojis(10);

      updateAllEmojiButtons();
      openEmojiMenu();
    }
  );

  controls.appendChild(clearSelectionButton);
  controls.appendChild(randomTenButton);

  const wrapper = document.createElement("div");

  wrapper.className = "emoji-grid";

  for (const emoji of emojiCatalog) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "emoji-option";
    button.textContent = emoji;

    const updateButton = () => {
      const selected = selectedEmojis.includes(emoji);

      button.classList.toggle(
        "active",
        selected
      );

      button.title = selected
        ? "Quitar emoji"
        : "Agregar emoji";
    };

    updateButton();

    button.addEventListener("click", event => {
      event.stopPropagation();

      const index = selectedEmojis.indexOf(emoji);

      if (index >= 0) {
        // Quitar un emoji específico.
        selectedEmojis.splice(index, 1);
      } else if (
        selectedEmojis.length < MAX_SELECTED_EMOJIS
      ) {
        // Agregar un emoji si todavía no hay 10.
        selectedEmojis.push(emoji);
      } else {
        info.textContent =
          "Límite alcanzado: máximo 10 emojis";

        return;
      }

      updateAllEmojiButtons();
    });

    wrapper.appendChild(button);
  }

  function updateAllEmojiButtons() {
    wrapper
      .querySelectorAll(".emoji-option")
      .forEach(button => {
        const selected = selectedEmojis.includes(
          button.textContent
        );

        button.classList.toggle(
          "active",
          selected
        );

        button.title = selected
          ? "Quitar emoji"
          : "Agregar emoji";
      });

    info.textContent =
      `Seleccionados: ${selectedEmojis.length}/10`;
  }

  function openEmojiMenu() {
    showMenu([container]);
  }

  container.appendChild(info);
  container.appendChild(controls);
  container.appendChild(wrapper);

  showMenu([container]);
});


// ========================================
// SUBIR FOTO DE FONDO
// ========================================

photoInput.addEventListener("change", event => {
  const file = event.target.files?.[0];

  if (!file) return;

  const image = new Image();

  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    backgroundImage = image;
    background = "photo";

    requestRender();

    URL.revokeObjectURL(objectUrl);

    photoInput.value = "";
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);

    photoInput.value = "";
  };

  image.src = objectUrl;
});


// ========================================
// BOTÓN LIMPIAR
// ========================================

clearButton.addEventListener("click", () => {
  particles.length = 0;

  requestRender();
});


// ========================================
// BOTÓN GUARDAR
// ========================================

saveButton.addEventListener("click", () => {
  draw();

  const link = document.createElement("a");

  link.download = "emoji-lines.png";
  link.href = canvas.toDataURL("image/png");

  link.click();
});


// ========================================
// EVENTOS DEL ÁREA TÁCTIL
// ========================================

area.addEventListener("pointerenter", event => {
  pointerInside = true;

  lastPoint = getPoint(event);
  lastSpawnPoint = null;

  // El modo "Mantener" original sigue funcionando igual.
  if (mode === "hold") {
    startHoldMode();
  }
});

area.addEventListener(
  "pointermove",
  handlePointerMove
);

area.addEventListener("pointerleave", () => {
  pointerInside = false;

  lastPoint = null;
  lastSpawnPoint = null;

  stopHoldMode();

  // Detener también el nuevo modo.
  holdClickActive = false;
  stopHoldClickMode();
});

canvas.addEventListener(
  "pointerdown",
  handlePointerDown
);


// ========================================
// NUEVO MODO: MANTENER CLIC
// ========================================

canvas.addEventListener("pointerdown", event => {
  if (mode !== "holdClick") return;

  holdClickActive = true;

  lastPoint = getPoint(event);

  startHoldClickMode();
});

canvas.addEventListener("pointerup", event => {
  if (mode !== "holdClick") return;

  holdClickActive = false;

  lastPoint = getPoint(event);

  stopHoldClickMode();
});

canvas.addEventListener("pointercancel", () => {
  holdClickActive = false;

  stopHoldClickMode();
});


// ========================================
// CERRAR MENÚ AL HACER CLICK AFUERA
// ========================================

document.addEventListener("pointerdown", event => {
  const clickedInsideMenu = menu.contains(
    event.target
  );

  const clickedButton = event.target.closest(
    ".tool"
  );

  if (
    !clickedInsideMenu &&
    !clickedButton
  ) {
    closeMenu();
  }
});


// ========================================
// INICIALIZAR
// ========================================

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

requestRender();