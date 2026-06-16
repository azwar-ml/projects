import os
import sys
import pickle
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from preprocess import preprocess_text

class SentimentPredictor:
    def __init__(self, model_path, vectorizer_path):
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
            raise FileNotFoundError('Model or vectorizer not found')
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)
        self.label_map = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}

    def predict_single(self, text):
        cleaned = preprocess_text(text)
        if not cleaned.strip():
            return 'Neutral', 0.0
        vec = self.vectorizer.transform([cleaned])
        pred = self.model.predict(vec)[0]
        prob = float(max(self.model.predict_proba(vec)[0]))
        return self.label_map[pred], prob

    def predict_batch(self, texts):
        return [self.predict_single(t) for t in texts]

if __name__ == '__main__':
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(project_root, 'models', 'sentiment_model.pkl')
    vectorizer_path = os.path.join(project_root, 'models', 'vectorizer.pkl')
    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print('Model files not found. Run training first.')
        sys.exit(1)
    predictor = SentimentPredictor(model_path, vectorizer_path)
    while True:
        try:
            text = input('Enter a sentence to analyze:\n')
            if text.lower() in ['exit', 'quit']:
                break
            label, _ = predictor.predict_single(text)
            print(f'Predicted Sentiment: {label}')
        except KeyboardInterrupt:
            break
