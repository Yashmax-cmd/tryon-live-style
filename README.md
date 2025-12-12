# 🎽 tryon-live-style
**Virtual Shirt Try-On System** — AI + AR powered real-time shirt fitting using webcam.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Build](https://img.shields.io/github/workflow/status/Yashmax-cmd/tryon-live-style/Node.js%20CI?label=CI)](https://github.com/Yashmax-cmd/tryon-live-style/actions)
[![Demo](https://img.shields.io/badge/demo-unlisted-yellowgreen)](#demo)

> Web-based augmented reality try-on for shirts. Uses webcam + pose detection (MoveNet/MediaPipe) and WebGL canvas overlays to show shirt fit in real time.

---

## 🔗 Repo
`https://github.com/Yashmax-cmd/tryon-live-style`

## 📌 Demo
- YouTube (Unlisted) — *paste your video link here once uploaded*

---

## ✨ Key Features
- Live webcam try-on (real-time overlay)
- Pose detection (MoveNet / MediaPipe via TensorFlow.js)
- Shirt selection carousel & snapshot download
- Admin upload for shirt assets
- Lightweight analytics (try-on counts, engagement)

---

## 🧰 Tech Stack
- Frontend: React.js, HTML5 Canvas / WebGL
- ML/Client: TensorFlow.js, MoveNet / MediaPipe
- Backend (optional): Node.js / FastAPI for shirt catalog & HD rendering
- Storage: S3 / CDN (recommended)
- DB: MongoDB / Firebase

---

## 🚀 Quick Start (Local)
1. Clone the repo  
```bash
git clone https://github.com/Yashmax-cmd/tryon-live-style.git
cd tryon-live-style
