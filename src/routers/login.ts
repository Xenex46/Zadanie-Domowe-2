import { Request, Response } from 'express';
import { Users } from '../users';
import { Database } from 'sqlite3';
import { DATABASE_NAME } from '../config';
import { body } from 'express-validator';
import * as crypto from 'crypto';

const users = new Users(new Database(DATABASE_NAME));

export const loginGet = (req: Request, res: Response): void => {
    if (req.session.user) {
        res.redirect('/');
        return;
    }

    res.render('login', { csrfToken: req.csrfToken(), loginError: req.query.loginError });
};

export const loginPost = (req: Request, res: Response): void => {
    if (req.session.user) {
        res.redirect('/');
        return;
    }

    body(['login', 'password'], 'invalid login or password').trim().escape();

    const hash = crypto.createHash('sha256').update(req.body.login + req.body.password).digest('hex');

    users.checkUser(req.body.login, hash).then((loggedIn: boolean) => {
        if (loggedIn) {
            req.session.user = req.body.login;
            req.session.hash = hash;
            req.session.save((err) => {
                if (err)
                    console.log('Error while saving: ', err);
            });
            res.redirect('/');
        }
        else
            res.redirect('/login?loginError=true');
    }
    );
};