# ✈ FlightPlan Pro — Local Edition

A full-featured flight planning web app running locally via Python/Flask.

## Quick Start (WSL / Ubuntu)

### 1. Copy the folder to your WSL home directory

```bash
cp -r /path/to/flightplan ~/flightplan
```

### 2. Install Flask (one-time)

```bash
pip3 install flask --break-system-packages
```

Or use the launcher script which does this automatically.

### 3. Run the app

**Option A — use the launcher script:**
```bash
cd ~/flightplan
bash run.sh
```

**Option B — run directly:**
```bash
cd ~/flightplan
python3 app.py
```

### 4. Open in your browser

The app will open automatically, or navigate to:
```
http://localhost:5000
```

---

## File Structure

```
flightplan/
├── app.py              ← Flask server (run this)
├── run.sh              ← Convenience launcher
├── requirements.txt    ← Python dependencies
├── templates/
│   └── index.html      ← Main HTML page
└── static/
    ├── css/
    │   └── style.css   ← All styles
    └── js/
        └── app.js      ← All JavaScript logic
```

---

## Features

- **Flight Plan tab** — Aircraft ID, type, wake category, PIC, departure/destination (ICAO), ETD, flight rules, cruise altitude, TAS
- **Route & Waypoints tab** — SID/STAR, filed route string, interactive waypoint log with per-leg fuel and time
- **Fuel & Performance tab** — Trip/reserve/extra fuel calculator, endurance, weight & balance
- **Weather & NOTAMs tab** — Paste METARs/TAFs, winds aloft, altimeter, NOTAMs
- **Filed Plan tab** — Generates ICAO FPL format + FAA Form 7233-1, copy to clipboard, print

---

## Stopping the Server

Press `CTRL+C` in the terminal where the app is running.

---

## Notes

- No internet connection required after fonts load (fonts are from Google Fonts CDN)
- All data lives in the browser — nothing is saved between sessions
- To save flight plans, use the **Copy to Clipboard** or **Print** buttons
