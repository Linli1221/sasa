import NovelAPI from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('generate-chapter-btn').addEventListener('click', function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const genre = document.getElementById('genre').value;
        const worldDetails = document.getElementById('world-details').value;
        const plotOutline = document.getElementById('plot-outline').value;
        const selectedStyle = document.getElementById('style-library').value;

        // In a real application, you would have more complex character data handling
        const characters = Array.from(document.querySelectorAll('.character-card')).map(card => {
            return card.querySelector('h3').textContent;
        }).join(', ');

        const chaptersOutput = document.getElementById('chapters-output');
        const chapterNumber = chaptersOutput.children.length + 1;

        const chapterContent = `
            <h3>Chapter ${chapterNumber}</h3>
            <p>This is a placeholder for the generated content of chapter ${chapterNumber}.</p>
            <p>Based on the world of ${genre} and the story of "${title}".</p>
            <p>Style: ${selectedStyle}</p>
        `;

        const chapterElement = document.createElement('div');
        chapterElement.classList.add('chapter');
        chapterElement.innerHTML = chapterContent;
        chaptersOutput.appendChild(chapterElement);
    });

    document.getElementById('add-character-btn').addEventListener('click', () => {
        const characterList = document.getElementById('characters-list');
        const charId = `char_${Date.now()}`;
        const characterCard = document.createElement('div');
        characterCard.classList.add('character-card');
        characterCard.innerHTML = `
            <h3>New Character</h3>
            <input type="text" placeholder="Name" class="char-name">
            <textarea placeholder="Description"></textarea>
            <textarea placeholder="Character Development Arc"></textarea>
            <button class="remove-char-btn">Remove</button>
        `;
        characterList.appendChild(characterCard);

        characterCard.querySelector('.remove-char-btn').addEventListener('click', (e) => {
            e.target.closest('.character-card').remove();
        });
    });

    document.getElementById('add-foreshadowing-btn').addEventListener('click', () => {
        const foreshadowingList = document.getElementById('foreshadowing-list');
        const foreshadowingItem = document.createElement('div');
        foreshadowingItem.classList.add('foreshadowing-item');
        foreshadowingItem.innerHTML = `
            <input type="text" placeholder="Foreshadowing element">
            <select>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
            </select>
            <button class="remove-foreshadowing-btn">Remove</button>
        `;
        foreshadowingList.appendChild(foreshadowingItem);

        foreshadowingItem.querySelector('.remove-foreshadowing-btn').addEventListener('click', (e) => {
            e.target.closest('.foreshadowing-item').remove();
        });
    });

    document.getElementById('semantic-search').addEventListener('search', async (e) => {
        const query = e.target.value;
        if (!query) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }

        const results = await NovelAPI.search(query, {}); // Empty context for now
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = results.map(r => `<div class="search-result">${r.match} (Score: ${r.score})</div>`).join('');
    });

    document.getElementById('proofread-btn').addEventListener('click', async () => {
        const chapters = Array.from(document.querySelectorAll('#chapters-output .chapter p')).map(p => p.textContent).join('\n');
        const issues = await NovelAPI.proofread(chapters);
        const issuesContainer = document.getElementById('proofreading-output');
        if (issues.length > 0) {
            issuesContainer.innerHTML = issues.map(i => `<div class="issue ${i.type}">${i.text}</div>`).join('');
        } else {
            issuesContainer.innerHTML = "<div class='issue no-issues'>No issues found.</div>";
        }
    });
});