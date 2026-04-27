import {findUser} from "./database.mjs"
import { insertUser } from "./database.mjs";



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

export{login, register};