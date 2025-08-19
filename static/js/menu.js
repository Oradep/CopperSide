document.addEventListener("DOMContentLoaded", function () {
    const sidebarMenu = document.querySelector(".sidebar .menu"); // Находим меню
    sidebarMenu.innerHTML = ""; // Очищаем старый список

    // Находим все секции с заголовками h2
    document.querySelectorAll("section").forEach(section => {
        const heading = section.querySelector("h2"); // Берём заголовок внутри секции
        if (heading) {
            const id = section.id || heading.textContent.trim().toLowerCase().replace(/\s+/g, "-"); // Получаем ID секции или генерируем его
            section.id = id; // Присваиваем ID (если его нет)

            const emoji = heading.querySelector(".emoji") ? heading.querySelector(".emoji").textContent : "📌"; // Берем эмодзи, если есть

            const menuItem = document.createElement("li");
            menuItem.innerHTML = `<a href="#${id}" data-icon="${emoji}">${heading.textContent.replace(emoji, "").trim()}</a>`;
            sidebarMenu.appendChild(menuItem);
        }
    });
});



