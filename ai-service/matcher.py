import math
import re
from collections import Counter

# Optional: if you had spacy, it would be loaded here.
# Removed due to Pydantic V1 / Python 3.14+ incompatibilities causing deadlocks with sklearn.
nlp = None

def clean_text(text):
    if not text:
        return ""
    # Remove special characters and lowercase
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text).lower()
    return text

def create_user_document(profile, cv_text):
    # Combine user data into a single text representation
    parts = []
    
    if profile.get('title'):
        parts.append(profile['title'])
        parts.append(profile['title']) # Weight title heavily
    
    if profile.get('bio'):
        parts.append(profile['bio'])
        
    skills = profile.get('skills', [])
    if skills:
        parts.extend(skills * 2) # Weight skills heavily
        
    education = profile.get('education', [])
    for ed in education:
        if isinstance(ed, dict):
            parts.append(ed.get('degree', ''))
            parts.append(ed.get('field', ''))
            
    experience = profile.get('experience', [])
    for exp in experience:
        if isinstance(exp, dict):
            parts.append(exp.get('title', ''))
            parts.append(exp.get('description', ''))
            
    languages = profile.get('languages', [])
    if languages:
        parts.extend(languages)
        
    # Add CV text
    if cv_text:
        parts.append(cv_text)
        
    return clean_text(" ".join([str(p) for p in parts if p]))

def create_job_document(job):
    parts = []
    
    title = job.get('title', '')
    if title:
        parts.append(title)
        parts.append(title) # Weight title
        
    description = job.get('description', '')
    if description:
        parts.append(description)
        
    category = job.get('category', '')
    if category:
        parts.append(category)
        
    requirements = job.get('requirements', [])
    if requirements:
        parts.extend(requirements * 2) # Weight requirements
        
    return clean_text(" ".join([str(p) for p in parts if p]))


def compute_tfidf(docs):
    # docs: list of single strings representing each document
    tokenized_docs = [doc.split() for doc in docs]
    n_docs = len(tokenized_docs)
    
    # Calculate DF
    df = Counter()
    for tokens in tokenized_docs:
        unique_tokens = set(tokens)
        for token in unique_tokens:
            df[token] += 1
            
    # Calculate IDF (scikit-learn smooth idf)
    idf = {}
    for token, freq in df.items():
        idf[token] = math.log((1 + n_docs) / (1 + freq)) + 1.0

    # Calculate TF-IDF vectors
    tfidf_vectors = []
    for tokens in tokenized_docs:
        tf = Counter(tokens)
        vec = {}
        norm_sq = 0.0
        for token, count in tf.items():
            val = count * idf[token]
            vec[token] = val
            norm_sq += val * val
        
        # L2 normalize
        norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
        normalized_vec = {k: v / norm for k, v in vec.items()}
        tfidf_vectors.append(normalized_vec)
        
    return tfidf_vectors

def cosine_similarity_dict(vec1, vec2):
    intersection = set(vec1.keys()) & set(vec2.keys())
    return sum(vec1[k] * vec2[k] for k in intersection)

def rank_jobs(user_profile, cv_text, jobs):
    if not jobs:
        return []
        
    user_doc = create_user_document(user_profile, cv_text)
    job_docs = [create_job_document(job) for job in jobs]
    
    # If user doc is practically empty, return 0 scores
    if not user_doc.strip():
        return [{"jobId": job['id'], "score": 0} for job in jobs]
        
    # Combine all docs for vectorization (user doc is index 0)
    all_docs = [user_doc] + job_docs
    
    # Compute TF-IDF vectors
    vectors = compute_tfidf(all_docs)
    user_vector = vectors[0]
    job_vectors = vectors[1:]
    
    results = []
    for i, job in enumerate(jobs):
        sim = cosine_similarity_dict(user_vector, job_vectors[i])
        score = float(sim * 100)
        score = round(score, 2)
        results.append({
            "jobId": job['id'],
            "score": score
        })
        
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return results
