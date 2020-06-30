import { Request, Response } from 'express';
import { Users } from '../users';
import { DATABASE_NAME } from '../config';
import { Database } from 'sqlite3';
import { body } from 'express-validator';

const users = new Users(new Database(DATABASE_NAME));

export const changePasswordGet = (req: Request, res: Response): void => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    res.render('changePassword', { csrfToken: req.csrfToken(), confirmError: req.query.confirmError });
};

export const ChangePasswordPost = (req: Request, res: Response): void => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    body(['newPassword', 'newPasswordConfirm']).trim().escape();

    if (req.body.newPassword !== req.body.newPasswordConfirm) {
        res.redirect('/change-password?confirmError=True');
        return;
    }

    users.changePassword(req.session.user, req.body.newPassword).then(() => res.redirect('/login'));
};