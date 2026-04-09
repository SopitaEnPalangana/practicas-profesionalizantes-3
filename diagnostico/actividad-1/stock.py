import tkinter as tk
import database as db
from tkinter import ttk, messagebox

class StockTab(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        botones_frame = ttk.Frame(self)
        botones_frame.pack(side="top", fill="x")

        tk.Label(botones_frame, text="Material: ", font=("Calibri",14), height=2).grid(row=2, column=0, padx=5, pady=5)
        self.entry_material = tk.Entry(botones_frame)
        self.entry_material.grid(row=2, column=2, columnspan=1, padx=5, pady=5)
        tk.Button(botones_frame, text="Buscar", font=("Calibri", 12), height=1, command="").grid(row=2, column=6, padx=5, pady=5)

        self.contenido_frame = ttk.Frame(self)
        self.contenido_frame.pack(fill="both", expand=True, padx=10, pady=10)
        db.crear_tabla_materiales()

        self.verStock()

    def limpiar(self):
        for widget in self.contenido_frame.winfo_children():
            widget.destroy()

    def verStock(self):
        self.limpiar()
        self.contenido_frame = ttk.Frame(self)
        self.contenido_frame.pack(fill="both", expand=True, padx=10, pady=10)

        self.tree = ttk.Treeview(self.contenido_frame, columns=("nombre", "cantidad", "unidad"), show="headings", height=10)
        self.tree.heading("nombre", text="Material")
        self.tree.column("nombre", width=8, anchor="center")
        self.tree.heading("cantidad", text="Stock")
        self.tree.column("cantidad", width=8, anchor="center")
        self.tree.heading("unidad", text="Unidad de Medida")
        self.tree.column("unidad", width=8, anchor="center")

        try:
            listaMateriales = db.ver_materiales()
            for material in listaMateriales:
                self.tree.insert("","end", values=material)
            print("------------------------------")
            print("Materiales mostrados con exito")
            print("------------------------------")
        except Exception as exp:
            messagebox.showinfo("Error", f"No se pudo mostrar el stock: \n {exp}")
            print("------------------------------")
            print("Muestra de stock fallida")
            print("------------------------------")

class GestionTab(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)

        botones_frame = ttk.Frame(self)
        botones_frame.pack(side="top", fill="x")
 
        tk.Button(botones_frame, text="Ingresar mercaderia", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(botones_frame, text="Registrar venta", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        tk.Button(botones_frame, text="Crear nuevo material", font=("Calibri", 12), height=1, command=self.crear_nuevo).pack(side="left", padx=10, pady=10)
        tk.Button(botones_frame, text="Eliminar material", font=("Calibri", 12), height=1, command="").pack(side="left", padx=10, pady=10)
        
        self.contenido_frame = ttk.Frame(self)
        self.contenido_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
    def limpiar(self):
        for widget in self.contenido_frame.winfo_children():
            widget.destroy()

    def crear_nuevo(self):
        self.limpiar()

        ttk.Label(self.contenido_frame, text="Nuevo Material").pack(pady=10)
        frm_from = ttk.LabelFrame(self.contenido_frame, text="Nuevo Material", padding=10)
        frm_from.pack(fill="x", padx=10, pady=10)

        tk.Label(frm_from, text="Nombre: ").grid(row=0, column=0, padx=5, pady=5)
        self.entry_nombre = tk.Entry(frm_from)
        self.entry_nombre.grid(row=0, column=1, padx=5, pady=5)
        
        listaMedidas = ["Unid", "Kg", "m3"] 
        text_inside = tk.StringVar(self)
        text_inside.set("Elija medida")
        toggle_menu = tk.OptionMenu(self, text_inside, *listaMedidas)
        toggle_menu.grid(row=1, column=2, padx=5, pady=5)

    #def comprar(self):

    #def vender(self):

    #def eliminar(self):

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Planta de Reciclaje 'Otra Vez Sopa' - Stock")
        self.geometry("800x500+200+100")

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True)

        self.tabs = {}
        self.addTab("Ver Stock", StockTab)
        self.addTab("Gestion Materiales", GestionTab)

    def addTab(self, nombre, ClaseTab):
        frame = ClaseTab(self.notebook, controller=self)
        self.notebook.add(frame, text=nombre)
        self.tabs[nombre] = frame

    def selectTab(self, nombre):
        index = list(self.tabs.keys()).index(nombre)
        self.notebook.select(index)


if __name__ == "__main__":
    app = App()
    app.mainloop()  