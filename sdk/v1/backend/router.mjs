import {config} from './config.mjs'
import { default_handler, login_handler, register_handler, show_message_handler } from './handlers.mjs';

//Mecanismo de ruteo/despacho
let router = new Map();

router.set('/', default_handler )
router.set('/login', login_handler );
router.set('/register', register_handler );
router.set('/showMessage', show_message_handler );


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

export {request_dispatcher};