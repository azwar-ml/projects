import re
from nltk.corpus import stopwords
import nltk

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def remove_urls(text):
    return re.sub(r'https?://\S+|www\.\S+', '', text)

def remove_mentions_hashtags(text):
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#(\w+)', r'\1', text)
    return text

def remove_special_characters(text):
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&quot;', '"', text)
    text = re.sub(r'&#\d+;', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text

def remove_extra_whitespace(text):
    return re.sub(r'\s+', ' ', text).strip()

def remove_stopwords(tokens):
    stop_words = set(stopwords.words('english'))
    return [t for t in tokens if t not in stop_words]

def tokenize(text):
    return text.split()

def preprocess_text(text, remove_stop_words=True):
    if not isinstance(text, str) or not text.strip():
        return ''
    text = remove_urls(text)
    text = remove_mentions_hashtags(text)
    text = text.lower()
    text = remove_special_characters(text)
    text = remove_extra_whitespace(text)
    tokens = tokenize(text)
    if remove_stop_words:
        tokens = remove_stopwords(tokens)
    return ' '.join(tokens)

def batch_preprocess(texts, remove_stop_words=True):
    return [preprocess_text(t, remove_stop_words) for t in texts]
