import mysql.connector
import json
from tqdm import tqdm

# Database connection configuration
db_config = {
    'host': 'localhost',
    'user': 'root',  # replace with your MySQL username
    'password': 'aaa123',  # replace with your MySQL password
    'database': 'my_db'  # replace with your database name
}

# Connect to the database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# # Create table if not exists
# create_table_query = """
# CREATE TABLE IF NOT EXISTS reviews (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     rating FLOAT,
#     title TEXT,
#     text TEXT,
#     images JSON,
#     asin VARCHAR(255),
#     parent_asin VARCHAR(255),
#     user_id VARCHAR(255),
#     timestamp BIGINT,
#     helpful_vote INT,
#     verified_purchase BOOLEAN,
#     predicted_label INT,
#     confidence FLOAT,
#     reliability FLOAT,
#     FOREIGN KEY (parent_asin) REFERENCES products(parent_asin)
# )
# """
# cursor.execute(create_table_query)
# conn.commit()

# Function to insert data into the database
def insert_data(data):
    insert_query = """
    INSERT INTO reviews (
        rating, title, text, images, asin, parent_asin, user_id, timestamp, helpful_vote, 
        verified_purchase, predicted_label, confidence, reliability
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        data['rating'], data['title'], data['text'], json.dumps(data['images']), data['asin'], 
        data['parent_asin'], data['user_id'], data['timestamp'], data['helpful_vote'], 
        data['verified_purchase'], data['predicted_label'], data['confidence'], data['reliability']
    ))

# Read and insert data with progress bar
file_path = '../proccessedData/Amazon_Fashion_Reviews_Reliability.jsonl'
with open(file_path, 'r') as file:
    lines = file.readlines()

for line in tqdm(lines, desc='Inserting data'):
    data = json.loads(line.strip())
    insert_data(data)

# Commit and close the connection
conn.commit()
cursor.close()
conn.close()