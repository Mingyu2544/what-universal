const SHEET_ID =
  "11BbYmUtEPbTzrJC6VHFP7vbdlYhjIvq7EN-xVjaFc8U";

const SHEET_NAME = "Rules";

let allRules = [];
let currentCategory = "ทั้งหมด";


// ========================================
// โหลดข้อมูลจาก Google Sheets
// ========================================

async function loadRules() {

  const status =
    document.getElementById("status");

  try {

    if (status) {
      status.textContent =
        "กำลังโหลดข้อมูล...";
    }


    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


    const response =
      await fetch(url);


    if (!response.ok) {
      throw new Error(
        "ไม่สามารถโหลด Google Sheets ได้"
      );
    }


    const csv =
      await response.text();


    allRules =
      parseCSV(csv);


    buildCategoryMenu();
    render();


  } catch (error) {

    console.error(error);


    if (status) {

      status.textContent =
        "ไม่สามารถโหลดข้อมูลได้";

    }

  }

}


// ========================================
// CSV Parser
// ========================================

function parseCSV(text) {

  const rows = [];

  let row = [];
  let cell = "";
  let insideQuotes = false;


  for (let i = 0; i < text.length; i++) {

    const char = text[i];
    const next = text[i + 1];


    if (char === '"' && insideQuotes && next === '"') {

      cell += '"';

      i++;

      continue;
    }


    if (char === '"') {

      insideQuotes =
        !insideQuotes;

      continue;
    }


    if (char === "," && !insideQuotes) {

      row.push(cell);

      cell = "";

      continue;
    }


    if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {

      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }


      row.push(cell);

      rows.push(row);

      row = [];

      cell = "";

      continue;
    }


    cell += char;

  }


  if (cell !== "" || row.length > 0) {

    row.push(cell);

    rows.push(row);

  }


  if (rows.length <= 1) {
    return [];
  }


  // ลบ Header
  rows.shift();


  return rows

    .filter(function(row) {

      return row.some(function(cell) {

        return String(cell).trim() !== "";

      });

    })

    .map(function(row) {

      return {

        id:
          row[0] || "",

        category:
          row[1] || "",

        title:
          row[2] || "",

        body:
          row[3] || "",

        order:
          Number(row[4]) || 999999

      };

    })

    .sort(function(a, b) {

      return a.order - b.order;

    });

}


// ========================================
// สร้างเมนูหมวดหมู่
// ========================================

function buildCategoryMenu() {

  const menu =
    document.getElementById(
      "categoryMenu"
    );

  if (!menu) return;


  const categories = [

    ...new Set(

      allRules

        .map(function(rule) {

          return rule.category;

        })

        .filter(Boolean)

    )

  ];


  menu.innerHTML = "";


  const allButton =
    document.createElement("button");


  allButton.className =
    "category-btn active";


  allButton.innerHTML =
    `<span>▦</span> กฎทั้งหมด`;


  allButton.onclick =
    function() {

      currentCategory =
        "ทั้งหมด";

      setActiveCategory(this);

      render();

    };


  menu.appendChild(allButton);


  categories.forEach(
    function(category) {

      const button =
        document.createElement("button");


      button.className =
        "category-btn";


      button.innerHTML =
        `<span>${getCategoryIcon(category)}</span> ${escapeHTML(category)}`;


      button.onclick =
        function() {

          currentCategory =
            category;

          setActiveCategory(this);

          render();

        };


      menu.appendChild(button);

    }
  );

}


// ========================================
// Icon หมวดหมู่
// ========================================

function getCategoryIcon() {
  return "●";
}


// ========================================
// Active Category
// ========================================

function setActiveCategory(activeButton) {

  document
    .querySelectorAll(".category-btn")
    .forEach(function(button) {

      button.classList.remove(
        "active"
      );

    });


  activeButton.classList.add(
    "active"
  );

}


// ========================================
// Render
// ========================================

function render() {

  const container =
    document.getElementById(
      "rulesContainer"
    );


  const status =
    document.getElementById(
      "status"
    );


  const count =
    document.getElementById(
      "ruleCount"
    );


  if (!container) return;


  let rules =
    allRules.filter(
      function(rule) {

        if (
          currentCategory ===
          "ทั้งหมด"
        ) {

          return true;

        }


        return (
          rule.category ===
          currentCategory
        );

      }
    );


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  if (search) {

    rules =
      rules.filter(
        function(rule) {

          return (

            String(
              rule.title || ""
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              rule.body || ""
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              rule.category || ""
            )
              .toLowerCase()
              .includes(search)

          );

        }
      );

  }


  if (count) {

    count.textContent =
      `ทั้งหมด ${rules.length} กฎ`;

  }


  if (rules.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ⌕
        </div>

        <h3>
          ไม่พบกฎที่ค้นหา
        </h3>

        <p>
          ลองเปลี่ยนหมวดหมู่หรือคำค้นหา
        </p>

      </div>

    `;


    if (status) {

      status.textContent = "";

    }


    return;

  }


  container.innerHTML =

    rules.map(
      function(rule, index) {

        return `

          <article class="rule-card">

            <div class="rule-number">
              ${index + 1}
            </div>

            <div class="rule-content">

              <div class="rule-category">
                ${escapeHTML(rule.category)}
              </div>

              <h3>
                ${escapeHTML(rule.title)}
              </h3>

              <p>
                ${escapeHTML(rule.body)}
              </p>

            </div>

          </article>

        `;

      }
    ).join("");


  if (status) {

    status.textContent =
      `แสดง ${rules.length} กฎ`;

  }

}


// ========================================
// ป้องกัน HTML
// ========================================

function escapeHTML(value) {

  return String(value || "")

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ========================================
// Search
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const searchInput =
      document.getElementById(
        "searchInput"
      );


    if (searchInput) {

      searchInput.addEventListener(
        "input",
        function() {

          render();

        }
      );

    }


    loadRules();

  }
);
