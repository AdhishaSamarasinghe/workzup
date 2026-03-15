from matcher import rank_jobs

user_profile = {
  "title": "Software Engineer",
  "skills": ["Python", "React", "Node.js"]
} 

cv_text = "I am a full stack developer with experience in python and javascript."

jobs = [
  {"id": "1", "title": "React Developer", "description": "Looking for frontend dev with React", "requirements": ["React", "JavaScript"]},
  {"id": "2", "title": "Python Backend Engineer", "description": "Build APIs in Python", "requirements": ["Python", "FastAPI"]},
  {"id": "3", "title": "Cleaner", "description": "Clean things", "requirements": []}
]

print(rank_jobs(user_profile, cv_text, jobs))
