import { Request, Response } from 'express';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';
import { getResults, FullResults } from '../scores';

export const resultsGet = async (req: Request, res: Response): Promise<void> => {
    const quizId = parseInt(req.params.quizId);
    const user = req.session.user;

    let data: FullResults = { results: [], fullScore: undefined, bestScores: [] };

    if (user) {
        const db = new Database(DATABASE_NAME);

        data = await getResults(db, quizId, user);
    }

    res.json(data);
};