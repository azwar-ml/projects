import os
import sys
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

sys.path.insert(0, os.path.dirname(__file__))
from preprocess import preprocess_text

class SentimentModel:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.vectorizer = None

    def load_data(self, filepath, text_column='text', label_column='airline_sentiment'):
        df = pd.read_csv(filepath)
        df = df.dropna(subset=[text_column, label_column])
        label_map = {'negative': 0, 'neutral': 1, 'positive': 2}
        y = df[label_column].map(label_map).values
        X = df[text_column].values
        return X, y

    def preprocess_data(self, X):
        return np.array([preprocess_text(text) for text in X])

    def split_data(self, X, y, test_size=0.2):
        return train_test_split(X, y, test_size=test_size, random_state=self.random_state, stratify=y)

    def extract_features(self, X_train, X_test, max_features=5000):
        self.vectorizer = TfidfVectorizer(max_features=max_features, ngram_range=(1,2), min_df=2, max_df=0.8, strip_accents='unicode', lowercase=True, stop_words='english')
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)
        return X_train_tfidf, X_test_tfidf

    def train(self, X_train_tfidf, y_train):
        self.model = LogisticRegression(max_iter=1000, random_state=self.random_state, multi_class='multinomial', solver='lbfgs')
        self.model.fit(X_train_tfidf, y_train)

    def evaluate(self, X_test_tfidf, y_test):
        y_pred = self.model.predict(X_test_tfidf)
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0),
            'confusion_matrix': confusion_matrix(y_test, y_pred),
            'classification_report': classification_report(y_test, y_pred)
        }
        return metrics

    def save_model(self, model_path, vectorizer_path):
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)

    def full_pipeline(self, data_path, model_save_path, vectorizer_save_path, test_size=0.2):
        X, y = self.load_data(data_path)
        X_processed = self.preprocess_data(X)
        X_train, X_test, y_train, y_test = self.split_data(X_processed, y, test_size)
        X_train_tfidf, X_test_tfidf = self.extract_features(X_train, X_test)
        self.train(X_train_tfidf, y_train)
        metrics = self.evaluate(X_test_tfidf, y_test)
        self.save_model(model_save_path, vectorizer_save_path)
        return metrics

if __name__ == '__main__':
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(project_root, 'data', 'twitter_sentiment.csv')
    model_path = os.path.join(project_root, 'models', 'sentiment_model.pkl')
    vectorizer_path = os.path.join(project_root, 'models', 'vectorizer.pkl')
    if not os.path.exists(data_path):
        print(f'Error: Data file not found at {data_path}')
        sys.exit(1)
    model = SentimentModel()
    metrics = model.full_pipeline(data_path, model_path, vectorizer_path)
    print('Training complete')
    print('Accuracy:', metrics['accuracy'])
    print(metrics['classification_report'])
