import {show_all_users} from "./database.mjs"

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

export {listusers};