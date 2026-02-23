// Mobile Menu Toggle Script
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbarNav = document.querySelector('.navbar-nav');
    
    if (mobileMenuToggle && navbarNav) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navbarNav.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navbarNav.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                navbarNav.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navbarNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navbarNav.classList.remove('active');
            });
        });
    }
});
