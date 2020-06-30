import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { index } from './routers/home';
import { SESSION_SECRET, DATABASE_NAME } from './config';
import { loginGet, loginPost } from './routers/login';
import csurf from 'csurf';
import { logoutPost } from './routers/logout';
import { changePasswordGet, ChangePasswordPost } from './routers/changePassword';
import { Users } from './users';
import { Database } from 'sqlite3';
import { QuizListGet } from './routers/quizList';
import { quizGet, quizPost } from './routers/quiz';

const SQLiteStore = require('connect-sqlite3')(session);

const users = new Users(new Database(DATABASE_NAME));

const app = express();

const csrfProtection = csurf({ cookie: true });

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));
app.use(session({
    secret: SESSION_SECRET,
    store: new SQLiteStore({
        db: DATABASE_NAME
    })
}));


app.use((req, res, next) => {
    if (!req.session.user || !req.session.hash) {
        req.session.user = undefined;

        next();
        return;
    }

    users.checkUser(req.session.user, req.session.hash).then((loggedIn) => {
        if (!loggedIn)
            req.session.user = undefined;

        next();
    });
});

app.use(
    express.static(path.join(__dirname, '../public'))
);

app.use(
    express.static(path.join(__dirname, '../dist/public'))
);

app.get('/', csrfProtection, index);

app.get('/login', csrfProtection, loginGet);

app.post('/login', csrfProtection, loginPost);

app.post('/logout', csrfProtection, logoutPost);

app.get('/change-password', csrfProtection, changePasswordGet);

app.post('/change-password', csrfProtection, ChangePasswordPost);

app.get('/quiz-list', QuizListGet);

app.get('/quiz/:quizId(\\d+)', quizGet);

app.post('/quiz/:quizId(\\d+)', quizPost);

app.use((req, res) => {
    res.render('error');
});

export default app;