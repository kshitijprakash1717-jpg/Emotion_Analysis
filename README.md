# Moodline — Emotion Prediction with a BiGRU

Predict emotion from a short sentence using a Bidirectional GRU (BiGRU) model. This repo contains a trained model, a FastAPI server that exposes a small web UI and an API, and the notebook used to explore and train models.

[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green.svg)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17.0-orange.svg)](https://www.tensorflow.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Predicts one of six emotions: **sadness, joy, love, anger, fear, surprise**
- FastAPI server with:
  - `GET /` — static UI served from `static/index.html`
  - `GET /health` — server + model health
  - `POST /predict` — returns predicted emotion, confidence, and full probability breakdown
- Ready-to-run UI in `static/` that polls `/health` and calls `/predict`
- Model artifacts included:
  - `Artifacts/BiGRU_Model.keras`
  - `Artifacts/tokenizer.pkl`
- Notebook (`final_clean.ipynb`) showing dataset loading, EDA, preprocessing, and training comparisons (RNN / LSTM / GRU / BiGRU)

## Stack

- **Language:** Python 3.11 (`runtime.txt`)
- **Framework:** FastAPI (server) + Uvicorn (ASGI)
- **Model:** TensorFlow / Keras (BiGRU saved model)
- **Notable libraries:** `fastapi`, `uvicorn`, `pydantic`, `tensorflow`, `numpy`

## Repository layout

```text
.
├── Artifacts/               # model artifacts (BiGRU model, tokenizer)
│   ├── BiGRU_Model.keras
│   └── tokenizer.pkl
├── static/                  # frontend UI (served at GET /)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── final_clean.ipynb        # training / experimentation notebook (Hugging Face dataset)
├── main.py                  # FastAPI app: load model, endpoints, preprocessing
├── requirements.txt         # Python dependencies
└── runtime.txt              # Python runtime used (python-3.11.9)
```

How it fits together:

- `main.py` loads the tokenizer and BiGRU model on startup and mounts `static/` as the UI.
- The UI (`static/index.html` + `script.js`) polls `/health`, sends text to `/predict`, and renders predicted emotion + probabilities.
- `final_clean.ipynb` contains the data processing and training experiments used to arrive at the BiGRU model.

## Quickstart — Run locally

### Requirements

- Python 3.11 (`runtime.txt`)
- At least ~50–100 MB free to load the model; TensorFlow may need more memory. If you have a GPU and want faster training/inference, install the appropriate TensorFlow GPU build instead of `tensorflow-cpu`.

### Clone the repository

```bash
git clone https://github.com/tanishq-latent/Emotion-Prediction.git
cd Emotion-Prediction
```

### Create a virtual environment and install dependencies

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt
```

### Start the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- The FastAPI server will load the model and tokenizer during startup (see console logs).
- UI: [http://localhost:8000/](http://localhost:8000/)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Notes:**

- If the model is not loaded yet, `/health` returns `model_loaded: false` and the UI will poll until ready.
- The BiGRU model file path: `Artifacts/BiGRU_Model.keras`. The tokenizer is `Artifacts/tokenizer.pkl`. Keep these files in place relative to `main.py`.

## API

### Health

**GET /health**

Response example:

```json
{
  "status": "Server is running",
  "model_loaded": true
}
```

### Predict

**POST /predict**

Request JSON:

```json
{
  "text": "I can't believe we actually pulled this off!"
}
```

Response schema:

```json
{
  "text": "I can't believe we actually pulled this off!",
  "predicted_emotion": "joy",
  "confidence": 0.9243,
  "all_probabilites": {
    "sadness": 0.0012,
    "joy": 0.9243,
    "love": 0.0301,
    "anger": 0.0025,
    "fear": 0.0100,
    "surprise": 0.0319
  }
}
```

cURL example:

```bash
curl -sS -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"I feel so excited about this project!"}'
```

## Model artifacts & training notes

- `Artifacts/BiGRU_Model.keras` — saved Keras model used by the API
- `Artifacts/tokenizer.pkl` — tokenizer used to convert input text to sequences

The notebook `final_clean.ipynb` documents:

- Loading the `dair-ai/emotion` dataset from Hugging Face
- Tokenization, padding (`maxlen = 50`), class weighting, early stopping
- Training and comparing RNN, LSTM, GRU, and a Bidirectional GRU
- Vocabulary size and preprocessing steps

### If you want to retrain

1. Open and run `final_clean.ipynb` (requires `datasets` package and the same data).
2. Ensure tokenizer and model save paths are consistent with `main.py` or adapt `main.py` to point to new artifact paths.
3. Consider using a GPU-enabled TensorFlow build for faster training.

## Preprocessing details (as used by the API)

- Lowercases input
- Removes apostrophes
- Replaces non-alphanumeric characters with spaces
- Collapses multiple spaces
- Tokenizer (`tokenizer.pkl`) converts cleaned text to sequences; sequences are padded/truncated to length 50 before prediction

## Troubleshooting

- If `/predict` returns **503** — model not yet loaded. Wait until `/health` reports `model_loaded: true`.
- TensorFlow import or large memory usage: consider installing `tensorflow` (GPU) or ensuring adequate RAM; `tensorflow-cpu` is in `requirements.txt` but can still use significant memory.
- Mismatch between tokenizer and model → retrain or use the tokenizer used during training.


## Dependencies

See `requirements.txt`. Key packages:

- `fastapi==0.115.0`
- `uvicorn[standard]==0.30.6`
- `pydantic==2.9.2`
- `tensorflow-cpu==2.17.0`
- `numpy==1.26.4`
- `h5py==3.11.0`

