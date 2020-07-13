import { Request, Response } from 'express';
import { Answer, saveAnswer } from '../answer';
import { Timer } from '../timers';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';
import { Questions, CorrectAnswer } from '../questions';
import { saveScore, checkScore } from '../scores';

const timer = new Timer(new Database(DATABASE_NAME));

const questions = new Questions(new Database(DATABASE_NAME));

export const answersPost = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.user)
        return;

    const answers: Answer[] = req.body;

    const quizId = parseInt(req.params.quizId);

    const user = req.session.user;

    let spentSum = 0;

    for (const answer of answers)
        spentSum += answer.timeSpent;

    if (spentSum !== 1) {
        console.log('spentSum is not equal to 1');
        return;
    }

    const db = new Database(DATABASE_NAME);

    if (await checkScore(db, quizId, user)) {
        console.log('Answers already saved');
        return;
    }

    const timeSpent = (new Date).getTime() - await timer.getTime(quizId, user);

    const correctAnswers = await questions.getAnswers(quizId);

    saveAnswers(db, answers, correctAnswers, quizId, user, timeSpent).finally(() => {
        res.redirect(`/results.html?id=${req.params.quizId}`);
    });
};

const saveAnswers = async (db: Database, answers: Answer[], correctAnswers: CorrectAnswer[], quizId: number, user: string, timeSpent: number, retries = 0) => {
    return new Promise((resolve, reject) => {
        let score = timeSpent;

        db.run('BEGIN TRANSACTION;', async (err) => {
            if (err) {
                if (err.name === 'SQLITE_BUSY' && retries < 10) {
                    console.log('Database busy, retrying');
                    return saveAnswers(db, answers, correctAnswers, quizId, user, timeSpent, retries + 1);
                }
                else {
                    console.log('DB Error during answers save:', err);
                    reject();
                }
            }
            else {
                for (let i = 0; i < answers.length; i++) {
                    const answer = answers[i];
                    const correctAnswer = correctAnswers[i];

                    const question_time = Math.floor(answer.timeSpent * timeSpent);

                    await saveAnswer(db, answer.question_id, user, answer.answer, question_time).catch(() => { db.run('ROLLBACK'); reject(); });

                    if (answer.answer != correctAnswer.answer)
                        score += correctAnswer.penalty;
                }

                await saveScore(db, quizId, user, score).catch(() => { db.run('ROLLBACK'); reject(); });

                db.run('COMMIT');
                resolve();
            }
        });
    });
};