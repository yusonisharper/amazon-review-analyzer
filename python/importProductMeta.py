import mysql.connector
import jsonlines
import json
from tqdm import tqdm

# MySQL database connection configuration
db_config = {
    'host': 'localhost',
    'user': 'root',  # replace with your MySQL username
    'password': 'aaa123',  # replace with your MySQL password
    'database': 'my_db'  # replace with your database name
}

# Connect to the MySQL database
db_connection = mysql.connector.connect(**db_config)
cursor = db_connection.cursor()

# Path to the JSONL file
jsonl_file_path = '../datasets/Amazon_Fashion_Products_meta.jsonl'  # replace with the path to your JSONL file

# Function to get the total number of lines in the JSONL file
def get_total_lines(file_path):
    with open(file_path, 'r') as file:
        return sum(1 for _ in file)

# Function to insert JSONL data into the database
def insert_jsonl_data(file_path):
    total_lines = get_total_lines(file_path)
    with jsonlines.open(file_path) as reader, tqdm(total=total_lines, desc="Inserting rows", unit="row") as pbar:
        for obj in reader:
            query = """
            INSERT INTO products 
            (main_category, title, average_rating, rating_number, price, store, parent_asin, details, images) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                obj.get('main_category'),
                obj.get('title'),
                obj.get('average_rating'),
                obj.get('rating_number'),
                obj.get('price'),
                obj.get('store'),
                obj.get('parent_asin'),
                json.dumps(obj.get('details')),
                json.dumps(obj.get('images'))
            )
            cursor.execute(query, values)
            db_connection.commit()
            pbar.update(1)

# Insert data from JSONL file
insert_jsonl_data(jsonl_file_path)

# Close the database connection
cursor.close()
db_connection.close()