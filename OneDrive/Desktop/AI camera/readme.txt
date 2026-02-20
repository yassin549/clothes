Overview

A high-performance, real-time vision intelligence system that autonomously monitors live RTSP video streams and turns raw video into structured, searchable identity and event data — all running on CPU hardware.

Primary goals (clear + measurable)

Autonomous intelligence — convert continuous RTSP streams into structured events (detections, tracks, identity matches, timestamps) without human supervision.

Identity persistence — track and recognize people across different cameras, lighting conditions, poses and occlusions; each newly seen person becomes a persistent identity in a local, searchable database.

CPU-first performance — achieve smooth, low-latency live monitoring while running on CPUs (no GPU required).

Core features (precise behavior and expectations)

1. Identity Management System

What it does: detects faces/people, computes compact embeddings, looks up nearest identity in the local index, and either assigns an existing identity or creates a new one.

Continuity & robustness: maintains an identity even through brief occlusions or fast motion by combining short-term tracking (tracklets + Kalman filter) with embedding re-matching when a target reappears.

Index & lookup: store embeddings in a vector index (FAISS/Annoy or similar CPU ANN), keep a small history per identity (last N embeddings) and use averaged/EMA embeddings + cosine similarity for matching.

Efficiency rules: lower the frequency of full re-detections (detect every N frames), perform lightweight re-ID checks on tracked boxes, and update identity records only when confidence is high.

2. Live tracking & detection pipeline

Detector + tracker split: run a lightweight person/face detector on sampled frames, use a CPU-friendly tracker (SORT / ByteTrack variants) between detection steps to keep per-object continuity with minimal computation.

Frame pipeline: asynchronous producer/consumer design — RTSP reader → frame queue → detection workers → tracking / re-ID workers → storage / UI. This keeps latency low and CPU cores utilized.

Latency target: design for near-real-time (for example, 15–25 FPS effective display and end-to-end latency under ~200–300 ms on typical modern CPUs)

3. Desktop Control Center (Windows)

Capabilities: add/manage RTSP sources, start/stop monitoring, live video preview with overlays (boxes + identity IDs), list of recognized identities in the current livestream, browsing identities in the database and ability to rename the ID of a given identity.

Identity view: for each identity show: ID, representative face image(s), timestamps, camera(s) seen on, confidence history.

Tech stack options: Electron or Tauri front-end with a local backend service (Rust/Go/Python) that runs the vision pipeline. (Tauri gives smaller bundles and lower memory on Windows)

4. Performance & UX

Smooth live stream: aggressive buffering + adaptive frame skipping: if processing lags, the UI shows latest processed frame while keeping track continuity, avoiding UI freezes.

Very low latency: processing and UI decoupled — preview is updated as soon as the tracker produces a new frame, detection runs in separate threads.

Implementation recommendations (practical, CPU-focused)

Lightweight models: use CPU-friendly detectors/re-id models — examples: MobileNet-based detectors, TinyYOLO variants, BlazeFace for faces, MobileFaceNet / ArcFace small for embeddings. Quantize models (int8) and use ONNX Runtime or OpenVINO for CPU acceleration.

Tracking + re-ID strategy: use SORT/ByteTrack for motion tracking + embedding matching for identity persistence. Keep re-ID searches limited to candidates near predicted track positions to reduce ANN queries.

Vector index & DB: keep identity metadata in a local relational DB (SQLite or small PostgreSQL) and embeddings in a CPU ANN index (FAISS CPU, Annoy) for fast nearest neighbor lookups. Store only hashed/derived face features (not raw face images) unless required; if you do store images, encrypt at rest.

Identity update policy: maintain identity.embedding as an EMA of recent stable embeddings; only update when matching confidence is high to prevent drift. Keep a small gallery (K recent thumbnails) per identity for UI and verification.

Occlusion & reappearance: use tracklet lifecycle + re-matching window (e.g., allow re-association within T seconds) and fallback to embedding search across recent inactive tracklets if a match is suspected.

Data model (example identity record)

identity_id (uuid)

created_at (timestamp)

representative_thumbnail (path / blob)

embedding (vector, L2-normalized)

embedding_history (recent N embeddings)

seen_cameras (list)

last_seen_at (timestamp)

metadata (optional labels, admin notes)

Design philosophy (short)

Minimal, premium UI: focus on clarity — large live preview, unobtrusive overlays, quick identity search, and a simple initial setup flow. Prioritize readable typography, clean cards for identities, and fast keyboard shortcuts for common actions.

Always remember that a fluid, extremely fast and extremely perfomant system is the most important goal here.

this is a one camera only system and the RTSP of the camera should be stored in a .env file