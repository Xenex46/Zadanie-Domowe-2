import { Request, Response } from 'express';

export const logoutPost = (req: Request, res: Response): void => {

    req.session.user = undefined;
    req.session.save((err) => {
        if (err)
            console.log('Error while saving: ', err);
    });

    res.redirect('/login');
};