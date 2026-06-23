# BigQuery Release Notes Tracker & Twitter Composer

A sleek, modern web application built with **Python Flask** and **vanilla HTML/JS/CSS** that pulls the latest Google Cloud BigQuery Release Notes, structures them beautifully, and lets you select specific updates to tweet instantly with a live Twitter/X post preview.

---

## 🚀 Features

*   **Real-time RSS Aggregator**: Backend API that proxies and parses the official Google Cloud BigQuery Release Notes RSS XML feed into structured JSON.
*   **Frosted Glass (Glassmorphism) UI**: Sleek dark-mode aesthetic built entirely with responsive Vanilla CSS.
*   **Interactive Update Selection**: Click on any specific list item (`<li>`) or paragraph (`<p>`) inside a release log to highlight it and immediately load it into the tweet composer.
*   **Live Twitter/X Post Preview**: Shows a replica of a Twitter dark-mode card, updating in real-time as you write or edit your tweet.
*   **Intelligent Text Truncation**: Automatically formats the tweet template with hashtags (`#BigQuery #GoogleCloud`) and safely clips selected text if it exceeds the 280-character limit.
*   **Native Web Intent Publishing**: Safely loads the drafted post directly into Twitter/X for sharing without requiring API keys or user OAuth integrations.

---

## 🛠️ Tech Stack

*   **Backend**: Python 3, Flask, Requests, Feedparser
*   **Frontend**: Plain Vanilla HTML5, CSS3 (Variables, Backdrop-filters), JavaScript (ES6+, Async/Await)
*   **Fonts/Icons**: FontAwesome 6, Google Fonts (Outfit & Inter)

---

## 📂 Project Structure

```text
.
├── app.py                  # Main Flask backend & RSS proxy API
├── templates/
│   └── index.html          # Core single-page HTML layout
├── static/
│   ├── css/
│   │   └── style.css       # Custom styles, Glassmorphism theme, and Tweet mockup
│   └── js/
│       └── main.js         # Fetching, DOM rendering, selection, and intent logic
├── .gitignore              # Ignored files (__pycache__, venv, OS configs)
└── README.md               # Project documentation
```

---

## ⚙️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone git@github.com:nanashi193/5Days-event-talks-app.git
    cd 5Days-event-talks-app
    ```

2.  **Install dependencies**:
    Make sure you have Python 3 installed. Then, install Flask and feedparser:
    ```bash
    pip install flask requests feedparser
    ```

3.  **Run the application**:
    Start the local development server:
    ```bash
    python app.py
    ```

4.  **Open the App**:
    Navigate to **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your web browser.

---

## 📖 How to Use

1.  **View Updates**: Click the **Refresh** button in the header to pull the newest releases (the app does this automatically on first load).
2.  **Explore Details**: Click on any date card in the left sidebar to reveal the release documentation on the right.
3.  **Select & Draft**: Hover over any paragraph or list item in the details panel and click on it. The selected text is highlighted and prefilled in the composer.
4.  **Edit & Preview**: Refine your tweet inside the editor textbox. The live Twitter card preview and the character counter will update in real-time.
5.  **Share**: Click **Post to X / Twitter** to open a new tab with your prefilled draft ready to post!
