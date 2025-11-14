let running = false;
let interval;
const leak = document.getElementById("leak");
const flowEl = document.getElementById("flow");
const pressureEl = document.getElementById("pressure");
const soundEl = document.getElementById("sound");
const alertEl = document.getElementById("alert");
const water = document.querySelector(".water");

let history = [];

// Generate random sensor values
function random(base, range) {
  return (base + (Math.random() - 0.5) * range * 2).toFixed(1);
}

// --- Smart Leak Logic ---
function decideLeakPosition(flow, pressure, sound) {
  const f = parseFloat(flow);
  const p = parseFloat(pressure);
  const s = parseFloat(sound);

  if (f > 75 && p < 25 && s > 55 && s <= 65) return "before middle";
  if (f >= 55 && f <= 70 && p >= 20 && p <= 30 && s > 65) return "exact middle";
  if (f < 50 && p < 18 && s > 70) return "before end";
  return "none";
}

// 🚀 Real-time simulation
async function simulate() {
  // Force leak type every few seconds instead of pure randomness
  const randomZone = Math.floor(Math.random() * 4); // 0–3

  let flow, pressure, sound;
  let leak_position = "none";
  let leakDetected = false;

  if (randomZone === 0) {
    // No leak
    flow = random(60, 5);
    pressure = random(35, 3);
    sound = random(45, 3);
  } else if (randomZone === 1) {
    // Before middle leak
    flow = random(85, 5);
    pressure = random(20, 3);
    sound = random(60, 5);
    leakDetected = true;
    leak_position = "before middle";
  } else if (randomZone === 2) {
    // Exact middle leak
    flow = random(65, 3);
    pressure = random(25, 2);
    sound = random(70, 4);
    leakDetected = true;
    leak_position = "exact middle";
  } else {
    // Before end leak
    flow = random(45, 3);
    pressure = random(15, 2);
    sound = random(75, 5);
    leakDetected = true;
    leak_position = "before end";
  }

  flowEl.textContent = flow;
  pressureEl.textContent = pressure;
  soundEl.textContent = sound;

  // Backend call (optional)
  try {
    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow, pressure, sound }),
    });
    const data = await res.json();

    if (data.leak_detected) {
      showLeak(data.leak_position);
    } else {
      hideLeak();
    }
    return;
  } catch {
    // No backend — fallback
  }

  // Local simulation result
  if (leakDetected) showLeak(leak_position);
  else hideLeak();
}

// 🔴 Leak visuals
function showLeak(pos) {
  leak.style.display = "block";

  if (pos === "before middle") {
    leak.style.left = "35%";
    alertEl.textContent = "🚨 Leak Detected (Before Middle)!";
  } else if (pos === "exact middle") {
    leak.style.left = "50%";
    alertEl.textContent = "🚨 Leak Detected (Exact Middle)!";
  } else if (pos === "before end") {
    leak.style.left = "70%";
    alertEl.textContent = "🚨 Leak Detected (Before End)! Motor stopping...";
    stopMotor();
    setTimeout(() => {
      alertEl.textContent = "🛑 Severe leak near End — Motor Stopped Automatically.";
    }, 1200);
  }
}

// ✅ Hide leak
function hideLeak() {
  leak.style.display = "none";
  alertEl.textContent = "";
}

// 🌀 Motor control
async function startMotor() {
  if (!running) {
    running = true;
    water.style.animationPlayState = "running";
    interval = setInterval(simulate, 2000);

    try {
      await fetch("http://127.0.0.1:5000/start");
      alertEl.textContent = "✅ Motor started — Monitoring Active...";
    } catch {
      alertEl.textContent = "⚠️ Running locally (no backend)";
    }
  }
}

async function stopMotor() {
  if (running) {
    running = false;
    water.style.animationPlayState = "paused";
    clearInterval(interval);
    hideLeak();

    try {
      await fetch("http://127.0.0.1:5000/stop");
    } catch {}
  }
}

// 👉 Go to histogram graph page
document.getElementById("nextPage").addEventListener("click", () => {
  window.location.href = "graph.html";
});
