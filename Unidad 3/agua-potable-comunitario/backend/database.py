import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",    
        user="postgres",        
        password="1234",            
        port="5432"
    )
    return conn