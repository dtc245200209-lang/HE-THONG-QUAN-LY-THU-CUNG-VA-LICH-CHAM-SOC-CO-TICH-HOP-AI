import psycopg2

def list_enums():
    conn = psycopg2.connect(host='localhost', user='petcare', password='petcare123', dbname='petcare')
    cur = conn.cursor()
    cur.execute("""
    SELECT t.typname, e.enumlabel 
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
    """)
    rows = cur.fetchall()
    
    enums = {}
    for typname, enumlabel in rows:
        if typname not in enums:
            enums[typname] = []
        enums[typname].append(enumlabel)
        
    for name, values in enums.items():
        print(f"{name}: {', '.join(values)}")
        
    conn.close()

if __name__ == '__main__':
    list_enums()
