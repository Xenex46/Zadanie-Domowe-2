import { Database } from 'sqlite3';

interface Result {
    text: string,
    answer: number,
    correctAnswer: number,
    timeSpent: number,
    penalty: number,
    average: number
}

interface BestScore {
    user: string,
    score: number;
}

export interface FullResults {
    results: Result[],
    fullScore: number,
    bestScores: BestScore[];
}

export const saveScore = async (db: Database, quiz_id: number, user: string, score: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO scores (quiz_id, user, score) VALUES (?, ?, ?);', [quiz_id, user, score], (err) => {
            if (err) {
                console.log('DB Error during score save: ', err);
                reject(err);
            }
            resolve();
        });
    });
};

export const checkScore = async (db: Database, quiz_id: number, user: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as cnt FROM scores where quiz_id = ? and user = ?;', [quiz_id, user], (err, row) => {
            if (err) {
                console.log('DB Error during score save: ', err);
                reject(err);
            }

            resolve(row.cnt == 1);
        });
    });
};

export const getResults = async (db: Database, quiz_id: number, user: string): Promise<FullResults> => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT 
                    text, questions.answer as correctAnswer,
                    answers.answer as answer,
                    answers.time_spent as timeSpent,
                    penalty,
                    average
                FROM
                    questions
                    INNER JOIN answers
                        on questions.id = answers.question_id
                    LEFT JOIN
                        (SELECT
                            question_id,
                            avg(time_spent) as average
                        FROM
                            questions
                            INNER JOIN answers on questions.id = answers.question_id
                        WHERE questions.answer = answers.answer
                        GROUP BY question_id)
                    as answers_avg
                        on answers.question_id = answers_avg.question_id
                WHERE
                    questions.quiz_id = ?
                    and answers.user = ?`,
            [quiz_id, user], (err, rows) => {
                if (err) {
                    console.log('DB Error during results get');
                    reject(err);
                }

                db.get('SELECT score FROM scores WHERE quiz_id = ? and user = ?', [quiz_id, user], (err, row) => {
                    if (err) {
                        console.log('DB Error during score get:', err);
                        reject(err);
                    }

                    if (!row)
                        resolve({ results: [], fullScore: undefined, bestScores: [] });

                    db.all('SELECT user, score FROM scores WHERE quiz_id = ? ORDER BY score ASC LIMIT 5', quiz_id, (err, bestScores) => {
                        if (err) {
                            console.log('DB Error during best scores get:', err);
                            reject(err);
                        }

                        resolve({ results: rows, fullScore: row.score, bestScores });
                    });

                });

            });
    });
};