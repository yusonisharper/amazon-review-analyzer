# Import necessary libraries
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, ArrayType
from pyspark.sql.functions import col, lit, rand, round
from pyspark.ml.feature import HashingTF, IDF, StringIndexer, Tokenizer
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
import json
import os

# Initialize Spark session
spark = SparkSession.builder.appName("RandomForestClassifier").getOrCreate()

# Load labeled data
labeled_data = spark.read.csv('file:/home/cs179g/datasets/fake_reviews_dataset.csv', header=True, inferSchema=True)
labeled_data = labeled_data.withColumn("label", col("label").cast("string"))

# Map label to numeric
indexer = StringIndexer(inputCol="label", outputCol="label_index")
labeled_data = indexer.fit(labeled_data).transform(labeled_data)

# Load unlabeled data
unlabeled_data = []
with open("/home/cs179g/datasets/Amazon_Fashion_Reviews.jsonl", "r") as file:
    line_count = 0
    for line in file:
        if line_count >= 100000:
            break
        json_obj = json.loads(line)
        unlabeled_data.append((json_obj.get('rating', ''),
                               json_obj.get('title', ''),
                               json_obj.get('text', ''),
                               json_obj.get('images', []),
                               json_obj.get('asin', ''),
                               json_obj.get('parent_asin', ''),
                               json_obj.get('user_id', ''),
                               json_obj.get('timestamp', ''),
                               json_obj.get('helpful_vote', ''),
                               json_obj.get('verified_purchase', '')))
        line_count += 1

# Define schema for unlabeled data
schema = StructType([
    StructField("rating", StringType(), True),
    StructField("title", StringType(), True),
    StructField("text", StringType(), True),
    StructField("images", ArrayType(StringType()), True),
    StructField("asin", StringType(), True),
    StructField("parent_asin", StringType(), True),
    StructField("user_id", StringType(), True),
    StructField("timestamp", StringType(), True),
    StructField("helpful_vote", StringType(), True),
    StructField("verified_purchase", StringType(), True)
])

# Create Spark DataFrame from unlabeled data with specific size
unlabeled_df = spark.createDataFrame(unlabeled_data, schema=schema)
sized_df = unlabeled_df.limit(100000)
sized_df = sized_df.withColumn("numeric", round(rand()))

# Pass in Spark DataFrame from labeled data
labeled_df = labeled_data

# Tokenize the sentences
tokenizer = Tokenizer(inputCol="text", outputCol="words")
wordsData_unlabeled = tokenizer.transform(sized_df)

# Define the feature extraction pipeline
hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures", numFeatures=5000)
idf = IDF(inputCol="rawFeatures", outputCol="features")

# Transform labeled data
tf_labeled = hashingTF.transform(wordsData_unlabeled)
tfidf_labeled = idf.fit(tf_labeled).transform(tf_labeled)

# Split data into training and testing sets
train_data, test_data = tfidf_labeled.randomSplit([0.8, 0.2], seed=42)

# Train the Random Forest classifier
rf = RandomForestClassifier(labelCol="numeric", featuresCol="features", numTrees=256, seed=42)
rf_model = rf.fit(train_data)

# Make predictions on the test data
test_predictions = rf_model.transform(test_data)

# Evaluate the model
evaluator = MulticlassClassificationEvaluator(labelCol="numeric", predictionCol="prediction", metricName="accuracy")
accuracy = evaluator.evaluate(test_predictions)
print(f"Test Accuracy = {accuracy}")

# Transform unlabeled data
tf_unlabeled = hashingTF.transform(wordsData_unlabeled)
tfidf_unlabeled = idf.fit(tf_unlabeled).transform(tf_unlabeled)

# Make predictions on the unlabeled data
unlabeled_predictions = rf_model.transform(tfidf_unlabeled)

# Find the confidence of the predictions
confidence = unlabeled_predictions.select("asin", "prediction", "probability").withColumn("confidence", lit(1) - col("probability")[0])
unlabeled_predictions = unlabeled_predictions.join(confidence, "asin")

# If the prediction is 1, set the confidence to the probability of the prediction, else set the confidence to 1 minus the probability of the prediction
unlabeled_predictions = unlabeled_predictions.withColumn("confidence", (col("prediction") == 1, col("probability")[1]).otherwise(col("confidence")))

# Convert predictions and confidence to a list of dictionaries
unlabeled_predictions_list = unlabeled_predictions.select("rating", "title", "text", "images", "asin", "parent_asin", "user_id", "timestamp", "helpful_vote", "verified_purchase", "prediction").collect()
output_predictions = [row.asDict() for row in unlabeled_predictions_list]

# Get the current directory
current_directory = os.getcwd()

# Define the file path for the output JSONL file
output_file_path = os.path.join(current_directory, "Amazon_Fashion_Reviews_Spark.jsonl")

# Write the predictions to the output JSONL file
with open(output_file_path, "w") as output_file:
    for review_info in output_predictions:
        output_file.write(json.dumps(review_info) + '\n')
# Stop the Spark session
spark.stop()