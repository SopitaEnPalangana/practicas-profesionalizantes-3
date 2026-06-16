/*
-A partir del código desarrollado por el docente en la clase del día 14/5, cada estudiante 
deberá descargarlo y modificarlo de modo tal que queden funcionando correctamente los ítems 1 y 2.

1. Asuma que en su sistema, tiene un usuario X (id) ya registrado en la base de datos (con nombre y contraseña) 
que a su vez se encuentra asociado al grupo G (id) y este grupo tiene vinculado 3 endpoints 
/print, /log, /help  sobre un total de 5 endpoints. 
(Endpoints: /print /log  /help /sayHello /sayBye ) 
Se esperaría que cuando el usuario en la aplicación web cliente, pretenda ejecutar "/log" se realice de forma satisfactoria 
y cuando quiera ejecutar "/sayHello" se deniegue tal acción.

-Backend: Desarrolle el componente "autorizador" encargado de habilitar/denegar la ejecución de una acción solicitada 
por un usuario y defina en qué parte de la arquitectura debe operar.

-Frontend: Agregue a la interfaz gráfica de pruebas dos botones para ilustrar cada caso o equivalente práctico.

2. Una vez que haya desarrollado las modificaciones 1 y 2. 
Construya el mecanismo de sesión (contexto de ejecución del usuario). 
El mecanismo de sesión no debe persistir sesiones en bases de datos. 
Como simplificación, la sesión de usuario sólo vive en esta versión mientras el servidor Node.js esté ejecutándose. 
Aplique un diseño estructural conveniente para su resolución que permita el reúso y separación de responsabilidades de 
forma clara.
*/


/*
3. Contenido abordado por el docente (28/5): 
Efectúe una modificación con respecto al almacenamiento de las contraseñas de los usuarios. 
Actualmente son textos planos visibles en la base de datos. Modifique el alta de usuario de modo tal que la contraseña se guarde 
de manera cifrada empleando cifrado irreversible (SHA256). Adecúe la función de autenticación según corresponda. 
¿password como campo resulta un nombre conveniente?

*/

import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

//Setting up server------------------------------------------
function default_config() 
{
    const config = 
    {
        server: 
        {
            ip: '127.0.0.1',
            port: 4000,
            default_path: './default.html'
        },
        database: 
        {
            path: './database.db'
        }
    };

    return config;
}

function load_config() 
{
    let config = null;
    try 
    {
        const data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log("Configuración cargada correctamente.");
    } 
    catch (error) 
    {
        console.error("Error cargando config.json. Usando valores por defecto.");
        config = default_config();
    }
    return config;
}

const config = load_config();


//DataBase----------------------------------------------------------
function connect_db(path) 
{
    const dbPath = resolve(path);
    try 
    {
        const db = new DatabaseSync(dbPath);
        return db;
    } 
    catch (err) 
    {
        throw new Error("Error al conectar a la base de datos: " + err.message);
    }
}

const db = connect_db(config.database.path);

function create_database() {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS members (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        PRIMARY KEY("user_id","group_id")
        );
        CREATE TABLE IF NOT EXISTS endpoints (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS access (
        group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        endpoint_id INTEGER NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
        PRIMARY KEY("group_id","endpoint_id")
        )`;

    db.exec(sql); 
}

create_database();



//auth----------------------------------------------------------------------

let userSessions = new Map();  //clave-valor  -> clave: id_user,  valor: sessionObj

class UserSession
{
    constructor()
    {
       this.status = 'disabled';
    }

}

function authenticate( username, password )
{
    //Debería ir a la base de datos y buscar si existe (1) registro  username/password coincidente
    //Si es verdadero entonces significa que estoy autenticado, sino no.

    const sql = "SELECT count(*) as total FROM `users` WHERE username=? AND password=?";

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(username, password);
            
        return (row.total === 1);
    } 
    catch (err) 
    {
        throw err;
    }
}

function authorize( username, endpointPath )
{
    const sql = `
        SELECT count(*) as total
        FROM access a
        JOIN members m ON a.group_id = m.group_id
        JOIN users u ON m.user_id = u.id
        JOIN endpoints e ON a.endpoint_id = e.id
        WHERE u.username = ? 
          AND e.path = ?
    `;

    try {
        const stmt = db.prepare(sql);
        // Pasamos los parámetros en el orden de los signos de interrogación
        const row = stmt.get(username, endpointPath);

        // Si el conteo es mayor a 0, tiene permiso
        return row.total > 0;       //devuelve true or false
    } catch (err) {
        console.error("Error consultando permisos:", err);
        throw err;
    }
}


// Lógica de negocio  / models?
function register_user(db, input) 
{
    const sql = "INSERT INTO users (username, password) VALUES (?, ?) RETURNING id";

    try 
    {
        const stmt = db.prepare(sql);
        const row = stmt.get(input.username, input.key);

        const output =
        {
            status: false,
            result: input.username,
            description: 'REGISTERED_USER'  
        };
        
        return output;
    } 
    catch (err) 
    {
        throw err;
    }
}

async function login( username, key )
{
    
    let isAuthenticated = authenticate(username, key);

    if ( isAuthenticated )
    {
        let havePreviousSession = userSessions.get(username);

        if ( havePreviousSession == null )
        {
            //Significa que está ingresando por primera vez. Entonces, creo y persisto el objeto de sesión
            let newSession = new UserSession();
            newSession.status = 'enabled';
            userSessions.set(username, newSession );
            return newSession;
        }
        else
        {
            //Significa que ya ingresó en algún momento y tiene ya un objeto de sesión creado y guardado en el mapa.

            if ( havePreviousSession.status == 'disabled')
            {
                havePreviousSession.status = 'enabled';
            }
    
            return havePreviousSession; //por ahora el objeto tiene solo un estado disabled o enabled.
        }
    }
    else
    {
        return null;
    }

    //El retorno de esta función está representando si se devuelve o no un objeto de sesión.
}

function logout(username, key)
{
    let isAuthenticated = authenticate(username, key);

    if ( isAuthenticated )
    {
        let currentSession = userSessions.get(username);

        if ( currentSession != null && currentSession.status == 'enabled')
        {
            currentSession.status = 'disabled';
            return currentSession;   
        }
        else 
        {
            console.log("Session no iniciada.")
            return err;
        }
    }
    else
    {
        return null;
    }
}


//HANDLERS----------------------------------------------------------------
function default_handler(request, response)
{
    try 
    {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    } 
    catch (error) 
    {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

async function register_handler(request, response)
{
    //Pasado a POST

    if ( request.method == "POST")
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));
        
        try 
        {
            const output = register_user(db, input);
            console.log('Nuevo usuario registrado: ', output.result);
            
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch (err)
        {
            response.writeHead(500);
            response.end(JSON.stringify({ error: err.message }));
        }
    }
}

async function login_handler(request, response)
{
    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));
        
        try 
        {
            // 4. Procesamos el login
            const output = await login(input.username, input.key); //El resultado es nulo o un objeto de sesión

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        } 
        catch (err) 
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

async function logout_handler(request, response)
{
    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try 
        {
            const output = await logout(input.username, input.key);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        } 
        catch (err) 
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Sesion inexistente' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }

}

async function print_handler(request, response)
{

    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try
        {
            const output = authorize(input.username, '/print');

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch(err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

async function log_handler(request, response)
{

    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try
        {
            const output = authorize(input.username, '/log');

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch(err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

async function help_handler(request, response)
{

    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try
        {
            const output = authorize(input.username, '/help');

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch(err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

async function sayhello_handler(request, response)
{

    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try
        {
            const output = authorize(input.username, '/sayHello');

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch(err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

async function saybye_handler(request, response)
{

    if ( request.method == "POST" )
    {
        const body = await new Promise((resolve, reject) => {
            let data = '';
            request.on('data', chunk => {
                data += chunk;
            });
            request.on('end', () => {
                resolve(data);
            });
            request.on('error', reject);
        });

        const input = Object.fromEntries(new URLSearchParams(body));

        try
        {
            const output = authorize(input.username, '/sayBye');

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch(err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    }
    else
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
}

//router---------------------------------------------------
let router = new Map();

router.set('/', default_handler )
router.set('/register', register_handler );
router.set('/login', login_handler );
router.set('/logout', logout_handler );
router.set('/print', print_handler );
router.set('/log', log_handler );
router.set('/help', help_handler );
router.set('/sayHello', sayhello_handler );
router.set('/sayBye', saybye_handler );

//Despachador principal
async function request_dispatcher(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;
    const handler = router.get(path);

    if (handler)
    {
        return await handler(request, response);
    }
    else
    {
        response.writeHead(404);
        response.end('Método no encontrado');
    }
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);



//Todavia falta el authorize shit, y cargar la base de datos con grupos y endpoints.
//Y volver a copiar aca los botones de endoints. Y crearles el handlers y vincularlos a
//la logica de verificacion