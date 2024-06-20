# ------------Analyze the most important features-----------------------

from pyspark.sql import SparkSession
from pyspark.sql.functions import explode, split, lower, regexp_extract, col

# Create a SparkSession
spark = SparkSession.builder \
    .appName("JSONL Reader") \
    .getOrCreate()
# read file
df = spark.read.json("datasets/Amazon_Fashion_Reviews.jsonl")
df.printSchema()

# group by rating
dfs = []
for i in range(1, 6):
   dfs.append(df.filter(df.rating == i/1.0))

# get text of each rating
text_dfs = []
for i in range(0, 5):
   text_dfs.append(dfs[i].select("text"))

# distinct word count
word_counts_dfs = []
for i in range(0, 5):
   words_df = text_dfs[i] \
   .select(explode(split(lower(text_dfs[i].text),"\\W+")) \
   .alias("word"))
   words_df = words_df.filter(words_df.word != '')
   word_counts_dfs.append(words_df.groupBy("word").count())

#unrelate word to remove
unrelated_words = [
"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
]

# final proccess
dfs_final = []
for i in range(0, 5):
   # remove unrelate keywords
   word_counts_filtered_df = word_counts_dfs[i] \
   .filter(~word_counts_dfs[i].word.isin(unrelated_words))
   # arrange the count in descending order
   dfs_final.append(word_counts_filtered_df \
   .orderBy("count", ascending=False))

# dfs_final[0].show()

#store into file
# for i in range(0, 5):
#    dfs_final[i].write.json(rf"rating{i+1}_keywords")

#-----------------Analyze two keywords base on keyword------------------------

twoWord_counts_dfs = []
for i in range(0, 5):
   first_100_elements = dfs_final[i].select("word").take(1000)
   keyword = '|'.join([row["word"] for row in first_100_elements])
   # Construct the pattern dynamically to capture the phrase
   pattern = rf"(\w+\s+({keyword}))"
   # Apply regexp_extract to extract the phrase containing the keyword
   df_phrase = text_dfs[i].withColumn("phrase", lower(regexp_extract(col("text"), pattern, 1)))
   df_phrase = df_phrase.filter(df_phrase.phrase != '')
   twoWord_counts_dfs.append(df_phrase.groupBy("phrase").count().orderBy("count", ascending=False))
#store into file
# for i in range(0, 5):
#    twoWord_counts_dfs[i].write.json(rf"rating{i+1}_twoWordsKeywords")

#--------------------measure execution time and different spark worker------------------------

from pyspark.sql import SparkSession
import time
import matplotlib.pyplot as plt

def create_spark_session(num_executors):
    return SparkSession.builder \
        .appName("JSONL Reader") \
        .config("spark.executor.instances", num_executors) \
        .getOrCreate()

def measure_execution_time(num_executors):
    spark = create_spark_session(num_executors)
    
    start_time = time.time()
    
    # Read file
    df = spark.read.json("datasets/Amazon_Fashion_Reviews.jsonl")
    
    # Filter by ratings
    dfs = [df.filter(df.rating == i/1.0) for i in range(1, 6)]
    
    # Select text column and tokenize
    text_dfs = [df.select("text") for df in dfs]
    word_counts_dfs = []
    
    for text_df in text_dfs:
        words_df = text_df.select(explode(split(lower(text_df.text), "\\W+")).alias("word"))
        words_df = words_df.filter(words_df.word != '')
        word_counts_dfs.append(words_df.groupBy("word").count())
    
    # Filter out unrelated words
    unrelated_words = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]
    
    dfs_final = []
    for word_counts_df in word_counts_dfs:
        word_counts_filtered_df = word_counts_df.filter(~word_counts_df.word.isin(unrelated_words))
        dfs_final.append(word_counts_filtered_df.orderBy("count", ascending=False))
    
    end_time = time.time()
    
    execution_time = end_time - start_time
    spark.stop()
    
    return execution_time

# Measure execution times
num_executors_list = [1, 2]
execution_times = []

for num_executors in num_executors_list:
    execution_time = measure_execution_time(num_executors)
    execution_times.append(execution_time)
    print(f"Execution time with {num_executors} executors: {execution_time} seconds")

# Plot results
plt.figure(figsize=(10, 6))
plt.plot(num_executors_list, execution_times, marker='o')
plt.xlabel("Number of Executors")
plt.ylabel("Execution Time (seconds)")
plt.title("Execution Time vs Number of Executors")
plt.grid(True)
plt.show()