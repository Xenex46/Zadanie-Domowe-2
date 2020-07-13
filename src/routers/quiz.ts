import { Request, Response } from 'express';
import { Question, Questions } from '../questions';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';
import { Timer } from '../timers';

const questions = new Questions(new Database(DATABASE_NAME));

const timer = new Timer(new Database(DATABASE_NAME));

export const quizGet = (req: Request, res: Response): void => {
    res.setHeader('CSRF-Header', req.csrfToken());
    res.send();
};

export const quizPost = async (req: Request, res: Response): Promise<void> => {
    let quiz: Question[] = [];

    if (req.session.user && ! await timer.timeExists(parseInt(req.params.quizId), req.session.user)) {
        quiz = await questions.getQuestions(parseInt(req.params.quizId));

        timer.saveTime(parseInt(req.params.quizId), req.session.user);
    }

    res.json(quiz);
};
