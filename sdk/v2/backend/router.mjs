import {config} from './config.mjs'
import { default_handler, login_handler, register_handler} from './handlers.mjs'
import { userslist_handler, editusername_handler, deleteuser_handler } from './handlers.mjs'
import { groupslist_handler, newgroup_handler, deletegroup_handler }  from './handlers.mjs';
import { assigngroup_handler, cancelaccess_handler } from './handlers.mjs';
import { accesslist_handler, newaccess_handler } from './handlers.mjs';
import { endpointslist_handler, newendpoint_handler, editendpoint_handler, deleteendpoint_handler } from './handlers.mjs';

//Mecanismo de ruteo/despacho
let router = new Map();

router.set('/', default_handler )
router.set('/login', login_handler );
router.set('/register', register_handler );
router.set('/userslist', userslist_handler);
router.set('/assigngroup', assigngroup_handler);
router.set('/editusername', editusername_handler);
router.set('/deleteuser', deleteuser_handler);
router.set('/groupslist', groupslist_handler);
router.set('/creategroup', newgroup_handler);
router.set('/deletegroup', deletegroup_handler);
router.set('/accesslist', accesslist_handler);
router.set('/newaccess', newaccess_handler);
router.set('/cancelaccess', cancelaccess_handler);
router.set('/endpointslist', endpointslist_handler);
router.set('/createendpoint', newendpoint_handler);
router.set('/editpath', editendpoint_handler);
router.set('/deleteendpoint', deleteendpoint_handler);


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