const API_URL =
  "https://script.google.com/macros/s/AKfycbyI9BcrBHCGzaNsxMiR2BOq68uRGagIcu8jq8HuWjJ6vjNmise3J_MLpT5D_U-rLF-4/exec";

let allRules = [];
let currentCategory = "ทั้งหมด";

function loadRules() {
  const callbackName = "rulesCallback_" + Date.now();

  window[callbackName] = function (data) {

    allRules = Array.isArray(data) ? data : [];

    buildCategoryMenu();
    render();

    delete window[callbackName];
  };

  const script = document.createElement("script");

  script.src =
    API_URL +
    "?callback=" +
    callbackName;

  script.onerror = function () {
    document.getElementById("status").textContent =
      "ไม่สามารถโหลดข้อมูลได้";
  };

  document.body.appendChild(script);
}


function buildCategoryMenu() {

  const menu = document.getElementById("categoryMenu");

  if (!menu) return;

  const categories = [
    ...new Set(
      allRules
        .map(rule => rule.category)
        .filter(Boolean)
    )
  ];

  menu.innerHTML = "";


  const allButton = document.createElement("button");

  allButton.className = "category-btn active";

  allButton.innerHTML =
    `<span>▦</span> กฎทั้งหมด`;

  allButton.onclick = function () {

    currentCategory = "ทั้งหมด";

    setActiveCategory(this);

    render();
  };

  menu.appendChild(allButton);


  categories.forEach(function (category) {

    const button =
      document.createElement("button");

    button.className = "category-btn";

    button.innerHTML =
      `<span>${getCategoryIcon(category)}</span> ${escapeHTML(category)}`;

    button.onclick = function () {

      currentCategory = category;

      setActiveCategory(this);

      render();
    };

    menu.appendChild(button);

  });

}


function getCategoryIcon(category) {

  const text =
    String(category).toLowerCase();

  if (
    text.includes("โรลเพลย์") ||
    text.includes("roleplay") ||
    text.includes("rp")
  ) {
    return "♟";
  }

  if (
    text.includes("อาชีพ") ||
    text.includes("job")
  ) {
    return "▣";
  }

  if (
    text.includes("รถ") ||
    text.includes("ยานพาหนะ") ||
    text.includes("vehicle")
  ) {
    return "▰";
  }

  if (
    text.includes("เซิร์ฟเวอร์") ||
    text.includes("server")
  ) {
    return "◈";
  }

  return "◆";
}


function setActiveCategory(activeButton) {

  document
    .querySelectorAll(".category-btn")
    .forEach(function (button) {

      button.classList.remove("active");

    });

  activeButton.classList.add("active");
}


function render() {

  const container =
    document.getElementById("rulesContainer");

  const status =
    document.getElementById("status");

  const count =
    document.getElementById("ruleCount");

  if (!container) return;


  let rules = allRules.filter(function (rule) {

    if (currentCategory === "ทั้งหมด") {
      return true;
    }

    return rule.category === currentCategory;

  });


  const searchInput =
    document.getElementById("searchInput");

  const search =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";


  if (search) {

    rules = rules.filter(function (rule) {

      return (
        String(rule.title || "")
          .toLowerCase()
          .includes(search)

        ||

        String(rule.body || "")
          .toLowerCase()
          .includes(search)

        ||

        String(rule.category || "")
          .toLowerCase()
          .includes(search)
      );

    });

  }


  /*
   * เรียงตาม "ลำดับ"
   * จาก Google Sheets
   */
  rules.sort(function (a, b) {

    return (
      Number(a.order || 999999) -
      Number(b.order || 999999)
    );

  });


  if (count) {

    count.textContent =
      `ทั้งหมด ${rules.length} กฎ`;

  }


  if (rules.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>

        <h3>ไม่พบกฎที่ค้นหา</h3>

        <p>ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
      </div>
    `;

    if (status) {
      status.textContent = "";
    }

    return;
  }


  container.innerHTML =
    rules.map(function (rule) {

      /*
       * ใช้ "ลำดับ" จาก Google Sheets
       */
      const ruleNumber =
        Number(rule.order);


      return `
        <article class="rule-card">

          <div class="rule-number">
            ${
              Number.isFinite(ruleNumber)
                ? ruleNumber
                : ""
            }
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

    }).join("");


  if (status) {

    status.textContent =
      `แสดง ${rules.length} กฎ`;

  }

}


function escapeHTML(value) {

  return String(value || "")

    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


document.addEventListener(
  "DOMContentLoaded",
  function () {

    const searchInput =
      document.getElementById("searchInput");

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        function () {
          render();
        }
      );

    }

    loadRules();

  }
);
