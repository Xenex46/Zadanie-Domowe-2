import { FullResults } from '../scores';
const urlParams = new URLSearchParams(window.location.search);

function displayTime(time: number): string {
    return (time / 1000).toPrecision(3).replace(/\.0+$/, '') + 's';
}

document.addEventListener('DOMContentLoaded', async () => {
    const quizArea = document.getElementById('quizArea') as HTMLDivElement;

    fetch('/results/' + urlParams.get('id')).then(async (data) => {
        const results: FullResults = await data.json();

        if (results.fullScore) {

            quizArea.innerHTML = `
        <table id="answers">
            <thead>
                <th>Question</th>
                <th>Your answer</th>
                <th>Correct answer</th>
                <th>Time Spent</th>
                <th>Avg time spent</th>
            </thead>
        </table>
        <p id="scoreLine">Your score: <span id="score">0s</span><br>
        <p id="leaderboard"></p>`;

            const submittedAnswers = document.getElementById('answers') as HTMLTableElement;

            for (let i = 0; i < results.results.length; i++) {
                const question = results.results[i];

                let newRow = '<tr><td>' + question.text + '</td><td>' + question.answer + '</td>';
                if (question.answer === question.correctAnswer) {
                    newRow += '<td class="correct">✓</td>';
                    newRow += '<td>' + displayTime(question.timeSpent) + '</td>';
                }
                else {
                    newRow += '<td class="wrong">' + question.correctAnswer + '</td>';
                    newRow += '<td>' + displayTime(question.timeSpent) + '<span class="wrong"> + ' + displayTime(question.penalty) + '</span></td>';
                }
                if (question.average)
                    newRow += '<td>' + displayTime(question.average) + '</td></tr>';
                else
                    newRow += '<td>N/A</td></tr>';

                submittedAnswers.innerHTML += newRow;
            }

            document.getElementById('score').innerText = displayTime(results.fullScore);

            if (results.bestScores.length > 0) {
                const leaderboard = document.getElementById('leaderboard') as HTMLParagraphElement;

                leaderboard.innerHTML = '<h1>Best scores</h1>';
                for (let i = 0; i < results.bestScores.length; i++) {
                    leaderboard.innerHTML += '<p>' + (i + 1).toString() + '. ' + results.bestScores[i].user + ' - ' + displayTime(results.bestScores[i].score) + '</p>';
                }
            }


        }
        else {
            quizArea.innerHTML = 'You haven\'t solved this quiz yet or you are not logged in';
        }
    }, (reason) => {
        console.log('Failed to fetch results', reason);
    });
});