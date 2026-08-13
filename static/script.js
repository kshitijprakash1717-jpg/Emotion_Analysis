const textInput = document.getElementById("textInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultSection = document.getElementById("resultSection");
const emotionWord = document.getElementById("emotionWord");
const emotionEmoji = document.getElementById("emotionEmoji");
const confidenceText = document.getElementById("confidenceText");
const echoedText = document.getElementById("echoedText");
const errorMsg = document.getElementById("errorMsg");
const statusDot = document.getElementById("statusDot");
const serverStatusText = document.getElementById("serverStatusText");
const charCount = document.getElementById("charCount");
const barsContainer = document.getElementById("barsContainer");

const apiUrl = "/predict";

function updateCharCount() {
  charCount.textContent = String(textInput.value.length);
  analyzeBtn.disabled = textInput.value.trim().length === 0;
}

async function checkHealth() {
  try {
    const response = await fetch("/health");
    const data = await response.json();
    const okay = response.ok && data.model_loaded;
    statusDot.style.background = okay ? "#24d17e" : "#ffb84d";
    statusDot.title = okay ? "model ready" : "model loading";
    serverStatusText.textContent = okay
      ? "model ready"
      : "connecting to model…";
  } catch (error) {
    statusDot.style.background = "#ff7b7b";
    statusDot.title = "server unavailable";
    serverStatusText.textContent = "server unavailable";
  }
}

function renderBarChart(probabilities) {
  barsContainer.innerHTML = "";
  const entries = Object.entries(probabilities).map(([label, value]) => ({
    label,
    value,
  }));
  const max = Math.max(...entries.map((item) => item.value));

  entries.forEach(({ label, value }) => {
    const row = document.createElement("div");
    row.className = "bar-item";

    const top = document.createElement("div");
    top.className = "bar-top";
    top.innerHTML = `<span>${label}</span><span>${(value * 100).toFixed(1)}%</span>`;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${(value / max) * 100}%`;

    track.appendChild(fill);
    row.appendChild(top);
    row.appendChild(track);
    barsContainer.appendChild(row);
  });
}

async function sendPrediction() {
  const text = textInput.value.trim();
  if (!text) {
    return;
  }

  errorMsg.hidden = true;
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing…";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Prediction failed");
    }

    const label = data.predicted_emotion;
    const emojiMap = {
      sadness: "😢",
      joy: "😄",
      love: "❤️",
      anger: "😠",
      fear: "😨",
      surprise: "😲",
    };

    emotionWord.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    emotionEmoji.textContent = emojiMap[label] || "✨";
    confidenceText.textContent = `${(data.confidence * 100).toFixed(1)}% confidence`;
    echoedText.textContent = text;
    renderBarChart(data.all_probabilites);
    resultSection.hidden = false;
  } catch (error) {
    errorMsg.textContent = error.message;
    errorMsg.hidden = false;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML =
      '<span class="btn-label">Read the mood</span><span class="btn-arrow">→</span>';
  }
}

textInput.addEventListener("input", updateCharCount);
textInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    sendPrediction();
  }
});
analyzeBtn.addEventListener("click", sendPrediction);

updateCharCount();
checkHealth();
