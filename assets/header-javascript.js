(function () {
    'use strict';

    var hamburgerBtn = document.querySelector('[data-menu-toggle]');
    var closeBtn = document.querySelector('[data-menu-close]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    var mobileOverlay = document.querySelector('[data-mobile-overlay]');
    var submenuToggles = document.querySelectorAll('[data-submenu-toggle]');
    var body = document.body;

    if (!hamburgerBtn || !mobileMenu || !mobileOverlay) return;

    function openMenu() {
        mobileMenu.style.display = 'block';
        // Force reflow before adding transition class
        void mobileMenu.offsetWidth;
        mobileMenu.style.transform = 'translateX(0)';
        mobileOverlay.style.display = 'block';
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.style.transform = '';
        mobileOverlay.style.display = '';
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';

        // Reset all submenus
        submenuToggles.forEach(function (toggle) {
            var menuItem = toggle.closest('li');
            var submenu = menuItem ? menuItem.querySelector('ul') : null;
            var chevron = toggle.querySelector('svg');

            if (submenu) {
                submenu.style.maxHeight = '';
            }
            if (chevron) {
                chevron.style.transform = '';
            }
            toggle.setAttribute('aria-expanded', 'false');
        });

        setTimeout(function () {
            mobileMenu.style.display = '';
        }, 300);
    }

    hamburgerBtn.addEventListener('click', openMenu);

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    mobileOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.style.display === 'block') {
            closeMenu();
        }
    });

    submenuToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var menuItem = this.closest('li');
            var submenu = menuItem ? menuItem.querySelector('ul') : null;
            var chevron = this.querySelector('svg');
            var isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Close all other submenus
            submenuToggles.forEach(function (otherToggle) {
                if (otherToggle !== toggle) {
                    var otherItem = otherToggle.closest('li');
                    var otherSubmenu = otherItem ? otherItem.querySelector('ul') : null;
                    var otherChevron = otherToggle.querySelector('svg');

                    if (otherSubmenu) otherSubmenu.style.maxHeight = '';
                    if (otherChevron) otherChevron.style.transform = '';
                    otherToggle.setAttribute('aria-expanded', 'false');
                }
            });

            if (isExpanded) {
                if (submenu) submenu.style.maxHeight = '';
                if (chevron) chevron.style.transform = '';
                this.setAttribute('aria-expanded', 'false');
            } else {
                if (submenu) submenu.style.maxHeight = submenu.scrollHeight + 'px';
                if (chevron) chevron.style.transform = 'rotate(180deg)';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();
