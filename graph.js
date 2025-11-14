const ctx = document.getElementById("histogramChart").getContext("2d");

// Create the chart
const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Flow Rate", "Pressure", "Sound Level"],
    datasets: [{
      label: "Sensor Readings",
      data: [0, 0, 0],
      backgroundColor: ["#34A853", "#34A853", "#34A853"], // start all green
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Sensor Value" }
      }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Real-Time Sensor Data" }
    }
  }
});

// Fetch latest data from backend and update chart
async function updateHistogram() {
  try {
    const res = await fetch("http://127.0.0.1:5000/latest");
    const data = await res.json();

    // Update chart data
    chart.data.datasets[0].data = [data.flow, data.pressure, data.sound];

    // Set bar color & text based on leak detection
    const statusEl = document.getElementById("leakStatus");

    if (data.leak_detected) {
      chart.data.datasets[0].backgroundColor = ["#EA4335", "#EA4335", "#EA4335"]; // red bars
      statusEl.textContent = `🚨 Leak Detected at ${data.leak_position.toUpperCase()}!`;
      statusEl.style.color = "red";
    } else {
      chart.data.datasets[0].backgroundColor = ["#34A853", "#34A853", "#34A853"]; // green bars
      statusEl.textContent = "✅ No Leak Detected";
      statusEl.style.color = "green";
    }

    chart.update();
  } catch (err) {
    console.error("Backend not reachable:", err);
  }
}

// --- NEW: Auto-send random simulated sensor data ---
async function sendRandomSensorData() {
  // Simulate sensor readings (random but realistic)
  const simulatedData = {
    flow: (Math.random() * 100).toFixed(1),      // 0–100 L/min
    pressure: (Math.random() * 40).toFixed(1),   // 0–40 PSI
    sound: (Math.random() * 80).toFixed(1)       // 0–80 dB
  };

  try {
    await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simulatedData)
    });
  } catch (err) {
    console.error("Error sending sensor data:", err);
  }
}

// 🔄 Run every 2 seconds: send new random data + update histogram
setInterval(() => {
  sendRandomSensorData();
  updateHistogram();
}, 2000);
