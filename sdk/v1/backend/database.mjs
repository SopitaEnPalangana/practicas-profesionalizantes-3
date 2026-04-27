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
        CREATE TABLE IF NOT EXISTS practicas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
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
    const sql = `SELECT * FROM practicas WHERE username = ?`;

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
    const sql = `INSERT INTO practicas (username, password) VALUES (?, ?)`;

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

export{findUser, insertUser};