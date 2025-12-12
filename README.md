🎽 Virtual Shirt Try-On System

AI + AR Powered Real-Time Apparel Fitting Using Webcam

📌 Project Overview

The Virtual Shirt Try-On System allows users to visualize how different shirts look and fit on their body using webcam-based augmented reality.
It uses pose detection, image overlay, and real-time rendering to provide an interactive and engaging online shopping experience.

🚀 Key Features

Real-time shirt try-on using webcam

AI pose detection (MediaPipe / MoveNet)

Dynamic scaling and alignment based on user body movement

Shirt selection panel with multiple designs

Snapshot/Download feature for try-on previews

Admin panel for uploading shirts

Basic analytics dashboard to track usage and engagement

🧩 Problem This Solves

Online shoppers struggle with:

Uncertainty about fit, size, style, and look

High return rates (25–40%) due to sizing mismatch

Low confidence when buying shirts online

This system enables “Try Before You Buy”, making online apparel shopping more trustworthy and interactive.

👥 Target Users
B2C

Online shoppers aged 18–35

Fashion-conscious users who frequently shop on Myntra/Ajio/Amazon

B2B

Small & mid-sized apparel retailers

Instagram/Shopify clothing sellers

Boutique store owners
(e.g., The Urban Streetwear)

📁 Project Structure
/virtual-shirt-tryon
│── /src
│   ├── /components
│   ├── /pages
│   ├── /utils
│   ├── /pose-models
│── /public
│── /models
│── /assets (shirt images)
│── /docs
│   ├── Product_Requirement_Specification.pdf
│   ├── Data_Usage_Plan.pdf
│   ├── Design_Documents.pdf
│   ├── Test_Plan.pdf
│── package.json
│── README.md

🛠️ Tech Stack
Frontend

React.js

TensorFlow.js

MediaPipe / MoveNet

WebGL / Canvas for real-time rendering

Backend

Node.js or FastAPI

Firebase / MongoDB for database

Cloud storage for shirt assets

🏗️ System Architecture (High-Level)

User opens try-on page

Webcam feed activated

AI pose detector identifies shoulders & torso

Shirt template is scaled + rotated in real-time

Overlay rendered on video canvas

User interacts, switches shirts, or takes snapshot

Architecture diagram (include image later):

Frontend → Pose Detection → AR Render Engine → Backend API → Database

📘 Installation Guide
git clone <repo-url>
cd virtual-shirt-tryon
npm install
npm start


Then open:
http://localhost:3000

▶️ Usage Guide

Open the application

Allow camera permission

Choose any shirt from the right panel

Move slightly—shirt aligns with your body

Click Snapshot to save your preview

Admin Usage:

Login → Upload shirt → Add to catalog

🧪 Test Plan Summary

Webcam loading tests

Pose detection accuracy

Shirt alignment test

Performance test (FPS > 20)

Cross-browser test

Admin upload validation

Full Test Plan in /docs/Test_Plan.pdf.

🧠 Future Enhancements

Full-body outfit try-on

3D garment simulation

Mobile AR support

Integration with Myntra/Amazon APIs

Virtual dressing room for stores
