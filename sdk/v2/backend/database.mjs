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
        user_id INTEGER NOT NULL REFERENCES users(id),
        group_id INTEGER NOT NULL REFERENCES groups(id),
        PRIMARY KEY("user_id","group_id")
        );
        CREATE TABLE IF NOT EXISTS endpoints (
        id INTEGER NOT NULL,
        path TEXT NOT NULL PRIMARY KEY UNIQUE
        );
        CREATE TABLE IF NOT EXISTS access (
        group_id INTEGER NOT NULL REFERENCES groups(id),
        endpoint_id INTEGER NOT NULL REFERENCES endpoints(id),
        PRIMARY KEY("group_id","endpoint_id")
        )`;

    return new Promise((resolve, reject) => {
        db.run(sql, function (err) {
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

async function show_all_users()
{
    const sql = `SELECT * FROM users`;
    
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

export{findUser, insertUser, show_all_users};