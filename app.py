from flask import Flask, render_template, send_from_directory
import os
import webbrowser
import threading

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

def open_browser():
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Open browser after a short delay to let Flask start
    threading.Timer(1.2, open_browser).start()
    print("\n  ✈  FlightPlan Pro is running!")
    print("  →  Open: http://localhost:5000")
    print("  →  Press CTRL+C to stop\n")
    app.run(debug=False, port=5000)
