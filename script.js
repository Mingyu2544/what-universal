const API_URL =
  'https://script.google.com/macros/s/AKfycbyI9BcrBHCGzaNsxMiR2BOq68uRGagIcu8jq8HuJw6JvjNmise3J_MLpT5D_U-rLF-4/exec';

let allRules = [];
let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', function () {

    loadRules();

});


function loadRules() {

    const callbackName =
        'loadRules_' + Date.now();

    window[callbackName] = function (data) {

        console.log('API DATA:', data);

        allRules = data;

        buildCategoryMenu();

        render();

        delete window[callbackName];

        const script =
            document.getElementById('api-script');

        if (script) {
            script.remove();
        }

    };


    const script =
        document.createElement('script');

    script.id = 'api-script';

    script.src =
        API_URL +
        '?callback=' +
        callbackName;

    script.onerror = function () {

        document.getElementById('ruleCount').textContent =
            'เชื่อมต่อ API ไม่สำเร็จ';

        document.getElementById('rulesContainer').innerHTML =
            `
            <div class="empty">
                ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้
            </div>
            `;

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
                .map(function (rule) {
                    return rule.category;
                })
                .filter(Boolean)
        )];


    menu.innerHTML = `
        <button
            class="menu-item active"
            data-category="all"
        >
            <span class="menu-icon">▦</span>
            <span>กฎทั้งหมด</span>
        </button>
    `;


    categories.forEach(function (category) {

        const button =
            document.createElement('button');

        button.className = 'menu-item';

        button.dataset.category = category;


        const icon =
            getCategoryIcon(category);


        button.innerHTML = `
            <span class="menu-icon">
                ${icon}
            </span>

            <span>
                ${escapeHTML(category)}
            </span>
        `;


        button.addEventListener(
            'click',
            function () {

                selectedCategory = category;

                setActive(button);

                render();

            }
        );


        menu.appendChild(button);

    });


    const allButton =
        menu.querySelector(
            '[data-category="all"]'
        );


    allButton.addEventListener(
        'click',
        function () {

            selectedCategory = 'all';

            setActive(allButton);

            render();

        }
    );

}


function getCategoryIcon(category) {

    const name =
        String(category)
            .toLowerCase();


    if (
        name.includes('roleplay') ||
        name.includes('โรลเพลย์')
    ) {
        return '◈';
    }


    if (
        name.includes('อาชีพ')
    ) {
        return '⚒';
    }


    if (
        name.includes('ยานพาหนะ') ||
        name.includes('รถ')
    ) {
        return '◉';
    }


    if (
        name.includes('เซิร์ฟเวอร์') ||
        name.includes('server')
    ) {
        return '◆';
    }


    return '◇';

}

function setActive(button) {

    document
        .querySelectorAll('.menu-item')
        .forEach(function (item) {

            item.classList.remove('active');

        });

    button.classList.add('active');

}


function render() {

    const searchInput =
        document.getElementById('searchInput');

    const query =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : '';


    const filtered =
        allRules.filter(function (rule) {

            const categoryMatch =
                selectedCategory === 'all' ||
                rule.category === selectedCategory;


            const searchMatch =
                !query ||
                (
                    rule.category +
                    ' ' +
                    rule.title +
                    ' ' +
                    rule.body
                )
                .toLowerCase()
                .includes(query);


            return categoryMatch && searchMatch;

        });


    document.getElementById('ruleCount').textContent =
        filtered.length + ' ข้อ';


    document.getElementById('rulesContainer').innerHTML =
        filtered.length

            ? filtered.map(function (rule) {

                return `
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
                `;

            }).join('')

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
