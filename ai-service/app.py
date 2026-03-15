from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from cv_parser import extract_text_from_file
from matcher import rank_jobs

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No JSON payload provided"}), 400
            
        user_profile = data.get('profile', {})
        cv_path = data.get('cvPath', None)
        jobs = data.get('jobs', [])
        
        # 1. Extract CV Text
        cv_text = ""
        if cv_path and os.path.exists(cv_path):
            cv_text = extract_text_from_file(cv_path)
        elif cv_path:
            print(f"Warning: CV not found at path: {cv_path}")
            
        # 2. Rank jobs
        ranked_jobs = rank_jobs(user_profile, cv_text, jobs)
        
        return jsonify({
            "success": True,
            "recommendations": ranked_jobs
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print(f"Starting AI Job Recommender Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
