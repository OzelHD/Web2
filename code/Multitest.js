// Accordion functionality
document.querySelectorAll('.accordion-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      panel.classList.toggle('active');
    });
  });
  
  // Sidebar toggle logic
  const toggleBtn = document.querySelector('.toggle-sidebar-btn');
  const sidebar = document.querySelector('.sidebar');
  
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // Toggle a class on the body so main content can respond
    document.body.classList.toggle('collapsed');
  
    /*// Update button text based on sidebar state
    if (sidebar.classList.contains('collapsed')) {
      toggleBtn.textContent = '>';
    } else {
      toggleBtn.textContent = '<';
    }
      */
  });
  