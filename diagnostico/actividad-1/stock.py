import tkinter as tk
import db as db
from tkinter import ttk, messagebox

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Planta de Reciclaje 'Otra Vez Sopa' - Stock")
        self.geometry("800x500+200+100")

        barra = tk.Frame(self)
        barra.pack(side="top", fill="x")

        tk.Button(barra, text="Ver lista de stock", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(barra, text="Ver movimientos", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        
        #a repartir for later
        tk.Button(barra, text="Ingresar mercaderia", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(barra, text="Registrar venta", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(barra, text="Crear nuevo material", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(barra, text="Eliminar material", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)

        self.contenedor = tk.Frame(self)
        self.searchform = tk.Frame(self)

        #db.create_table()

    def verStock(self):
        self.contenedor.pack_forget()
        self.searchform.pack_forget()
        self.contenedor = tk.Frame(self)    #check cleaning function



if __name__ == "__main__":
    app = App()
    app.mainloop()