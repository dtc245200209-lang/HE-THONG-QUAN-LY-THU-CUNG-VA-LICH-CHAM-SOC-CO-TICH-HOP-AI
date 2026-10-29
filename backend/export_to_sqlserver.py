import json
import os
import sys
from datetime import datetime, date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from sqlalchemy import create_engine, MetaData, inspect
from app.core.config import settings

CORE_TABLES = [
    'roles',
    'users',
    'user_roles',
    'pets',
    'qr_codes',
    'services',
    'appointments',
    'medical_records',
    'care_sessions',
    'products',
    'payments',
    'notifications'
]

def map_type(col_type_str):
    s = str(col_type_str).upper()
    if 'UUID' in s:
        return 'NVARCHAR(50)'
    elif 'BOOLEAN' in s:
        return 'BIT'
    elif 'JSON' in s:
        return 'NVARCHAR(MAX)'
    elif 'TEXT' in s:
        return 'NVARCHAR(MAX)'
    elif 'VARCHAR' in s:
        if '(' in s:
            return s.replace('VARCHAR', 'NVARCHAR')
        return 'NVARCHAR(255)'
    elif 'INTEGER' in s or 'INT' in s:
        return 'INT'
    elif 'FLOAT' in s or 'DOUBLE' in s:
        return 'FLOAT'
    elif 'NUMERIC' in s or 'DECIMAL' in s:
        return 'DECIMAL(18,2)'
    elif 'DATE' in s and 'TIME' not in s:
        return 'DATE'
    elif 'TIME' in s:
        return 'DATETIME2'
    else:
        return 'NVARCHAR(MAX)'

def format_val(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return '1' if val else '0'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (datetime, date)):
        return f"'{val.isoformat()}'"
    if isinstance(val, (dict, list)):
        dumped = json.dumps(val, ensure_ascii=False).replace("'", "''")
        return f"N'{dumped}'"
    s_val = str(val).replace("'", "''")
    return f"N'{s_val}'"

def generate_sql_server_dump(output_path):
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    inspector = inspect(engine)
    all_existing_tables = inspector.get_table_names()

    # Filter to 12 core tables in dependency order
    table_names = [t for t in CORE_TABLES if t in all_existing_tables]

    lines = []
    lines.append("-- ==============================================================")
    lines.append("-- PetCare AI - Optimized 12 Core Tables for Microsoft SQL Server")
    lines.append(f"-- Last Synchronized: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("-- ==============================================================")
    lines.append("")
    lines.append("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PetCare')")
    lines.append("BEGIN")
    lines.append("    CREATE DATABASE PetCare COLLATE Vietnamese_CI_AS;")
    lines.append("END")
    lines.append("GO")
    lines.append("")
    lines.append("USE PetCare;")
    lines.append("GO")
    lines.append("")

    # Drop ALL existing tables in database to clean up redundant micro-tables
    lines.append("-- Drop redundant tables and clean up foreign keys")
    lines.append("EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';")
    lines.append("GO")
    lines.append("")

    # Clean up all user tables in dbo
    lines.append("DECLARE @sql NVARCHAR(MAX) = N'';")
    lines.append("SELECT @sql += N'DROP TABLE IF EXISTS dbo.[' + name + N'];' ")
    lines.append("FROM sys.tables WHERE is_ms_shipped = 0;")
    lines.append("EXEC sp_executesql @sql;")
    lines.append("GO")
    lines.append("")

    # Create 12 core tables
    for tbl_name in table_names:
        columns = inspector.get_columns(tbl_name)
        pk_constraint = inspector.get_pk_constraint(tbl_name)
        pk_cols = pk_constraint.get('constrained_columns', []) if pk_constraint else []

        col_defs = []
        for col in columns:
            c_name = col['name']
            c_type = map_type(col['type'])
            nullable = "NULL" if col.get('nullable', True) else "NOT NULL"
            col_defs.append(f"    [{c_name}] {c_type} {nullable}")

        if pk_cols:
            pk_str = ", ".join([f"[{c}]" for c in pk_cols])
            col_defs.append(f"    CONSTRAINT [PK_{tbl_name}] PRIMARY KEY ({pk_str})")

        lines.append(f"CREATE TABLE dbo.[{tbl_name}] (")
        lines.append(",\n".join(col_defs))
        lines.append(");")
        lines.append("GO")
        lines.append("")

    # Insert live data for the 12 core tables
    conn = engine.connect()
    for tbl_name in table_names:
        table_obj = metadata.tables[tbl_name]
        results = conn.execute(table_obj.select()).fetchall()
        if not results:
            continue

        columns = [c['name'] for c in inspector.get_columns(tbl_name)]
        cols_str = ", ".join([f"[{c}]" for c in columns])

        lines.append(f"-- Core Table: {tbl_name} ({len(results)} rows)")
        for row in results:
            row_dict = row._mapping
            vals = [format_val(row_dict[c]) for c in columns]
            vals_str = ", ".join(vals)
            lines.append(f"INSERT INTO dbo.[{tbl_name}] ({cols_str}) VALUES ({vals_str});")
        lines.append("GO")
        lines.append("")

    conn.close()

    lines.append("PRINT '==============================================================';")
    lines.append(f"PRINT ' Database PetCare đã tối ưu còn {len(table_names)} bảng cốt lõi thành công! ';")
    lines.append("PRINT '==============================================================';")
    lines.append("GO")

    with open(output_path, 'w', encoding='utf-8-sig') as f:
        f.write("\n".join(lines))

    print(f"Exported optimized {len(table_names)} core tables to: {output_path}")

if __name__ == '__main__':
    out_file = '/app/PetCare_SQLServer.sql'
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    generate_sql_server_dump(out_file)
