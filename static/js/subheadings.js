document.addEventListener("DOMContentLoaded", () => {
    const subheadingList = document.getElementById("subheading-list");
    const subheadingContainer = document.querySelector(".subheadings");
    const sections = document.querySelectorAll(".content section");
    let currentSection = null;
    const HEADER_OFFSET = 110; // Отступ для хедера

    if (!sections.length) return;

    function cleanText(text) {
        return text
          .replace(/^[^\wА-Яа-я()]+|[^\wА-Яа-я()]+$/g, "") // разрешаем ( и )
          .replace(/^\d+\.\s*/, "")
          .trim();
      }
      
    
    function updateSubheadings(section) {
        if (!section || section === currentSection) return;

        subheadingList.innerHTML = "";
        currentSection = section;

        const subheadings = section.querySelectorAll("h3");
        let hasContent = false;

        if (section.id === "rules" || section.id === "mechanics") {
            const categories = section.querySelectorAll(".expand-section summary");
            if (categories.length > 0) {
                categories.forEach((summary, index) => {
                    const parentDetails = summary.closest("details");
                    if (parentDetails) {
                        const id = parentDetails.id || `expand-category-${section.id}-${index}`;
                        parentDetails.id = id;
                        const listItem = document.createElement("li");
                        listItem.innerHTML = `<a href="#${id}">${cleanText(summary.textContent)}</a>`;
                        subheadingList.appendChild(listItem);
                    }
                });
                hasContent = true;
            }
        } else if (subheadings.length > 0) {
            subheadings.forEach((h3, index) => {
                const id = h3.id || `subheading-${section.id}-${index}`;
                h3.id = id;
                const listItem = document.createElement("li");
                listItem.innerHTML = `<a href="#${id}">${cleanText(h3.textContent)}</a>`;
                subheadingList.appendChild(listItem);
            });
            hasContent = true;
        }

        subheadingContainer.style.display = hasContent ? "block" : "none";

        attachSubheadingClickEvents();
    }

    function findCurrentSection() {
        let bestMatch = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isFullyVisible = rect.top <= HEADER_OFFSET && rect.bottom > HEADER_OFFSET;

            if (isFullyVisible) {
                bestMatch = section;
            }
        });

        if (bestMatch && bestMatch !== currentSection) {
            updateSubheadings(bestMatch);
        }
    }

    function attachSubheadingClickEvents() {
        const subheadingLinks = subheadingList.querySelectorAll("a");
        subheadingLinks.forEach(link => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const targetId = link.getAttribute("href").replace("#", "");
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.pushState(null, null, `#${targetId}`);

                    if (targetElement.tagName.toLowerCase() === "details") {
                        targetElement.open = true;
                    }
                }
            });
        }); 
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                findCurrentSection();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll);

    findCurrentSection();
});
