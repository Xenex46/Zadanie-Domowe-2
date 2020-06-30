import * as sqlite from 'sqlite3';
import * as crypto from 'crypto';
import { DATABASE_NAME } from './config';

const database = new sqlite.Database(DATABASE_NAME);

createUsersTableIfNeeded(database).then(() => createQuizesTableIfNeeded(database)).then(() => createQuestionsTableIfNeeded(database)).then(() => createTimersTableIfNeeded(database));

function createUsersTableIfNeeded(db: sqlite.Database): Promise<void> {
    console.log('Checking table users');
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type="table" and name="users";', (err, row) => {
            if (err) {
                reject('DB Error during table search');
                return;
            }

            if (row.cnt === 1) {
                console.log('Database table already exists.');
                resolve();
                return;
            }

            console.log('Creating table users...');
            db.run(`CREATE TABLE users (
              login TEXT PRIMARY KEY,
              password TEXT);`, [], (err: Error) => {
                if (err) {
                    reject('DB Error during table creation');
                    return;
                }

                const user1Password = crypto.createHash('sha256').update('user1user1').digest('hex');
                const user2Password = crypto.createHash('sha256').update('user2user2').digest('hex');
                db.run(`INSERT INTO users (login, password) VALUES ("user1", "${user1Password}")`);
                db.run(`INSERT INTO users (login, password) VALUES ("user2", "${user2Password}")`);
                console.log('Done.');
                resolve();
            });
        });
    });
}

function createQuizesTableIfNeeded(db: sqlite.Database): Promise<void> {
    console.log('Checking table quizes');
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type="table" and name="quizes";', (err, row) => {
            if (err) {
                reject('DB Error during table search');
                return;
            }

            if (row.cnt === 1) {
                console.log('Database table already exists.');
                resolve();
                return;
            }

            console.log('Creating table quizes...');
            db.run(`CREATE TABLE quizes (
              id INTEGER PRIMARY KEY,
              name TEXT);`, [], (err: Error) => {
                if (err) {
                    reject('DB Error during table creation');
                    return;
                }

                db.run('INSERT INTO quizes (id, name) VALUES (1, "Easy quiz")');
                db.run('INSERT INTO quizes (id, name) VALUES (2, "Medium quiz")');
                db.run('INSERT INTO quizes (id, name) VALUES (3, "Hard quiz")');
                console.log('Done.');
                resolve();
            });
        });
    });
}

function createQuestionsTableIfNeeded(db: sqlite.Database): Promise<void> {
    console.log('Checking table questions');
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type="table" and name="questions";', (err, row) => {
            if (err) {
                reject('DB Error during table search');
                return;
            }

            if (row.cnt === 1) {
                console.log('Database table already exists.');
                resolve();
                return;
            }

            console.log('Creating table questions...');
            db.run(`CREATE TABLE questions (
              id INTEGER PRIMARY KEY,
              quiz_id INTEGER,
              text TEXT,
              penalty INTEGER,
              answer INTEGER
              );`, [], (err: Error) => {
                if (err) {
                    reject('DB Error during table creation');
                    return;
                }

                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (1, 1, "2 + 2 = ?", 4000, 4)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (2, 1, "2 + 2 * 2 = ?", 5000, 6)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (3, 1, "2 * (2 + 2) = ?", 5000, 8)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (4, 1, "(5 + 3) * 3 = ?", 6000, 24)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (5, 2, "50 * 5 = ?", 4000, 250)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (6, 2, "26 + 32 - 12 = ?", 6000, 46)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (7, 2, "90 / 18 = ?", 5000, 5)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (8, 2, "111 + 222 + 444 = ?", 5000, 777)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (9, 3, "832 - 457 = ?", 8000, 375)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (10, 3, "72 * 3 = ?", 5000, 216)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (11, 3, "3 + 6 * (5 + 4) / 3 - 7 = ?", 12000, 14)');
                db.run('INSERT INTO questions (id, quiz_id, text, penalty, answer) VALUES (12, 3, "150 / (6 + 3 * 8) - 5  = ?", 10000, 0)');
                console.log('Done.');
                resolve();
            });
        });
    });
}

function createTimersTableIfNeeded(db: sqlite.Database): Promise<void> {
    console.log('Checking table timers');
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type="table" and name="timers";', (err, row) => {
            if (err) {
                reject('DB Error during table search');
                return;
            }

            if (row.cnt === 1) {
                console.log('Database table already exists.');
                resolve();
                return;
            }

            console.log('Creating table timers...');
            db.run(`CREATE TABLE timers (
              quiz_id INTEGER,
              user TEXT,
              start INTEGER
              );`, [], (err: Error) => {
                if (err) {
                    reject('DB Error during table creation');
                    return;
                }

                console.log('Done.');
                resolve();
            });
        });
    });
}