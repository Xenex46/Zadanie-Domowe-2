import * as sqlite from 'sqlite3';

export interface Quiz {
    id: number,
    name: string;
}

export class Quizes {

    db: sqlite.Database;

    constructor(dbInit: sqlite.Database) {
        this.db = dbInit;
    }

    async getQuizList(user: string): Promise<Quiz[]> {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT id, name FROM quizes EXCEPT SELECT quiz_id, name FROM timers INNER JOIN quizes on timers.quiz_id = quizes.id WHERE user = "${user}";`, (err, rows) => {
                if (err) {
                    console.log('DB Error during quiz list get:', err);
                    reject();
                }

                resolve(rows);
            });
        });
    }
}