import os
import sys
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from preprocess import preprocess_text

project_root = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(project_root, 'data', 'twitter_sentiment.csv')
model_path = os.path.join(project_root, 'models', 'sentiment_model.pkl')
vectorizer_path = os.path.join(project_root, 'models', 'vectorizer.pkl')

if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
    print('Training model...')
    df = pd.read_csv(data_path)
    df = df.dropna(subset=['text', 'airline_sentiment'])
    label_map = {'negative': 0, 'neutral': 1, 'positive': 2}
    y = df['airline_sentiment'].map(label_map).values
    X = df['text'].values
    X_processed = np.array([preprocess_text(text) for text in X])
    X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42, stratify=y)
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,2), min_df=2, max_df=0.8, strip_accents='unicode', lowercase=True, stop_words='english')
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    model = LogisticRegression(max_iter=1000, random_state=42, multi_class='multinomial', solver='lbfgs')
    model.fit(X_train_tfidf, y_train)
    y_pred = model.predict(X_test_tfidf)
    print(f'Accuracy: {accuracy_score(y_test, y_pred):.2%}')
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    print('Model saved.')
else:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(vectorizer_path, 'rb') as f:
        vectorizer = pickle.load(f)

label_names = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}

print('\nEnter sentences to analyze (type "exit" or "quit" to stop):')
while True:
    try:
        text = input()
        if text.lower() in ['exit', 'quit']:
            break
        cleaned = preprocess_text(text)
        if not cleaned.strip():
            print('Neutral')
        else:
            vec = vectorizer.transform([cleaned])
            pred = model.predict(vec)[0]
            print(label_names[pred])
    except KeyboardInterrupt:
        break
