(function() {
    // Hamburger menu
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', function() {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            toggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // Active nav link
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav-links a[href]');
    links.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage || href === currentPage.replace('.html', '') ||
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === '' && href === 'index.html')) {
            link.setAttribute('aria-current', 'page');
        }
        // Match hash links on index page
        if (currentPage === 'index.html' && href.startsWith('#')) {
            // Don't mark hash links as current
        }
    });

    // Publication filters (only on publications page)
    var filterBtns = document.querySelectorAll('.pub-filter-btn');
    var sections = document.querySelectorAll('.pub-section');
    if (filterBtns.length) {
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filter = btn.getAttribute('data-filter');
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                sections.forEach(function(s) {
                    if (filter === 'all' || s.getAttribute('data-category') === filter) {
                        s.removeAttribute('hidden');
                    } else {
                        s.setAttribute('hidden', '');
                    }
                });
            });
        });
    }

    // Dynamic footer year
    var footerP = document.querySelector('footer p');
    if (footerP) {
        footerP.innerHTML = '&copy; ' + new Date().getFullYear() + ' Jose A. Guridi';
    }
})();
