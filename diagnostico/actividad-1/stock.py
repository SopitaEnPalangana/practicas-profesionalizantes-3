import tkinter as tk
from tkinter import ttk, messagebox
import database as db

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Planta de Reciclaje 'Otra vez Sopa' - stock")
        self.geometry("800x500+200+100")

        db.crear_tabla_materiales()
        #self.hardcodeMaterials()

        botones_frame = ttk.Frame(self)
        botones_frame.pack(side="top", fill="x")

        tk.Button(botones_frame, text="Stock", height=1, command=self.verStock).grid(row=2,column=4, padx=5, pady=5)
        tk.Button(botones_frame, text="Ingreso", height=1, command=self.ingresarMercaderia).grid(row=2,column=6, padx=5, pady=5)
        tk.Button(botones_frame, text="Venta", height=1, command=self.vender).grid(row=2,column=8, padx=5, pady=5)
        tk.Button(botones_frame, text="Crear material", height=1, command=self.crearMaterial).grid(row=2,column=10, padx=5, pady=5)
        self.BotonEliminar = ttk.Button(botones_frame, text="Eliminar material", state="disabled", command=self.eliminarMaterial)
        self.BotonEliminar.grid(row=2,column=12, padx=5, pady=5)

        self.table_frame = ttk.Frame(self)
        self.table_frame.pack(fill="both", expand=True, padx=10, pady=10)
        self.verStock()

    def verStock(self):
        self.clean()

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
            self.listaDatos = db.listar_materiales()
            self.listaMateriales = []
            for material in self.listaDatos:
                self.tree.insert("","end", values=material)
                newmat = self.Material(material[0], material[1], material[2], material[3])
                self.listaMateriales.append(newmat)
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
        self.materialSeleccionado = self.Material(valores[0], valores[1], valores[2], valores[3])
        if self.materialSeleccionado:
            self.BotonEliminar.config(state="normal")       

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
            listaNombres.append(material.nombre)
        self.text_nombres = tk.StringVar(self)
        self.text_nombres.set("Elija material")
        self.toggle_menu = tk.OptionMenu(frm_form, self.text_nombres, *listaNombres)
        self.toggle_menu.grid(row=0, column=2, padx=5, pady=5)  

        tk.Button(frm_form, text="Cargar", height=1, command=self.cargarMercaderia).grid(row=2,column=4, padx=5, pady=5)

    def cargarMercaderia(self):
        cantVar = self.entry_cantidad.get() 
        cantidad = float(cantVar)
        nombreMat = self.text_nombres.get()

        if cantidad == "" or nombreMat == "Elija material":
            messagebox.showwarning("Atención", "Completá todos los campos.")
        else: 
            try:
                stockActual = 0
                for material in self.listaMateriales:
                    if material.nombre == nombreMat:
                        materialCargado = self.Material(material.dbID, material.nombre, material.cantidad, material.unidad)
                        stockActual = material.cantidad
                if materialCargado:
                    cantidad += stockActual
                    db.actualizar_datos(materialCargado.dbID, cantidad)
                messagebox.showinfo("Success!", f"Stock actualizado: \n {materialCargado.nombre} -  {cantidad} {materialCargado.unidad}")
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

        ttk.Label(self.table_frame, text="Venta de Materiales").pack(pady=10)
        frm_form = ttk.LabelFrame(self.table_frame, text="Venta", padding=10)
        frm_form.pack(fill="x", padx=10, pady=10)

        tk.Label(frm_form, text="Peso/unidades: ").grid(row=0, column=0, padx=5, pady=5)
        self.ventaCantidad_var = tk.DoubleVar()
        self.entry_ventaCantidad = tk.Entry(frm_form, textvariable=self.ventaCantidad_var)
        self.entry_ventaCantidad.grid(row=0, column=1, padx=5, pady=5)

        listaNombres = []
        for material in self.listaMateriales: 
            listaNombres.append(material.nombre)
        self.text_ventaNombres = tk.StringVar(self)
        self.text_ventaNombres.set("Elija material")
        self.toggle_menu = tk.OptionMenu(frm_form, self.text_ventaNombres, *listaNombres)
        self.toggle_menu.grid(row=0, column=2, padx=5, pady=5)  

        tk.Button(frm_form, text="Vender", height=1, command=self.restarMercaderia).grid(row=2,column=4, padx=5, pady=5)

    def restarMercaderia(self):
        cantVar = self.entry_ventaCantidad.get() 
        cantidad = float(cantVar)
        nombreMat = self.text_ventaNombres.get()

        if cantidad == "" or nombreMat == "Elija material":
            messagebox.showwarning("Atención", "Completá todos los campos.")
        else: 
            stockActual = 0
            for material in self.listaMateriales:
                if material.nombre == nombreMat:
                    materialCargado = self.Material(material.dbID, material.nombre, material.cantidad, material.unidad)
                    stockActual = material.cantidad
            if materialCargado:
                venta = stockActual-cantidad
                if venta < 0:
                    messagebox.showinfo("Error", f"No hay suficiente stock!: \n {materialCargado.nombre} - {stockActual}")
                else:
                    try:
                        db.actualizar_datos(materialCargado.dbID, venta)
                        messagebox.showinfo("Success!", f"Stock actualizado: \n {materialCargado.nombre} -  {cantidad} {materialCargado.unidad}")
                        print("------------------------------")
                        print("Venta registrada con exito")
                        print("------------------------------")
                    except Exception as exp:
                        messagebox.showinfo("Error", f"No se pudo guardar el cambio: \n {exp}")
                        print("------------------------------")
                        print("Correccion de stock fallida")
                        print("------------------------------") 
    
    def crearMaterial(self):
        self.clean()

        ttk.Label(self.table_frame, text="Nuevo Material").pack(pady=10)
        frm_form = ttk.LabelFrame(self.table_frame, text="Nuevo Material", padding=10)
        frm_form.pack(fill="x", padx=10, pady=10)

        tk.Label(frm_form, text="Nombre: ").grid(row=0, column=0, padx=5, pady=5)
        self.entry_nombre = tk.Entry(frm_form)
        self.entry_nombre.grid(row=0, column=1, padx=5, pady=5)
        
        listaMedidas = ["Unid", "Kg", "m3"] 
        self.text_medida = tk.StringVar(self)
        self.text_medida.set("Elija medida")
        self.toggle_menu = tk.OptionMenu(frm_form, self.text_medida, *listaMedidas)
        self.toggle_menu.grid(row=0, column=2, padx=5, pady=5) 

        tk.Button(frm_form, text="Crear Material", height=1, command=self.crearNuevo).grid(row=2,column=4, padx=5, pady=5)

    def crearNuevo(self):
        nombre = self.entry_nombre.get()
        medida = self.text_medida.get()

        if nombre == "" or medida == "Elija medida":
            messagebox.showwarning("Atención", "Completá todos los campos.")
        else: 
            try:
                db.guardar_material(nombre, 0, medida)
                messagebox.showinfo("Success!", f"Material creado: \n {nombre}")
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

        try:
            db.eliminar_material(self.materialSeleccionado.dbID)
            messagebox.showinfo("Success!", f"Material eliminado: \n {self.materialSeleccionado.nombre}")
            print("------------------------------")
            print("Material eliminado con exito")
            print(f"Datos del material: {self.materialSeleccionado.nombre} - {self.materialSeleccionado.cantidad}")
            print("------------------------------")
        except Exception as exp:
            messagebox.showinfo("Error", f"No se pudo eliminar el item: \n {exp}")
            print("------------------------------")
            print("Eliminacion fallida")
            print("------------------------------") 

    class Material:
        def __init__(self, dbID, nombre, cantidad, unidad):
            self.dbID = dbID
            self.nombre = nombre
            self.cantidad = cantidad
            self.unidad = unidad

    def clean(self):
        for widget in self.table_frame.winfo_children():
            widget.destroy()

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