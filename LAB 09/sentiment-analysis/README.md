# Sentiment Analysis & Text Classification Project

A machine learning project for classifying Twitter airline sentiment into three categories: **Positive**, **Negative**, and **Neutral** using Logistic Regression and TF-IDF feature extraction.

## Project Overview

This project implements a sentiment analysis pipeline that:
- Cleans and preprocesses raw tweet text
- Extracts features using TF-IDF vectorization
- Trains a Logistic Regression classifier
- Evaluates performance with multiple metrics
- Provides interactive predictions on new text

## Project Structure

```
sentiment-analysis/
├── data/
│   └── twitter_sentiment.csv          # Twitter airline sentiment dataset
├── src/
│   ├── preprocess.py                  # Text preprocessing module
│   ├── train.py                       # Model training module
│   └── predict.py                     # Prediction and inference module
├── models/
│   ├── sentiment_model.pkl            # Trained model (generated after training)
│   ├── vectorizer.pkl                 # TF-IDF vectorizer (generated after training)
│   └── confusion_matrix.png           # Evaluation plot (generated after training)
├── requirements.txt                   # Python dependencies
└── README.md                          # This file
```

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the sentiment-analysis directory
cd sentiment-analysis

# Create a virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Prepare Data

Place your Twitter sentiment dataset as `data/twitter_sentiment.csv`. The CSV should have at least these columns:
- `text`: Tweet content
- `airline_sentiment`: Sentiment label (negative, neutral, positive)

**Expected CSV Format:**
```csv
text,airline_sentiment
"Great flight experience!",positive
"Terrible service.",negative
"It was okay.",neutral
```

### 3. Train the Model

```bash
cd src
python train.py
```

This will:
- Load and preprocess the data
- Extract TF-IDF features
- Train a Logistic Regression model
- Display evaluation metrics (Accuracy, Precision, Recall, F1-Score)
- Generate a confusion matrix plot
- Save the model and vectorizer to `models/`

### 4. Make Predictions

Interactive mode:
```bash
python predict.py
```

The script will show sample predictions and then enter interactive mode where you can type text and get sentiment predictions.

## Features & Functionality

### Preprocessing (`preprocess.py`)

Applies the following cleaning steps:
- Remove URLs
- Remove Twitter mentions (@user) and hashtags
- Convert to lowercase
- Remove special characters and HTML entities
- Remove extra whitespace
- Tokenization
- Stop words removal

**Example:**
```python
from src.preprocess import preprocess_text

text = "@VirginAmerica Check out http://example.com #amazing service!"
cleaned = preprocess_text(text)
# Output: "check amazing service"
```

### Model Training (`train.py`)

- **Vectorizer**: TF-IDF with unigrams and bigrams (max 5000 features)
- **Algorithm**: Logistic Regression (multinomial, lbfgs solver)
- **Train-Test Split**: 80-20 split with stratification
- **Evaluation Metrics**:
  - Accuracy
  - Precision (weighted)
  - Recall (weighted)
  - F1-Score (weighted)
  - Confusion Matrix
  - Classification Report

**Output Example:**
```
Accuracy:  0.8234
Precision: 0.8156
Recall:    0.8234
F1-Score:  0.8186

              precision    recall  f1-score   support
    Negative       0.81      0.82      0.81      1234
     Neutral       0.79      0.76      0.77      2345
    Positive       0.85      0.87      0.86      3421
```

### Predictions (`predict.py`)

Make predictions with:
- **Text Input**: Raw or preprocessed text
- **Sentiment Output**: Positive, Negative, or Neutral
- **Confidence Score**: Probability of predicted class
- **Detailed Probabilities**: All class probabilities

**Example:**
```python
from src.predict import SentimentPredictor

predictor = SentimentPredictor(
    'models/sentiment_model.pkl',
    'models/vectorizer.pkl'
)

result = predictor.predict_single(
    "I love this airline!",
)

print(result)
# Output:
# ('Positive', 0.92)
```

## Model Performance

After training on the Twitter airline sentiment dataset, expect:

| Metric | Score |
|--------|-------|
| Accuracy | ~82-84% |
| Precision | ~81-83% |
| Recall | ~82-84% |
| F1-Score | ~81-83% |

Performance varies based on data split, hyperparameters, and preprocessing settings.

## Customization

### Adjust Preprocessing

Edit `preprocess.py` to customize text cleaning:
```python
# Skip stopword removal
cleaned_text = preprocess_text(text, remove_stop_words=False)
```

### Modify Model Parameters

Edit `train.py` to tune hyperparameters:
```python
# In train.py, modify SentimentModel.train() method:
self.model = LogisticRegression(
    max_iter=1500,
    C=0.5,
    solver='saga'
)
```

### Change TF-IDF Parameters

Edit `train.py` to adjust vectorizer:
```python
# In train.py, modify extract_features() method:
self.vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 3),
    min_df=1
)
```

## Dependencies

- pandas: Data manipulation and loading
- numpy: Numerical operations
- scikit-learn: Machine learning (Logistic Regression, TF-IDF, metrics)
- nltk: Natural Language Toolkit (tokenization, stopwords)
- matplotlib & seaborn: Visualization

Install all with:
```bash
pip install -r requirements.txt
```

## Usage Examples

### Example 1: Train and Evaluate

```bash
cd src
python train.py
```

### Example 2: Batch Predictions

```python
from src.predict import SentimentPredictor

predictor = SentimentPredictor(
    'models/sentiment_model.pkl',
    'models/vectorizer.pkl'
)

texts = [
    "Great experience!",
    "Worst flight ever",
    "Average service"
]

results = predictor.predict_batch(texts)

for label, prob in results:
    print(label, prob)
```

### Example 3: Custom Text Processing

```python
from src.preprocess import preprocess_text

tweets = [
    "Best airline! #flying",
    "Terrible experience @airlines #bad",
    "It was fine"
]

for tweet in tweets:
    cleaned = preprocess_text(tweet, remove_stop_words=True)
    print(f"Original:  {tweet}")
    print(f"Cleaned:   {cleaned}\n")
```

## Workflow Summary

```
1. Data Preparation
   └─> Load CSV file (twitter_sentiment.csv)
       └─> Check for missing values
           └─> Split into train/test sets (80/20)

2. Text Preprocessing
   └─> Remove URLs, mentions, hashtags
       └─> Lowercase
           └─> Remove special characters
               └─> Tokenize
                   └─> Remove stopwords

3. Feature Extraction
   └─> Apply TF-IDF Vectorizer
       └─> Convert text to numeric vectors
           └─> Create feature matrix

4. Model Training
   └─> Train Logistic Regression
       └─> Learn sentiment patterns

5. Evaluation
   └─> Calculate metrics (Accuracy, Precision, Recall, F1)
       └─> Generate confusion matrix plot
           └─> Save model and vectorizer

6. Prediction
   └─> Load trained model
       └─> Preprocess new text
           └─> Extract features
               └─> Predict sentiment
                   └─> Return result with confidence
```

## Troubleshooting

### Issue: "No module named 'nltk'"
Solution: Install nltk with `pip install nltk`

### Issue: "Model file not found"
Solution: Run `train.py` first to generate model files

### Issue: "CSV file not found"
Solution: Ensure `data/twitter_sentiment.csv` exists in the correct location

### Issue: Low accuracy
Solution: 
- Try different preprocessing options
- Adjust hyperparameters in `train.py`
- Ensure dataset has enough samples
- Try different algorithms (Naive Bayes, SVM, etc.)

## File Descriptions

| File | Purpose |
|------|---------|
| `preprocess.py` | Text cleaning and preprocessing functions |
| `train.py` | Model training and evaluation pipeline |
| `predict.py` | Inference and prediction functionality |
| `requirements.txt` | Project dependencies |
| `README.md` | Project documentation |

## Dataset Information

Twitter US Airline Sentiment Dataset contains:
- Samples: ~14,000+ tweets
- Classes: Negative, Neutral, Positive
- Features: Tweet text, sentiment label, airline name, and metadata

## Performance Tips

1. Data Quality: Clean, balanced dataset improves performance
2. Feature Engineering: Experiment with n-grams, TF-IDF parameters
3. Model Tuning: Adjust regularization (C parameter) and solver
4. Cross-Validation: Use k-fold for better estimates
5. Class Balancing: Handle imbalanced classes if needed

## Learning Resources

- [Scikit-learn Documentation](https://scikit-learn.org)
- [NLTK Documentation](https://www.nltk.org)
- [TF-IDF Explanation](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [Sentiment Analysis Guide](https://blog.google/products/search/understanding-sentiment-analysis/)

## License

This project is provided as-is for educational purposes.

## Checklist

- [x] Complete project structure
- [x] Text preprocessing pipeline
- [x] TF-IDF feature extraction
- [x] Logistic Regression model training
- [x] Comprehensive evaluation metrics
- [x] Confusion matrix visualization
- [x] Interactive prediction mode
- [x] Model persistence (save/load)
- [x] Detailed documentation
- [x] Usage examples

## Contributing

Feel free to extend this project with:
- Additional preprocessing techniques
- Different classification algorithms
- Advanced visualization
- API deployment
- Web interface

---


