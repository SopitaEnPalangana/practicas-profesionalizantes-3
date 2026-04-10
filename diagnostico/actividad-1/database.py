import sqlite3

def crear_tabla_materiales():
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materiales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            cantidad DOUBLE,
            medida TEXT NOT NULL
        )""")
    conn.commit()
    conn.close()

def guardar_material(nombre, cantidad, medida):
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO materiales (nombre, cantidad, medida) VALUES (?, ?, ?)",(nombre, cantidad, medida))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def listar_materiales():
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, cantidad, medida FROM materiales")
    datos = cursor.fetchall()
    conn.close()
    return datos

def actualizar_datos(id, cantidad):
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE materiales
        SET cantidad = ?
        WHERE id = ?
        """, (cantidad, id))
    conn.commit()
    conn.close()

def eliminar_material(id):
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM materiales WHERE id = ?", (id,))
    conn.commit()
    conn.close()

def eliminar_tabla_materiales():
    conn = sqlite3.connect("material.db")
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS materiales")
    conn.commit()
    conn.close()