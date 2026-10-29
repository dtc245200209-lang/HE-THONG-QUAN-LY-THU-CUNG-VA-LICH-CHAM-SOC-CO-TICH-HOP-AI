import psycopg2
try:
    conn = psycopg2.connect(host='localhost', user='petcare', password='petcare123', dbname='petcare')
    print('DB connected OK')
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = [r[0] for r in cur.fetchall()]
    print('Tables:', tables)
    
    if 'roles' in tables:
        cur.execute("SELECT name FROM roles")
        roles = [r[0] for r in cur.fetchall()]
        print('Roles:', roles)
    else:
        print('WARNING: roles table does NOT exist - need to run migrations!')
    
    if 'users' in tables:
        cur.execute("SELECT COUNT(*) FROM users")
        count = cur.fetchone()[0]
        print(f'User count: {count}')
    else:
        print('WARNING: users table does NOT exist!')
    
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
