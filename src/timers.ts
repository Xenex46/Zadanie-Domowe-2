import * as sqlite from 'sqlite3';

export class Timer {

    db: sqlite.Database;

    constructor(dbInit: sqlite.Database) {
        this.db = dbInit;
    }

    async timeExists(quizId: number, user: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) AS cnt FROM timers WHERE quiz_id=${quizId} and user="${user}"`, (err, row) => {
                if (err) {
                    console.log('DB Error during timer check: ', err);
                    reject();
                }

                if (row.cnt == 1)
                    resolve(true);

                resolve(false);
            });
        });
    }

    async getTime(quizId: number, user: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT start FROM timers WHERE quiz_id=${quizId} and user="${user}"`, (err, row) => {
                if (err) {
                    console.log('DB Error during timer get: ', err);
                    reject();
                }

                resolve(row.start);
            });
        });
    }

    saveTime(quizId: number, user: string): void {
        this.timeExists(quizId, user).then((exists) => {
            if (!exists)
                this.db.run('INSERT INTO timers (quiz_id, user, start) VALUES (?, ?, ?);', [quizId, user, (new Date).getTime()], (err) => {
                    if (err)
                        console.log('DB Error during timer save: ', err);
                });
        });
    }
}
