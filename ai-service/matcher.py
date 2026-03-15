try:
    import spacy
    # Load English tokenizer, tagger, parser and NER
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print("Warning: could not load spaCy or its model. Falling back to basic text cleaning.", e)
    # Fallback if spacy model is not downloaded or errors out
    nlp = None

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

def clean_text(text):
    if not text:
        return ""
    # Remove special characters and lowercase
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text).lower()
    
    if nlp is not None:
        # Lemmatization using spacy
        # Limit text size to avoid spacy limits for huge documents
        try:
            doc = nlp(text[:100000])
            return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct and not token.is_space])
        except Exception:
            return text
    else:
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
    
    # Use TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except ValueError:
        # Happens if vocab is empty
        return [{"jobId": job['id'], "score": 0} for job in jobs]
        
    # Calculate cosine similarity of user (index 0) with all jobs (index 1 to end)
    user_vector = tfidf_matrix[0:1]
    job_vectors = tfidf_matrix[1:]
    
    similarities = cosine_similarity(user_vector, job_vectors).flatten()
    
    results = []
    for i, job in enumerate(jobs):
        # Convert similarity to a percentage representation (0-100)
        score = float(similarities[i]) * 100
        # Round to 2 decimal places
        score = round(score, 2)
        results.append({
            "jobId": job['id'],
            "score": score
        })
        
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return results
