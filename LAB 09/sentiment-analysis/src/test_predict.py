from src.predict import SentimentPredictor
import os
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
model_path = os.path.join(root, 'models', 'sentiment_model.pkl')
vectorizer_path = os.path.join(root, 'models', 'vectorizer.pkl')
sp = SentimentPredictor(model_path, vectorizer_path)
print(sp.predict_single('I love this airline!'))
print(sp.predict_single('This was the worst flight I have taken.'))
