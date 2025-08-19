document.addEventListener("DOMContentLoaded", () => {
    let isDragging = false;
    let autoScrollSpeed = 40; // Базовая скорость прокрутки
    let scrollZone = 30; // Насколько далеко от края должна срабатывать прокрутка
    let scrollInterval = null; // Интервал прокрутки

    function startAutoScroll(event) {
        if (!isDragging) return;

        let viewportHeight = window.innerHeight;
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let scrollHeight = document.documentElement.scrollHeight;

        let mouseY = event.clientY;
        let scrollStep = 0;

        if (mouseY < scrollZone) {
            scrollStep = -autoScrollSpeed * ((scrollZone - mouseY) / scrollZone);
        } else if (mouseY > viewportHeight - scrollZone) {
            scrollStep = autoScrollSpeed * ((mouseY - (viewportHeight - scrollZone)) / scrollZone);
        }

        if (scrollStep !== 0) {
            window.scrollBy(0, scrollStep);
        }
    }

    function enableAutoScroll() {
        if (!scrollInterval) {
            scrollInterval = setInterval(() => {
                startAutoScroll({ clientY: lastMouseY });
            }, 30); // Интервал обновления прокрутки
        }
    }

    function disableAutoScroll() {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }

    let lastMouseY = 0;
    document.addEventListener("mousemove", (event) => {
        lastMouseY = event.clientY;
    });

    // Включаем перетаскивание категорий
    new Sortable(document.getElementById("rules-container"), {
        animation: 150,
        handle: ".drag-handle",
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        swapThreshold: 0.65,
        scroll: false, // Выключаем встроенную прокрутку
        onStart: () => {
            isDragging = true;
            enableAutoScroll();
            collapseAllCategories()
        },
        onEnd: () => {
            isDragging = false;
            expandAllCategories();
            disableAutoScroll();
            updateIndexes();
            saveRules();
        }
    });

    // Включаем перетаскивание правил между категориями
    document.querySelectorAll(".rules-list").forEach(list => {
        new Sortable(list, {
            group: "rules",
            animation: 150,
            handle: ".drag-handle",
            ghostClass: "sortable-ghost",
            chosenClass: "sortable-chosen",
            scroll: false, // Выключаем встроенную прокрутку
            onStart: () => {
                isDragging = true;
                enableAutoScroll();
            },
            onEnd: () => {
                isDragging = false;
                disableAutoScroll();
                updateRuleIndexes();
                saveRules();
            }
        });
    });

    
    document.querySelectorAll(".rule-text, .category-title").forEach(textarea => {
        textarea.addEventListener("blur", saveRules);
    });

    updateIndexes();
});






function collapseAllCategories() {
    document.querySelectorAll(".rules-list").forEach(list => {
        list.style.display = "none";
    });
}

function expandAllCategories() {
    document.querySelectorAll(".rules-list").forEach(list => {
        list.style.display = "block";
    });
}

function updateIndexes() {
    document.querySelectorAll(".category").forEach((category, index) => {
        category.dataset.index = index;
        category.querySelector(".rules-list").dataset.category = index;
        let titleInput = category.querySelector(".category-title");
        titleInput.value = `${index + 1}. ${titleInput.value.replace(/^\d+\.\s*/, '')}`;
    });
    updateRuleIndexes();
}

// Обновление индексов после перемещения правил между категориями
function updateRuleIndexes() {
    document.querySelectorAll(".rules-list").forEach((list, categoryIndex) => {
        list.dataset.category = categoryIndex;
        list.querySelectorAll(".rule-item").forEach((rule, ruleIndex) => {
            rule.querySelector(".rule-id").textContent = `${categoryIndex + 1}.${ruleIndex + 1}`;
        });
    });
}

function addCategory() {
    let categoryIndex = document.querySelectorAll(".category").length;
    let newCategory = document.createElement("div");
    newCategory.className = "category";
    newCategory.dataset.index = categoryIndex;
    newCategory.innerHTML = `
        <div class="category-header">
            <span class="drag-handle">🟰</span>
            <textarea class="category-title">${categoryIndex + 1}. Новая категория</textarea>
            <button onclick="deleteCategory(this)">❌</button>
        </div>
        <ul class="rules-list" data-category="${categoryIndex}"></ul>
        <button onclick="addRule(this)">➕ Добавить правило</button>
    `;

    document.getElementById("rules-container").appendChild(newCategory);

    // Добавляем обработчик события blur для сохранения изменений при потере фокуса
    let titleInput = newCategory.querySelector(".category-title");
    titleInput.addEventListener("input", markAsChanged);
    titleInput.addEventListener("blur", saveRules);

    new Sortable(newCategory.querySelector(".rules-list"), {
        animation: 150,
        onEnd: () => {
            updateRuleIndexes();
            saveRules();
        }
    });

    updateIndexes();
    saveRules();
}


function deleteCategory(button) {
    button.closest(".category").remove();
    updateIndexes();
    saveRules();
}

function addRule(button) {
    let category = button.previousElementSibling;
    let ruleIndex = category.children.length + 1;
    let newRule = document.createElement("li");
    newRule.className = "rule-item";
    newRule.draggable = true;
    newRule.innerHTML = `
        <span class="drag-handle">🟰</span>
        <span class="rule-id">${category.dataset.category + 1}.${ruleIndex}</span>
        <textarea class="rule-text">Новое правило</textarea>
        <button onclick="deleteRule(this)">❌</button>
    `;

    category.appendChild(newRule);

    // Добавляем обработчик события blur для сохранения изменений при потере фокуса
    let ruleInput = newRule.querySelector(".rule-text");
    ruleInput.addEventListener("input", markAsChanged);
    ruleInput.addEventListener("blur", saveRules);
    ruleInput.addEventListener("keydown", handleEnter);

    updateRuleIndexes();
    saveRules();
}



function deleteRule(button) {
    let rule = button.parentElement;
    rule.parentElement.removeChild(rule);
    updateRuleIndexes();
    saveRules();
}

function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        event.target.blur(); // Убираем фокус => сработает onblur
    }
}


function markAsChanged() {
    document.getElementById("save-indicator").classList.add("hidden");
}

function saveRules() {
    let categories = [];
    document.querySelectorAll(".category").forEach((category, categoryIndex) => {
        let rules = [];
        category.querySelectorAll(".rule-item").forEach((rule, ruleIndex) => {
            rules.push({
                id: `${categoryIndex + 1}.${ruleIndex + 1}`,
                text: rule.querySelector(".rule-text").value
            });
        });
        categories.push({
            title: category.querySelector(".category-title").value.replace(/^\d+\.\s*/, ''),
            rules: rules
        });
    });

    fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories })
    }).then(res => res.json()).then(data => {
        if (data.status === "success") {
            showSaveIndicator();
        } else {
            console.error("Ошибка сохранения: " + data.message);
        }
    });
}

function showSaveIndicator() {
    let indicator = document.getElementById("save-indicator");
    indicator.classList.remove("hidden");
    setTimeout(() => indicator.classList.add("hidden"), 2000);
}
