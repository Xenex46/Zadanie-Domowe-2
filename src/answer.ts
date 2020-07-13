import { Database } from 'sqlite3';

export interface Answer {
    question_id: number,
    answer: number,
    timeSpent: number
}

export const saveAnswer = async (db: Database, question_id: number, user: string, answer: number, time_spent: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO answers (question_id, user, answer, time_spent) VALUES (?, ?, ?, ?);', [question_id, user, answer, time_spent], (err) => {
            if (err) {
                console.log('DB Error during answer save: ', err);
                reject();
            }
            resolve();
        });
    });
};