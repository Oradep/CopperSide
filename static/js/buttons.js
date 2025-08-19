document.querySelector("#ip-copy-button").addEventListener("click", function() {
    const ipText = document.querySelector("#ip-copy-button").innerText;
    navigator.clipboard.writeText(ipText).then(function() {
        const feedback = document.querySelector("#copy-feedback");
        feedback.textContent = 'Скопировано!'; // Появляется сообщение
        feedback.style.display = 'inline'; // Показываем сообщение
        setTimeout(function() {
            feedback.style.display = 'none'; // Скрываем сообщение через 2 секунды
        }, 1000);
    }).catch(function(error) {
        console.error('Ошибка при копировании:', error);
    });
});


document.querySelector("#ip-copy-button-header").addEventListener("click", function() {
    const ipText = "copperside.online";
    navigator.clipboard.writeText(ipText)
});
