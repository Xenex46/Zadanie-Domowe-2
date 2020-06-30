import { Quiz } from '../quizes';

document.addEventListener('DOMContentLoaded', () => {
    fetch('/quiz-list').then(async (data) => {
        const quizList: Quiz[] = await data.json();

        if (quizList.length === 0) {
            document.getElementById('quizes').innerHTML = 'There are no quizes left for you to solve or you are not logged in';
        }
        else {
            let html = '<select name="quizesList" id="quizesSelect">';

            for (const quiz of quizList)
                html += `<option value="${quiz.id}">${quiz.name}</option>`;

            html += `</select>
            <br>
            <a id="quizLink" href="/quiz.html?id=${quizList[0].id}">
                <button class="submit"> Start the quiz! </button>
            </a>`;

            document.getElementById('quizes').innerHTML = html;

            const link = document.getElementById('quizLink') as HTMLLinkElement;
            const select = document.getElementById('quizesSelect') as HTMLSelectElement;

            select.addEventListener('input', () => {
                link.href = '/quiz.html?id=' + select.value;
            });
        }
    },
        () => {
            console.log('Failed to fetch quizes list');
        });
});