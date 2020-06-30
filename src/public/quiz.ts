import { Question } from '../questions';
import { Answer } from '../answer';

let answers: string[];
let currentListener: undefined | (() => void);

let timers: number[];
let timeSum: number;

let previousTime: Date;
let saveTime: () => void;

let start: Date;
let timer: undefined | NodeJS.Timeout;

let questions: Question[] = [];

const urlParams = new URLSearchParams(window.location.search);

function updateSubmitButton(): void {
    const submitButton = document.getElementById('submitQuiz') as HTMLButtonElement;

    for (const answer of answers) {
        if (answer === undefined || answer === '') {
            submitButton.disabled = true;
            return;
        }
    }

    submitButton.disabled = false;
}

function createAnswerListener(id: number): () => void {
    return function inputListener(): void {
        const answerField = document.getElementById('answer') as HTMLInputElement;
        answers[id - 1] = answerField.value;
        updateSubmitButton();
    };
}

function updateAnswerListener(id: number): void {
    const answerField = document.getElementById('answer') as HTMLInputElement;

    if (currentListener !== undefined)
        answerField.removeEventListener('input', currentListener);
    currentListener = createAnswerListener(id);
    answerField.addEventListener('input', currentListener);

    answerField.value = answers[id - 1];
}

function resetAnswers(n: number): void {
    answers = new Array(n);
    currentListener = undefined;
}

function updateTimer(id: number): void {
    saveTime();
    previousTime = new Date();

    saveTime = () => {
        const timeDifference = (new Date()).getTime() - previousTime.getTime();

        timers[id - 1] += timeDifference;
        timeSum += timeDifference;
    };
}

function resetTimers(n: number): void {
    timeSum = 0;

    timers = new Array(n);
    for (let i = 0; i < n; i++) {
        timers[i] = 0;
    }

    saveTime = () => undefined;
}

function displayTime(time: number): string {
    return (time / 1000).toPrecision(3).replace(/\.0+$/, '') + 's';
}

function displayIntegerTime(time: number): string {
    return Math.floor(time / 1000).toString() + 's';
}

function displayTimer(): void {
    document.getElementById('timer').innerHTML = displayIntegerTime((new Date()).getTime() - start.getTime());

    timer = setTimeout(displayTimer, 100);
}

function createTimer(): void {
    start = new Date();
    timer = setTimeout(displayTimer, 100);
}

function destroyTimer(): void {
    if (timer === undefined)
        return;

    clearTimeout(timer);
    timer = undefined;
}

const loadQuestions = async (): Promise<Question[]> => {
    return new Promise((resolve, reject) => {

        fetch('/quiz/' + urlParams.get('id')).then(async (data) => {
            const questions: Question[] = await data.json();
            resolve(questions);

        }, (reason) => {
            console.log('Error while fetching questions: ', reason);
            reject();
        });
    });
};

function displayQuestion(id: number): () => void {
    return () => {
        updateTimer(id);

        const question = questions[id - 1];

        document.getElementById('questionId').innerText = id.toString();
        document.getElementById('numberOfQuestions').innerText = questions.length.toString();
        document.getElementById('questionText').innerText = question.text;
        document.getElementById('penalty').innerText = displayTime(question.penalty);

        updateAnswerListener(id);

        const prevQuestion = document.getElementById('prevQuestion') as HTMLButtonElement;
        if (id > 1) {
            prevQuestion.disabled = false;
            prevQuestion.onclick = displayQuestion(id - 1);
        }
        else
            prevQuestion.disabled = true;

        const nextQuestion = document.getElementById('nextQuestion') as HTMLButtonElement;
        if (id < questions.length) {
            nextQuestion.disabled = false;
            nextQuestion.onclick = displayQuestion(id + 1);
        }
        else
            nextQuestion.disabled = true;
    };
}


function submitQuiz(): void {
    destroyTimer();
    saveTime();

    const finalAnswers: Answer[] = Array(questions.length);

    for (let i = 0; i < questions.length; i++)
        finalAnswers[i] = { answer: parseInt(answers[i]), timeSpent: timers[i] / timeSum };

    fetch('/quiz/' + urlParams.get('id'), {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(finalAnswers)
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    });

    // const quizArea = document.getElementById('quizArea') as HTMLDivElement;

    // quizArea.innerHTML = `
    // <table id="answers">
    //     <thead>
    //         <th>Question</th>
    //         <th>Your answer</th>
    //         <th>Correct answer</th>
    //         <th>Time Spent</th>
    //     </thead>
    // </table>
    // <p id="scoreLine">Your score: <span id="score">0s</span><br>`;

    // let score = timeSum;

    // const submittedAnswers = document.getElementById('answers') as HTMLParagraphElement;
    // for (let i = 0; i < questions.length; i++) {
    //     const question = questions[i];

    //     let newRow = '<tr><td>' + question.text + '</td><td>' + answers[i] + '</td>';
    //     if (parseInt(answers[i], 10) === question.correctAnswer) {
    //         newRow += '<td class="correct">✓</td>';
    //         newRow += '<td>' + displayTime(timers[i]) + '</td></tr>';
    //     }
    //     else {
    //         score += question.penalty;
    //         newRow += '<td class="wrong">' + question.correctAnswer + '</td>';
    //         newRow += '<td>' + displayTime(timers[i]) + '<span class="wrong"> + ' + displayTime(question.penalty) + '</span></td></tr>';
    //     }

    //     submittedAnswers.innerHTML += newRow;
    // }

    // document.getElementById('score').innerText = displayTime(score);
}

document.addEventListener('DOMContentLoaded', async () => {
    questions = await loadQuestions();

    const quizArea = document.getElementById('quizArea') as HTMLDivElement;

    if (questions.length === 0) {
        quizArea.innerHTML = `
        <p>
            Sorry, but you already solved that quiz or it doesn't exist.
        </p>
        <a href="quiz-list.html">
        <button class="submit"> Go back to quiz list </button>
        </a>`;
    }
    else {
        quizArea.innerHTML = `
        <p>
            Question <span id="questionId">0</span> out of <span id="numberOfQuestions">0</span>
        </p>
        <p id="timer">0s</p>
        <p>Penalty for wrong answer: <span id="penalty">0s</span></p>
        <p id="questionText"></p>
        Your answer: <input type="number" id="answer">
        <br>
        <button id="prevQuestion" disabled>Previous Question</button>
        <button id="nextQuestion" disabled>Next Question</button>
        <br>
        <button id="submitQuiz" disabled>Submit</button>`;

        document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
        resetAnswers(questions.length);
        resetTimers(questions.length);
        createTimer();

        displayQuestion(1)();
    }
});