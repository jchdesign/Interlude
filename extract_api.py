from flask import Flask, request, jsonify
import tempfile
import requests
from extract_features import extract_features

app = Flask(__name__)

@app.route('/extract', methods=['POST'])
def extract():
    audio_url = request.json['audio_url']
    # Download the audio file to a temp file (streamed)
    with tempfile.NamedTemporaryFile(suffix=".audio") as tmp:
        r = requests.get(audio_url, stream=True)
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                tmp.write(chunk)
        tmp.flush()
        # Run your feature extraction
        features = extract_features(tmp.name)
    return jsonify(features)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080) 