import json
import mysql.connector


config = {
    'user': 'root',                       
    'password': 'aaa123',    
    'host': 'localhost',                
    'database': 'my_db',                 
    'raise_on_warnings': True
}

conn = mysql.connector.connect(**config)
cursor = conn.cursor()


file_path = '/home/cs179g/proccessedData/rating5_keywords/rating_5_keywords.json'
with open(file_path, 'r') as file:
    for line in file:
        data = json.loads(line)
        word = data['word']
        count = data['count']
        
        
        cursor.execute('INSERT INTO rating_5_keywords (word, count) VALUES (%s, %s)', (word, count))


conn.commit()


cursor.close()
conn.close()
