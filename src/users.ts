import * as sqlite from 'sqlite3';
import * as crypto from 'crypto';

export class Users {

    db: sqlite.Database;

    constructor(dbInit: sqlite.Database) {
        this.db = dbInit;
    }

    async checkUser(login: string, hash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE login = ? and password= ?;', [login, hash], (err, row) => {
                if (err) {
                    reject('Error while checking user');
                }

                if (row === undefined)
                    resolve(false);

                resolve(true);
            });
        });
    }

    async changePassword(user: string, newPassword: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256').update(user + newPassword).digest('hex');

            this.db.run('UPDATE users SET password = ? WHERE login = ?', [hash, user], (err) => {
                if (err) {
                    console.log('Error during password change: ', err);
                    reject();
                }

                resolve();
            });
        });
    }
}