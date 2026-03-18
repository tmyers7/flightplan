#!/bin/bash
# FlightPlan Pro — launcher script
# Run this from within the flightplan/ directory or adjust SCRIPT_DIR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "  ✈  FlightPlan Pro — Local Edition"
echo "  ─────────────────────────────────"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "  ✗  Python 3 not found. Install it with: sudo apt install python3 python3-pip"
  exit 1
fi

# Install Flask if missing
python3 -c "import flask" 2>/dev/null || {
  echo "  →  Installing Flask..."
  pip3 install flask --break-system-packages -q
}

echo "  →  Starting server at http://localhost:5000"
echo "  →  Press CTRL+C to stop"
echo ""

python3 app.py
