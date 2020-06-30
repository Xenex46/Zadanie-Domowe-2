import { Request, Response } from 'express';

export const index = (req: Request, res: Response): void => {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    res.render('index', { user: req.session.user, csrfToken: req.csrfToken() });
};