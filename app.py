import os
import requests
import feedparser
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Constants
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    try:
        # Fetch the feed
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        # Parse the feed
        feed = feedparser.parse(response.content)
        
        releases = []
        for entry in feed.entries:
            # Extract content
            content_value = ""
            if 'content' in entry:
                content_value = entry.content[0].value
            elif 'summary' in entry:
                content_value = entry.summary
            
            # Clean up the ID/guid
            entry_id = entry.get('id', entry.get('link', ''))
            
            releases.append({
                'id': entry_id,
                'title': entry.get('title', 'BigQuery Update'),
                'updated': entry.get('updated', entry.get('published', '')),
                'link': entry.get('link', ''),
                'content': content_value
            })
            
        return jsonify({
            'status': 'success',
            'feed_title': feed.feed.get('title', 'BigQuery Release Notes'),
            'feed_subtitle': feed.feed.get('subtitle', 'Google Cloud BigQuery Release Notes'),
            'releases': releases
        })
    except Exception as e:
        app.logger.error(f"Error fetching release notes: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
