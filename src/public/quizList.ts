import { Quiz, QuizLists } from '../quizes';

document.addEventListener('DOMContentLoaded', () => {
    fetch('/quiz-list').then(async (data) => {
        const lists: QuizLists = await data.json();
        const quizes: Quiz[] = lists.quizes;

        if (quizes.length === 0) {
            document.getElementById('quizes').innerHTML = 'There are no quizes left for you to solve or you are not logged in';
        }
        else {
            let html = '<select name="quizesList" id="quizesSelect" class="quizSelect">';

            for (const quiz of quizes)
                html += `<option value="${quiz.id}">${quiz.name}</option>`;

            html += `</select>
            <br>
            <a id="quizLink" href="/quiz.html?id=${quizes[0].id}">
                <button class="submit"> Start the quiz! </button>
            </a>`;

            document.getElementById('quizes').innerHTML = html;

            const link = document.getElementById('quizLink') as HTMLLinkElement;
            const select = document.getElementById('quizesSelect') as HTMLSelectElement;

            select.addEventListener('input', () => {
                link.href = '/quiz.html?id=' + select.value;
            });
        }

        const results: Quiz[] = lists.results;
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 'You have not completed any quiz';
        }
        else {
            let html = '<select name="resultsList" id="resultsSelect" class="quizSelect">';

            for (const quiz of results)
                html += `<option value="${quiz.id}">${quiz.name}</option>`;

            html += `</select>
            <br>
            <a id="resultLink" href="/results.html?id=${results[0].id}">
                <button class="submit"> View results </button>
            </a>`;

            document.getElementById('results').innerHTML = html;

            const link = document.getElementById('resultLink') as HTMLLinkElement;
            const select = document.getElementById('resultsSelect') as HTMLSelectElement;

            select.addEventListener('input', () => {
                link.href = '/results.html?id=' + select.value;
            });
        }
    },
        () => {
            console.log('Failed to fetch quizes list');
        });
});