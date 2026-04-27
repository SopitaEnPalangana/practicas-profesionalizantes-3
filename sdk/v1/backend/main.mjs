import { createServer } from 'node:http';
import { config }  from './config.mjs'
import { request_dispatcher } from './router.mjs';

function start()
{
	console.log('Servidor ejecutándose...');
}

let server = createServer(request_dispatcher);

server.listen(config.server.port, config.server.ip, start);