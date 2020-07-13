import * as sqlite from 'sqlite3';

export interface Quiz {
    id: number,
    name: string;
}

export interface QuizLists {
    quizes: Quiz[],
    results: Quiz[];
}

export class Quizes {

    db: sqlite.Database;

    constructor(dbInit: sqlite.Database) {
        this.db = dbInit;
    }

    async getQuizList(user: string): Promise<QuizLists> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT id, name FROM quizes EXCEPT SELECT id, name FROM quizes INNER JOIN scores on scores.quiz_id = quizes.id WHERE user = ?;', user, (err, quizes) => {
                if (err) {
                    console.log('DB Error during quiz list get:', err);
                    reject();
                }

                this.db.all('SELECT id, name FROM quizes INNER JOIN scores on scores.quiz_id = quizes.id WHERE user = ?;', user, (err, results) => {
                    if (err) {
                        console.log('DB Error during results list get:', err);
                        reject();
                    }

                    resolve({ quizes, results });
                });
            });
        });
    }
}