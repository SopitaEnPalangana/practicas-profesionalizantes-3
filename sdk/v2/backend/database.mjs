import  sqlite3  from 'sqlite3';
import { resolve } from 'node:path';
import { config } from "./config.mjs"

function connect_db( path ) 
{
  const dbPath = resolve(path);
  const db = new sqlite3.Database(dbPath, (err) => { //second parameter is a callback, could be a separated function but an arrow one is just simpler. 
    if (err) {
      throw new Error(`Error al conectar a la base de datos: ${err.message}`);
    }
  });
  db.run("PRAGMA foreign_keys = ON"); //para que funcione el ON CASCADE
  return db;
}

// Uso
const db = connect_db( config.database.path );

function createDB()
{
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

    return new Promise((resolve, reject) => {
        db.exec(sql, function (err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
} 

await createDB()

async function findUser(username)
{
    const sql = `SELECT * FROM users WHERE username = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [username], function (err, row){
            if (err) {
                reject(err);
                return;
            }
            resolve(row); //password is here, goes to auth
        });
    });

}

async function insertUser(username, password)
{
    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;

    return new Promise((resolve, reject) => {
        db.run(sql, [username, password], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                username,
                password
            });
        });
    });
}

//USERS----------------------------------------------------------

async function show_all_users()
{
    const sql = `
        SELECT users.id, users.username, groups.name as groupname
        FROM users
        LEFT JOIN members ON users.id = members.user_id
        LEFT JOIN groups ON members.group_id = groups.id
        `;
    
    return new Promise((resolve,reject) => {
        db.all(sql, function(err, rows){
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

async function edit_user(userID, new_username)
{
    const sql = `UPDATE users SET username = ? WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [new_username, userID], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

async function delete_user(userID)
{
    const sql = `DELETE FROM users WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [userID], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });

}

//GROUPS------------------------------------------------------------

async function find_group(name)
{
    const sql = `SELECT * FROM groups WHERE name = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [name], function (err, row){
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });

}

async function insert_group(name)
{
    const sql = `INSERT INTO groups (name) VALUES (?)`;

    return new Promise((resolve, reject) => {
        db.run(sql, [name], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ name });
        });
    });
}

async function show_all_groups()
{
    const sql = `SELECT * FROM groups`;
    
    return new Promise((resolve,reject) => {
        db.all(sql, function(err, rows){
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

async function delete_group(groupID)
{
    const sql = `DELETE FROM groups WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [groupID], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });

}

//MEMBERS------------------------------------------------------------

async function assign_member(userID, groupID)
{
    const sql = `INSERT INTO members (user_id, group_id) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [userID, groupID], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ userID, groupID });
        });
    });
}

//ACCESS------------------------------------------------------------

async function show_all_access()
{
    const sql = `
        SELECT groups.name as groupname, endpoints.path as path
        FROM access
        LEFT JOIN groups ON access.group_id = groups.id
        LEFT JOIN endpoints ON access.endpoint_id = endpoints.id
        `;
    
    return new Promise((resolve,reject) => {
        db.all(sql, function(err, rows){
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

async function assign_access(groupID, endpID)
{
    const sql = `INSERT INTO access (group_id, endpoint_id) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [groupID, endpID], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ groupID, endpID });
        });
    });
}

async function cancel_access(groupID, endpID)
{
    const sql = `DELETE FROM access WHERE group_id = ? AND endpoint_id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [groupID, endpID], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });

}

//ENDPOINTS------------------------------------------------------------

async function show_all_endpoints()
{
    const sql = `SELECT * FROM endpoints`;
    
    return new Promise((resolve,reject) => {
        db.all(sql, function(err, rows){
            if(err){
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

async function find_endpoint(path)
{
    const sql = `SELECT * FROM endpoints WHERE path = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [path], function (err, row){
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });

}

async function insert_endpoint(path)
{
    const sql = `INSERT INTO endpoints (path) VALUES (?)`;

    return new Promise((resolve, reject) => {
        db.run(sql, [path], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ path });
        });
    });
}

async function edit_path(endp, newpath)
{
    const sql = `UPDATE endpoints SET path = ? WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [newpath, endp], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

async function delete_endpoint(id)
{
    const sql = `DELETE FROM endpoints WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [id], function (err) {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export{
    findUser, insertUser, show_all_users, edit_user, delete_user,
    find_group, insert_group, show_all_groups, delete_group,
    assign_member,
    show_all_access, assign_access, cancel_access,
    show_all_endpoints, find_endpoint, insert_endpoint, edit_path, delete_endpoint
};