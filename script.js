const API_URL = 'https://script.google.com/macros/s/AKfycbyI9BcrBHCGzaNsxMiR2BOq68uRGagIcu8jq8HuJw6JvjNmise3J_MLpT5D_U-rLF-4/exec';

let allRules = [];
let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {

    document
        .getElementById('searchInput')
        .addEventListener('input', render);

    loadRules();

});


function loadRules() {

    const callbackName =
        'whatUniversalRules_' + Date.now();

    window[callbackName] = function(data) {

        allRules = Array.isArray(data)
            ? data
            : [];

        buildCategoryMenu();
        render();

        delete window[callbackName];

        const oldScript =
            document.getElementById('api-script');

        if (oldScript) {
            oldScript.remove();
        }

    };


    const script =
        document.createElement('script');

    script.id = 'api-script';

    script.src =
        API_URL +
        '?callback=' +
        encodeURIComponent(callbackName);

    script.onerror = function() {

        document.getElementById('ruleCount').textContent =
            'เกิดข้อผิดพลาด';

        document.getElementById('rulesContainer').innerHTML =
            '<div class="empty">ไม่สามารถเชื่อมต่อ Google Apps Script ได้</div>';

        delete window[callbackName];

        script.remove();

    };


    document.body.appendChild(script);

}


function buildCategoryMenu() {

    const menu =
        document.getElementById('categoryMenu');

    const categories =
        [...new Set(
            allRules
                .map(rule => rule.category)
                .filter(Boolean)
        )];


    menu.innerHTML = `
        <button class="menu-item active" data-category="all">
            กฎทั้งหมด
        </button>
    `;


    categories.forEach(category => {

        const button =
            document.createElement('button');

        button.className = 'menu-item';

        button.textContent = category;

        button.dataset.category = category;

        button.addEventListener('click', () => {

            selectedCategory = category;

            setActive(button);

            render();

        });

        menu.appendChild(button);

    });


    const allButton =
        menu.querySelector(
            '[data-category="all"]'
        );

    allButton.addEventListener('click', () => {

        selectedCategory = 'all';

        setActive(allButton);

        render();

    });

}


function setActive(button) {

    document
        .querySelectorAll('.menu-item')
        .forEach(item => {

            item.classList.remove('active');

        });

    button.classList.add('active');

}


function render() {

    const searchInput =
        document.getElementById('searchInput');

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        allRules.filter(rule => {

            const categoryMatch =
                selectedCategory === 'all' ||
                rule.category === selectedCategory;


            const searchMatch =
                !query ||
                `${rule.category} ${rule.title} ${rule.body}`
                    .toLowerCase()
                    .includes(query);


            return categoryMatch && searchMatch;

        });


    document.getElementById('ruleCount').textContent =
        `${filtered.length} ข้อ`;


    document.getElementById('rulesContainer').innerHTML =
        filtered.length

            ? filtered.map(rule => `

                <article class="rule-card">

                    <div class="rule-meta">

                        <span class="number">
                            #${escapeHTML(rule.id)}
                        </span>

                        <span class="badge">
                            ${escapeHTML(rule.category)}
                        </span>

                    </div>


                    <div class="rule-title">
                        ${escapeHTML(rule.title)}
                    </div>


                    <div class="rule-body">
                        ${escapeHTML(rule.body)}
                    </div>

                </article>

            `).join('')

            : `
                <div class="empty">
                    ไม่พบกฎที่ค้นหา
                </div>
            `;

}


function escapeHTML(value) {

    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

}
