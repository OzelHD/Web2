/**
 * Sets up toggle visibility and drag functionality for a given button and its content.
 * @param {string} buttonId
 * @param {string} contentId
 */
function setupToggleAndDrag(buttonId, contentId) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);
    
    if (!button || !content) {
      console.warn(`Element with id "${buttonId}" or "${contentId}" not found.`);
      return;
    }
    
    // Toggle content visibility on button click.
    button.addEventListener("click", () => {
      content.style.display = (content.style.display === "block") ? "none" : "block";
    });
    
    // Set up drag functionality for the content.
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    
    content.addEventListener("mousedown", (e) => {
      isDragging = true;
      // Calculate the offset between the mouse pointer and the element's top-left corner.
      offsetX = e.clientX - content.offsetLeft;
      offsetY = e.clientY - content.offsetTop;
    });
    
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        content.style.left = (e.clientX - offsetX) + "px";
        content.style.top = (e.clientY - offsetY) + "px";
      }
    });
    
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }
  
  // Initialize Buttons
  document.addEventListener("DOMContentLoaded", function() {
    setupToggleAndDrag("menuButtonIND", "menuContentIND");

    setupToggleAndDrag("navigatorButton", "navigatorContent");

    setupToggleAndDrag("menuButtonGOL", "menuContentGOL");

    setupToggleAndDrag("menuButtonGTN", "menuContentGTN");
  });
  