import tkinter as tk
from tkinter import ttk, messagebox
import dbtry as db

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Planta de Reciclaje 'Otra vez Sopa' - stock")
        self.geometry("800x500+200+100")

        db.crear_tabla_materiales()
        #self.hardcodeMaterials()

        botones_frame = ttk.Frame(self)
        botones_frame.pack(side="top", fill="x")

        tk.Button(botones_frame, text="Stock", height=1, command="").grid(row=2,column=4, padx=5, pady=5)
        tk.Button(botones_frame, text="Ingreso", height=1, command=self.ingresarMercaderia).grid(row=2,column=6, padx=5, pady=5)
        tk.Button(botones_frame, text="Venta", height=1, command="").grid(row=2,column=8, padx=5, pady=5)
        tk.Button(botones_frame, text="Crear material", height=1, command=self.crearMaterial).grid(row=2,column=10, padx=5, pady=5)
        self.BotonEliminar = ttk.Button(botones_frame, text="Eliminar material", state="disabled", command="")
        self.BotonEliminar.grid(row=2,column=12, padx=5, pady=5)


        self.table_frame = ttk.Frame(self)
        self.table_frame.pack(fill="both", expand=True, padx=10, pady=10)

        self.tree = ttk.Treeview(self.table_frame, columns=("id", "nombre", "cantidad", "medida"), show="headings", height=10)
        self.tree.heading("id", text="ID")
        self.tree.heading("nombre", text="Nombre")
        self.tree.heading("cantidad", text="Cantidad")
        self.tree.heading("medida", text="U. Medida")
        self.tree.column("id", width=8, anchor="center")
        self.tree.column("nombre", width=20, anchor="center")
        self.tree.column("cantidad", width=8, anchor="center")
        self.tree.column("medida", width=8, anchor="center")
        self.tree.pack(fill="both", padx=10, pady=(10, 10), expand=True)

        self.tree.bind("<<TreeviewSelect>>", self.seleccionarMaterial)

        try:
            self.listaMateriales = db.listar_materiales()
            for material in self.listaMateriales:
                self.tree.insert("","end", values=material)
            print("------------------------------")
            print("Materiales mostrados con exito")
            print("------------------------------")
        except Exception as exp:
            messagebox.showinfo("Error", f"No se pudo mostrar el stock: \n {exp}")
            print("------------------------------")
            print("Muestra de stock fallida")
            print("------------------------------")
    
    def seleccionarMaterial(self, event):
        seleccion = self.tree.selection()

        item = self.tree.item(seleccion)
        valores = item["values"]
        self.materialSeleccionado = valores[0]
        if self.materialSeleccionado:
            self.BotonEliminar.config(state="normal")       

    def clean(self):
        for widget in self.table_frame.winfo_children():
            widget.destroy()

    def ingresarMercaderia(self):
        self.clean()

        ttk.Label(self.table_frame, text="Ingreso de Stock").pack(pady=10)
        frm_form = ttk.LabelFrame(self.table_frame, text="Ingreso de Stock", padding=10)
        frm_form.pack(fill="x", padx=10, pady=10)

        tk.Label(frm_form, text="Peso/unidades: ").grid(row=0, column=0, padx=5, pady=5)
        self.cantidad_var = tk.DoubleVar()
        self.entry_cantidad = tk.Entry(frm_form, textvariable=self.cantidad_var)
        self.entry_cantidad.grid(row=0, column=1, padx=5, pady=5)

        listaNombres = []
        for material in self.listaMateriales: 
            listaNombres.append(material[1])
        text_nombres = tk.StringVar(self)
        text_nombres.set("Elija material")
        self.toggle_menu = tk.OptionMenu(frm_form, text_nombres, *listaNombres)
        self.toggle_menu.grid(row=0, column=2, padx=5, pady=5)  

        cantidad = self.entry_cantidad.get()
        nombreMat = text_nombres.get()

        if cantidad == "" or nombreMat == "Elija material":
            messagebox.showwarning("Atención", "Completá todos los campos.")
        else: 
            try:
                idMaterial = -1
                for material in self.listaMateriales:
                    if material[1] == nombreMat:
                        idMaterial = material[0]
                if idMaterial != -1:
                    db.actualizar_datos(idMaterial, cantidad)
                print("------------------------------")
                print("Stock ingresado con exito")
                print("------------------------------")
            except Exception as exp:
                messagebox.showinfo("Error", f"No se pudo guardar el cambio: \n {exp}")
                print("------------------------------")
                print("Correccion de stock fallida")
                print("------------------------------") 

    def vender(self):
        self.clean()
    
    def crearMaterial(self):
        self.clean()

        ttk.Label(self.table_frame, text="Nuevo Material").pack(pady=10)
        frm_form = ttk.LabelFrame(self.table_frame, text="Nuevo Material", padding=10)
        frm_form.pack(fill="x", padx=10, pady=10)

        tk.Label(frm_form, text="Nombre: ").grid(row=0, column=0, padx=5, pady=5)
        self.entry_nombre = tk.Entry(frm_form)
        self.entry_nombre.grid(row=0, column=1, padx=5, pady=5)
        
        listaMedidas = ["Unid", "Kg", "m3"] 
        text_medida = tk.StringVar(self)
        text_medida.set("Elija medida")
        self.toggle_menu = tk.OptionMenu(frm_form, text_medida, *listaMedidas)
        self.toggle_menu.grid(row=0, column=2, padx=5, pady=5)     

        nombre = self.entry_nombre.get()
        medida = text_medida.get()

        if nombre == "" or medida == "Elija medida":
            messagebox.showwarning("Atención", "Completá todos los campos.")
        else: 
            try:
                db.guardar_material(nombre, 0, medida)
                print("------------------------------")
                print("Material creado con exito")
                print("------------------------------")
            except Exception as exp:
                messagebox.showinfo("Error", f"No se pudo crear el item: \n {exp}")
                print("------------------------------")
                print("Creacion de material fallida")
                print("------------------------------") 

    def eliminarMaterial(self):
        self.clean()

    def hardcodeMaterials(self):          #llamada una sola vez 
        #Vidrio, Hierro, Aluminio, Cobre, Bronce, Cartón, Papel Blanco, Tapas de plástico, Aceite de girasol, Baterías de vehículos 
        db.guardar_material("Vidrio", 6, "Kg")
        db.guardar_material("Hierro", 3, "Kg")
        db.guardar_material("Aluminio", 4, "Kg")
        db.guardar_material("Cobre", 1, "Kg")
        db.guardar_material("Bronce", 5, "Kg")
        db.guardar_material("Carton", 15, "Kg")
        db.guardar_material("Papel blanco", 46, "Kg")
        db.guardar_material("Tapas", 24, "Kg")
        db.guardar_material("Aceite Girasol", 2.5, "m3")
        db.guardar_material("Bateria Vehiculo", 4, "Unid")


        #success = db.guardar_material("Vidrio", 1, "Kg")
        #if not success:
        #    messagebox.showwarning("Duplicado", f"El material '{name}' ya existe en el stock.")

if __name__ == "__main__":
    app = App()
    app.mainloop()