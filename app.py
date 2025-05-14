from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime, timedelta
import calendar

app = Flask(__name__)

# Data storage
DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"tasks": {}, "notes": {}}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def index():
    # Get current year and month
    today = datetime.now()
    year = request.args.get('year', type=int, default=today.year)
    month = request.args.get('month', type=int, default=today.month)
    
    # Get calendar data
    cal = calendar.monthcalendar(year, month)
    month_name = calendar.month_name[month]
    
    # Get previous and next month
    if month == 1:
        prev_month = 12
        prev_year = year - 1
    else:
        prev_month = month - 1
        prev_year = year
        
    if month == 12:
        next_month = 1
        next_year = year + 1
    else:
        next_month = month + 1
        next_year = year
    
    # Load tasks and notes
    data = load_data()
    
    return render_template('index.html', 
                          cal=cal, 
                          month=month,
                          month_name=month_name,
                          year=year,
                          today=today,
                          prev_month=prev_month,
                          prev_year=prev_year,
                          next_month=next_month,
                          next_year=next_year,
                          data=data)

@app.route('/tasks/<date>', methods=['GET'])
def get_tasks(date):
    data = load_data()
    if date in data["tasks"]:
        return jsonify(data["tasks"][date])
    return jsonify([])

@app.route('/tasks/<date>', methods=['POST'])
def add_task(date):
    data = load_data()
    task = request.json
    
    if date not in data["tasks"]:
        data["tasks"][date] = []
    
    data["tasks"][date].append({
        "id": len(data["tasks"][date]) + 1,
        "text": task["text"],
        "completed": False,
        "crossed": False,
        "days": task.get("days", ["all"])  # all, weekday, weekend
    })
    
    save_data(data)
    return jsonify(data["tasks"][date][-1])

@app.route('/tasks/<date>/<int:task_id>', methods=['PUT'])
def update_task(date, task_id):
    data = load_data()
    task_update = request.json
    
    if date in data["tasks"]:
        for task in data["tasks"][date]:
            if task["id"] == task_id:
                if "completed" in task_update:
                    task["completed"] = task_update["completed"]
                if "crossed" in task_update:
                    task["crossed"] = task_update["crossed"]
                if "text" in task_update:
                    task["text"] = task_update["text"]
                if "days" in task_update:
                    task["days"] = task_update["days"]
                save_data(data)
                return jsonify(task)
    
    return jsonify({"error": "Task not found"}), 404

@app.route('/notes/<date>', methods=['GET'])
def get_notes(date):
    data = load_data()
    if date in data["notes"]:
        return jsonify({"text": data["notes"][date]})
    return jsonify({"text": ""})

@app.route('/notes/<date>', methods=['POST'])
def save_notes(date):
    data = load_data()
    note_text = request.json.get("text", "")
    data["notes"][date] = note_text
    save_data(data)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)
