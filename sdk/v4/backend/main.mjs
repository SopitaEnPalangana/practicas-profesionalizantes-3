/*
1. Acoplamiento front-end / back-end
-Aplicar la separación de servidores configurados con puertos diferentes.
-Separar el repositorio en carpetas diferentes (git: sdk/v4/frontend, sdk/v4/backend)
-En el back-end NodeJS. Eliminar la ruta "/"

-Adecuar las peticiones del frontend para que se resuelvan correctamente. Aquí, ocurrirá un error. 

Como los puertos son diferentes, el dominio web es distinto, con lo cual, las peticiones que se procesan en el backend arrojarán error CORS. 
(Una política de seguridad del protocolo que impiden que otros dominios consuman servicios de forma cruzada). 
Para solucionar esto, el backend de NodeJS deberá incluir unas cabeceras HTTP en el manejador principal lo más al inicio posible:

function request_dispatcher(request, response)
{
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (request.method === 'OPTIONS')
    {
        response.writeHead(204);
        response.end();
        return;
    }

    //Resto de código que actualmente funciona...
}

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
            default_path: '127.0.0.1/default.html'
        },
        database: 
        {
            path: './db.sqlite3'
        }
    };

    return config;
}

function load_config() 
{
    let config = null;
    try 
    {
        const data = readFileSync('config.json', 'utf-8');
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
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (request.method === 'OPTIONS')
    {
        response.writeHead(204);
        response.end();
        return;
    }

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