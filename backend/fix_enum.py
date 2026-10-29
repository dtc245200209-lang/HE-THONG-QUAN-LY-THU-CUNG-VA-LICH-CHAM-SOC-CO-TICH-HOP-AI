import psycopg2

def fix_enum():
    conn = psycopg2.connect(host='localhost', user='petcare', password='petcare123', dbname='petcare')
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("ALTER TYPE appointmentstatus ADD VALUE 'CHECKED_IN' AFTER 'CONFIRMED'")
        print("Added CHECKED_IN to appointmentstatus")
    except Exception as e:
        print("Error or already added:", e)
    finally:
        conn.close()

if __name__ == '__main__':
    fix_enum()
