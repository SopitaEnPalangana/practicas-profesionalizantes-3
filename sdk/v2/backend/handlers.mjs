import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import {config} from './config.mjs'
import { login, register } from './auth.mjs'
import { listusers } from './operate.mjs'

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
        console.log(error);
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

        const output = await register(input);
        console.log('Nuevo usuario registrado: ', output.result);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
    }
	
}

async function userslist_handler(request, response)
{
    const output = await listusers();
    console.log(output)
    response.writeHead(200, { 'Content-Type': 'application/json'});
    response.end(JSON.stringify(output));
}

async function assigngroup_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await assigngroup(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function editusername_handler(request, response){}

async function deleteuser_handler(request, response){}

async function groupslist_handler(request, response){}

async function newgroup_handler(request, response){}

async function editgroupaccess_handler(request, response){}

async function deletegroup_handler(request, response){}

async function accesslist_handler(request, response){}

async function newaccess_handler(request, response){}

async function cancelaccess_handler(request, response){}

async function endpointslist_handler(request, response){}

async function newendpoint_handler(request, response){}

async function editendpoint_handler(request, response){}

async function deleteendpoint_handler(request, response){}


export {default_handler, login_handler, register_handler, userslist_handler};