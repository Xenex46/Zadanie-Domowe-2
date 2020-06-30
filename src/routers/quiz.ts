import { Request, Response } from 'express';
import { Question, Questions } from '../questions';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';
import { Answer } from '../answer';
import { Timer } from '../timers';

const questions = new Questions(new Database(DATABASE_NAME));

const timer = new Timer(new Database(DATABASE_NAME));

export const quizGet = async (req: Request, res: Response): Promise<void> => {
    let quiz: Question[] = [];

    if (req.session.user && ! await timer.timeExists(parseInt(req.params.quizId), req.session.user)) {
        quiz = await questions.getQuestions(parseInt(req.params.quizId));

        timer.saveTime(parseInt(req.params.quizId), req.session.user);
    }

    res.json(quiz);
};

export const quizPost = (req: Request, res: Response): void => {
    if (!req.session.user)
        return;

    const answers: Answer[] = req.body;

    let spentSum = 0;

    for (const answer of answers)
        spentSum += answer.timeSpent;

    if (spentSum !== 1)
        return;

    res.redirect(`/results.html?id=${req.params.quizId}`);
};