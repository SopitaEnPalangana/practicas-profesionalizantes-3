import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import {config} from './config.mjs'
import { login, register, 
    listusers, editUser, deleteUser,
    createGroup, listgroups, deleteGroup,
    assignMember,
    listaccess, assignAccess, cancelAccess,
    listendpoints, createEndpoint, editPath, deleteEndpoint} from './auth.mjs'

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

    const output = await assignMember(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function editusername_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await editUser(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function deleteuser_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await deleteUser(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function groupslist_handler(request, response)
{
    const output = await listgroups()
    console.log(output)
    response.writeHead(200, { 'Content-Type': 'application/json'});
    response.end(JSON.stringify(output));
}

async function newgroup_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await createGroup(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function editgroupaccess_handler(request, response){}

async function deletegroup_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await deleteGroup(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function accesslist_handler(request, response)
{
    const output = await listaccess()
    console.log(output)
    response.writeHead(200, { 'Content-Type': 'application/json'});
    response.end(JSON.stringify(output));
}

async function newaccess_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await assignAccess(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function cancelaccess_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await cancelAccess(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function endpointslist_handler(request, response)
{
    const output = await listendpoints()
    console.log(output)
    response.writeHead(200, { 'Content-Type': 'application/json'});
    response.end(JSON.stringify(output));
}

async function newendpoint_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await createEndpoint(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));
}

async function editendpoint_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await editPath(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output)); 
}

async function deleteendpoint_handler(request, response)
{
    const url = new URL(request.url, 'http://' + config.server.ip);
    const input = Object.fromEntries(url.searchParams);

    const output = await deleteEndpoint(input);
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(output));    
}


export {
    default_handler, login_handler, register_handler, 
    userslist_handler, editusername_handler, deleteuser_handler,
    groupslist_handler, newgroup_handler, deletegroup_handler,
    assigngroup_handler, cancelaccess_handler,
    accesslist_handler, newaccess_handler,
    endpointslist_handler, newendpoint_handler, editendpoint_handler, deleteendpoint_handler
};