import sqlite3

def crear_tabla_materiales():
    conn = sqlite3.connect("materiales.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materiales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cantidad DOUBLE,
            medida TEXT NOT NULL
        )""")
    conn.commit()
    conn.close()

def guardar_material(nombre, cantidad, medida):
    conn = sqlite3.connect("materiales.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO materiales (nombre, cantidad, medida) VALUES (?, ?, ?)",(nombre, cantidad, medida))
    conn.commit()
    conn.close()

def ver_materiales():
    conn = sqlite3.connect("materiales.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, cantidad, medida FROM materiales")
    datos = cursor.fetchall()
    conn.close()
    return datos

def eliminar_material(id):
    conn = sqlite3.connect("materiales.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM materiales WHERE id = ?", (id,))
    conn.commit()
    conn.close()