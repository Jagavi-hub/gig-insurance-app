# Machine Learning Evaluation Metrics: Precision, Recall, F1, and Trade-offs

## 1. Classification Confusion Matrix
For binary classification tasks where instances are labeled positive (1) or negative (0), predictions fall into four quadrants:
- **True Positive (TP)**: Correctly predicted positive instances.
- **True Negative (TN)**: Correctly predicted negative instances.
- **False Positive (FP, Type I Error)**: Negative instances mistakenly predicted as positive.
- **False Negative (FN, Type II Error)**: Positive instances mistakenly predicted as negative.

## 2. Core Metrics Defined

### Precision
Precision measures the correctness of positive predictions:
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$
- **Intuition**: Out of all samples the model flagged as positive, what percentage was truly positive?
- **High Priority Scenarios**: Where false alarms carry severe negative costs. Examples include email spam filtering (flagging a critical client communication as spam is disruptive), automated YouTube content takedowns, or high-cost trading execution where false signals waste capital.

### Recall (Sensitivity / True Positive Rate)
Recall measures the model's ability to find all actual positive samples:
$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$
- **Intuition**: Out of all actual positive samples that exist in reality, what fraction did the model successfully identify?
- **High Priority Scenarios**: Where missing a positive instance carries catastrophic risk. Examples include oncological diagnosis / tumor detection (a false negative delays life-saving chemotherapy), airport security screening, and fraud detection flags before money transfer completion.

### F1-Score (Harmonic Mean)
$$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2\text{TP}}{2\text{TP} + \text{FP} + \text{FN}}$$
The harmonic mean is chosen because it severely penalizes extreme imbalances between Precision and Recall. An arithmetic mean would give an inflated 0.50 score if precision is 1.0 and recall is 0.0, whereas the harmonic mean drops to 0.

### Accuracy Paradox in Imbalanced Datasets
Accuracy is $\frac{\text{TP} + \text{TN}}{\text{Total}}$. In an imbalanced dataset where 99% of samples are negative (e.g., rare fraud occurring in 1 out of 100 transactions), a naive dummy classifier predicting all negatives achieves 99% accuracy while achieving 0.0 recall. Therefore, accuracy is deceptive and inappropriate for skewed distributions.

## 3. Threshold Tuning and the Precision-Recall Trade-off
Classification algorithms output a probability $P(y=1|x)$. The default classification decision boundary is 0.50.
- Increasing the decision threshold (e.g., to 0.85) makes the classifier more conservative: fewer items are declared positive, decreasing False Positives and driving Precision up, but increasing False Negatives and driving Recall down.
- Decreasing the threshold (e.g., to 0.15) increases sensitivity: more positive predictions are made, capturing more actual positives (higher Recall) at the cost of more false alarms (lower Precision).
- The **Precision-Recall Curve** plots precision versus recall across all possible decision thresholds, and PR-AUC provides an aggregate metric superior to ROC-AUC when class distributions are heavily imbalanced.
