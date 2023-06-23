/* eslint-disable no-console */
const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'database.sqlite';

const db = new sqlite3.Database(DBSOURCE, (errConnect) => {
    if (errConnect) {
        // Cannot open database
        console.error(errConnect.message);
        throw errConnect;
    } else {
        console.log('Connected to the SQLite database');
        /* const sql = 'DROP TABLE IF EXISTS genres';
        db.run('PRAGMA foreign_keys=ON', (err) => {
            
            if (err) {
                console.log(err);
            } else {
                console.log('delete');
            }
        }); */
        /* db.run(sql, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('delete');
            }
        }); */
        db.run(
            `CREATE TABLE IF NOT EXISTS genres (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL
            )`,
            (errQuery) => {
                if (errQuery) {
                // Table already createda
                    console.log(errQuery, '11');
                } else {
                // Table just created, creating some rows
                    const insert = 'INSERT INTO genres (name) VALUES (?)';
                    db.run(insert, ['Drame']);
                    db.run(insert, ['Thriller']);
                    db.run(insert, ['Action']);
                    console.log('db genres created')

                }
            },
        );
        /* db.run('DROP TABLE IF EXISTS films', (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('delete');
            }
        }); */
        // FOREIGN KEY(id) REFERENCES genres(genre_id),
        db.run(
            `CREATE TABLE IF NOT EXISTS films (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                synopsis text NOT NULL,
                release_year INTEGER ,
                genre_id INTEGER NOT NULL,
                FOREIGN KEY(id) REFERENCES genres(genre_id)
                FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE RESTRICT
            )`,
            (errQuery) => {
                if (errQuery) {
                // Table already created
                    console.log(errQuery, '22');
                } else {
                // Table just created, creating some rows
                    const insert = 'INSERT INTO films (name,synopsis,release_year,genre_id) VALUES (?,?,?,?)';
                    db.run(insert, ['Top Gun', 'lorem ipsum....', 2022, 1]);
                    db.run(insert, ['Top Gusasn', 'lorem ipsum....', 2022, 2]);
                    console.log('db films created')
                }
            },
        );

        db.run(
            `CREATE TABLE IF NOT EXISTS actors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR (255) NOT NULL,
                    date_of_birth DATE NOT NULL,
                    date_of_death DATE
                )`,
            (errQuery) => {
                if (errQuery) {
                // Table already created
                    console.log(errQuery, '23');
                } else {
                    console.log('db actors created')
                    const insert = 'INSERT INTO actors (first_name,last_name,date_of_birth,date_of_death) VALUES (?,?,?,?)';
                    db.run(insert, ['Arnold', 'lorem ipsum....', new Date(), new Date()]);
                    db.run(insert, ['ToM', 'lorem ipsum....', new Date(), new Date()]);
                }
            },
        );
        db.run(
            `CREATE TABLE IF NOT EXISTS films_actors (
                    film_id INTEGER,
                    actor_id INTEGER,
                    PRIMARY KEY (film_id, actor_id),
                    FOREIGN KEY (film_id) REFERENCES films(id),
                    FOREIGN KEY (actor_id) REFERENCES actors(id)
                )`,
            (errQuery) => {
                if (errQuery) {
                // Table already created
                    console.log(errQuery, '24');
                } else {
                    console.log('db films_actors created')
                }
            },
        );
    }
});
module.exports = db;
