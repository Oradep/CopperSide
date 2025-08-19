document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const contentContainer = document.querySelector(".content");
    let currentIndex = -1;
    let matches = [];

    function clearHighlights() {
        contentContainer.querySelectorAll("mark").forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    function openDetails(element) {
        let parent = element.closest("details");
        while (parent) {
            parent.open = true;
            parent = parent.parentElement.closest("details");
        }
    }

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = searchInput.value.toLowerCase().trim();
            
            if (query === "") return;

            clearHighlights();
            matches = [];
            currentIndex = -1;

            const searchRegex = new RegExp(`(${query})`, "gi");

            function highlightText(node) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.toLowerCase().includes(query)) {
                    const span = document.createElement("span");
                    span.innerHTML = node.textContent.replace(searchRegex, '<mark>$1</mark>');
                    node.replaceWith(span);
                    span.querySelectorAll("mark").forEach(match => matches.push(match));
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.childNodes.forEach(highlightText);
                }
            }

            highlightText(contentContainer);
            
            if (matches.length > 0) {
                currentIndex = 0;
                openDetails(matches[currentIndex]);
                matches[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && matches.length > 0) {
            event.preventDefault();
            currentIndex = (currentIndex + 1) % matches.length;
            openDetails(matches[currentIndex]);
            matches[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target !== searchInput) {
            clearHighlights();
            searchInput.value = "";
        }
    });
});
