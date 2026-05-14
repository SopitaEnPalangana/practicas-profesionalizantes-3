import { findUser, insertUser } from "./database.mjs"
import { show_all_users, edit_user, delete_user } from "./database.mjs";
import { find_group, insert_group, show_all_groups, delete_group } from "./database.mjs";
import { assign_member } from "./database.mjs";
import { show_all_access, assign_access, cancel_access } from "./database.mjs";
import { show_all_endpoints, find_endpoint, insert_endpoint, edit_path, delete_endpoint} from "./database.mjs";

//Lógica de negocio / Modelo (Son independientes de protocolos, comunicaciones y servidor)
async function login( input )  //input has username=? password=?
{
    const userdata = await findUser(input.username);

    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_USER_PASS'
    };
    
    if ( userdata && input.username === userdata.username && input.password === userdata.password )
    {
        output.status = true;
        output.result = userdata.username;
        output.description = null;
    }

    return output;
}

async function register(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_REGISTER'  
    };
    
    const check = await findUser(input.username);

    if(check)
    {
        output.description = 'USER_ALREADY_EXIST';
        console.log('***Usuario ya ingresado***');
    }else{
        const inserted = await insertUser(input.username, input.password)
        if(inserted)
        {
            output.status = true;
            output.result = input.username;
            output.description = null;
        }
    }

    return output;
}

//USERS----------------------------------------------------------
async function listusers()
{
    const userslist = await show_all_users();

    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_SEARCH'
    };
    if (userslist)
    {
        output.status = true;
        output.result = userslist;
        output.description = null;
    }
    return output;
}

async function editUser(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_EDITION'
    };
    const updated = await edit_user(input.id, input.newname);
    output.status = true;
    output.result = input.newname;
    output.description = null;
    return output;
}

async function deleteUser(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_DELETE'
    };
    const deleted = await delete_user(input.id);
    output.status = true;
    output.result = input.id;
    output.description = null;
    return output;
}

//GROUPS------------------------------------------------------------

async function createGroup(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_CREATION'  
    };
    
    const check = await find_group(input.name);

    if(check)
    {
        output.description = 'GROUP_ALREADY_EXIST';
        console.log('***Grupo ya ingresado***');
    }else{
        const inserted = await insert_group(input.name)
        if(inserted)
        {
            output.status = true;
            output.result = input.name;
            output.description = null;
        }
    }

    return output;
}

async function listgroups()
{
    const groupslist = await show_all_groups();

    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_SEARCH'
    };
    if (groupslist)
    {
        output.status = true;
        output.result = groupslist;
        output.description = null;
    }
    return output;
}

async function deleteGroup(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_DELETE'
    };
    const deleted = await delete_group(parseInt(input.id));
    output.status = true;
    output.result = input.id;
    output.description = null;
    return output;
}

//MEMBERS------------------------------------------------------------

async function assignMember(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_ASSIGNATION'  
    };
    //aca tiene que pasar a int, el prompt y el pasaje x el json lo toma como string
    const newMember = await assign_member(parseInt(input.userID), parseInt(input.groupID));
    if(newMember)
    {
        output.status = true;
        output.result = input.userID;
        output.description = null;
    }

    return output;
}


//ACCESS------------------------------------------------------------

async function listaccess()
{
    const accesslist = await show_all_access();

    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_SEARCH'
    };
    if (accesslist)
    {
        output.status = true;
        output.result = accesslist;
        output.description = null;
    }
    return output;
}

async function assignAccess(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_ASSIGNATION'  
    };
    //aca tiene que pasar a int, el prompt y el pasaje x el json lo toma como string
    const newAccess = await assign_access(parseInt(input.groupID), parseInt(input.endpID));
    if(newAccess)
    {
        output.status = true;
        output.result = input.groupID, input.endpID;
        output.description = null;
    }

    return output;
}

async function cancelAccess(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_DELETE'
    };
    const deleted = await cancel_access(parseInt(input.groupID), parseInt(input.endpID));
    output.status = true;
    output.result = input.groupID;
    output.description = null;
    return output;
}

//ENDPOINTS------------------------------------------------------------

async function listendpoints()
{
    const endpointslist = await show_all_endpoints();

    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_SEARCH'
    };
    if (endpointslist)
    {
        output.status = true;
        output.result = endpointslist;
        output.description = null;
    }
    return output;
}

async function createEndpoint(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'INVALID_REGISTER'  
    };
    
    const check = await find_endpoint(input.path);

    if(check)
    {
        output.description = 'ENDPOINT_ALREADY_EXIST';
        console.log('***Path ya ingresado***');
    }else{
        const inserted = await insert_endpoint(input.path)
        if(inserted)
        {
            output.status = true;
            output.result = input.path;
            output.description = null;
        }
    }

    return output;
}

async function editPath()
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_EDITION'
    };
    const updated = await edit_path(parseInt(input.id), input.newname);
    output.status = true;
    output.result = input.newname;
    output.description = null;
    return output;
}

async function deleteEndpoint(input)
{
    const output =
    {
        status: false,
        result: null,
        description: 'FAILED_DELETE'
    };
    const deleted = await delete_endpoint(parseInt(input.id));
    output.status = true;
    output.result = input.id;
    output.description = null;
    return output;
}

export{
    login, register, 
    listusers, editUser, deleteUser,
    createGroup, listgroups, deleteGroup,
    assignMember,
    listaccess, assignAccess, cancelAccess,
    listendpoints, createEndpoint, editPath, deleteEndpoint
};