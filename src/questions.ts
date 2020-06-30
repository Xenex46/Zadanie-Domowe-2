import * as sqlite from 'sqlite3';

export interface Question {
    text: string,
    penalty: number
}

export class Questions {

    db: sqlite.Database;

    constructor(dbInit: sqlite.Database) {
        this.db = dbInit;
    }

    async getQuestions(quizId: number): Promise<Question[]> {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT text, penalty FROM questions WHERE quiz_id = ${quizId} ORDER BY id ASC ;`, (err, rows) => {
                if (err) {
                    console.log('DB Error during questions get: ', err);
                    reject();
                }

                resolve(rows);
            });
        });
    }
}