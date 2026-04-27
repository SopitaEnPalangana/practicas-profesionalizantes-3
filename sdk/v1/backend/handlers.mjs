import { URL } from 'node:url';
import {config} from './config.mjs'
import { login, register } from './auth.mjs'

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

async function login_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    console.log(input);

    const output = await login(input);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}


async function register_handler(request, response)
{
    if ( request.method == "GET")  //redundant?
    {
        const url = new URL(request.url, 'http://' + config.server.ip);
        const input = Object.fromEntries(url.searchParams);

        const output = await register(input);
        console.log('Nuevo usuario registrado: ', output.result);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    }
	
}

function show_message_handler(request, response)
{
    console.log("Petición recibida: Mostrando mensaje en el servidor!");

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end();
}

export {default_handler, login_handler, register_handler, show_message_handler};