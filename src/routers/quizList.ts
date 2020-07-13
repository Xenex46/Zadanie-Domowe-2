import { Request, Response } from 'express';
import { Quizes, QuizLists } from '../quizes';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';

const quizes = new Quizes(new Database(DATABASE_NAME));

export const QuizListGet = async (req: Request, res: Response): Promise<void> => {
    let quizList: QuizLists = { quizes: [], results: [] };

    if (req.session.user) {
        quizList = await quizes.getQuizList(req.session.user);
    }

    res.json(quizList);
};