document.getElementById("inputText").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchGoogle();
    }
});

function searchGoogle() {
    let query = document.getElementById("inputText").value.trim();
    
    if (query) {
        let googleSearchUrl = "https://www.google.com/search?q=" + encodeURIComponent(query);
        window.open(googleSearchUrl, "_blank");
    } else {
        alert("Please enter a search query.");
    }
}
