# Flask Calendar App

A stylish and functional calendar web application built with Flask. This app allows users to manage tasks and notes in a calendar interface.

## Features

- Interactive calendar view
- Task management for each day
- Ability to mark tasks as completed or crossed out
- Task categorization (all days, weekdays, weekends)
- Flip animation to add notes for each day
- Data persistence using JSON

## Project Structure

```
flask-calendar-app/
├── app.py              # Main Flask application
├── data.json           # JSON file for data storage
├── static/
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # CSS styles
└── templates/
    └── index.html      # HTML template
```

## Installation

1. Clone this repository or download the files
2. Make sure you have Python and Flask installed
3. Create the required directory structure:

```bash
mkdir -p static templates
```

4. Place the files in their respective directories as per the project structure

## Running the App

1. Install the requirements:

```bash
pip install flask
```

2. Start the Flask server:

```bash
python app.py
```

3. Open your browser and navigate to `http://127.0.0.1:5000/`

## Deployment

This app can be deployed to various platforms:

### Heroku Deployment

1. Create a `Procfile` with the following content:
```
web: gunicorn app:app
```

2. Create a `requirements.txt` file:
```
Flask==2.0.1
gunicorn==20.1.0
```

3. Initialize a Git repository and deploy to Heroku:
```bash
git init
git add .
git commit -m "Initial commit"
heroku create
git push heroku master
```

### Other Deployment Options

- PythonAnywhere
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

## Customization

- Modify the CSS in `static/style.css` to change the appearance
- Add more features by extending the Flask routes in `app.py`
- Enhance the UI by updating the HTML and JavaScript

## License

This project is open-source and available for personal or commercial use.
