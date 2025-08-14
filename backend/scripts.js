/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Prevent real submissions/click actions in demo mode; show a friendly notice instead
    const isDemo = true;
    if (isDemo) {
        const ensureDemoModal = () => {
            if (document.getElementById('demoNoticeModal')) return;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
            <div class="modal fade" id="demoNoticeModal" tabindex="-1" aria-labelledby="demoNoticeLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="demoNoticeLabel">Demo Notice</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    This is a demo environment. Actions like submitting forms, sending emails, or modifying records are disabled.
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Okay</button>
                  </div>
                </div>
              </div>
            </div>`;
            document.body.appendChild(wrapper.firstElementChild);
        };
        const showDemoNotice = () => {
            try {
                ensureDemoModal();
                const modalEl = document.getElementById('demoNoticeModal');
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            } catch {
                alert('This is a demo. Actions are disabled.');
            }
        };

        // Block form submits (capture phase to beat other handlers)
        document.addEventListener('submit', function (e) {
            const form = e.target;
            if (form && (form.hasAttribute('data-allow-submit') || form.closest('[data-allow-submit]'))) return;
            if (form && (form.hasAttribute('data-demo-block') || form.closest('[data-demo-block]'))) {
                // explicit block
            }
            e.preventDefault();
            e.stopPropagation();
            try { e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch {}
            showDemoNotice();
        }, true);

        // Block action buttons and links commonly used for table/email/register actions
        document.addEventListener('click', function (e) {
            const target = e.target.closest('button, a, input[type="submit"], input[type="button"]');
            if (!target) return;

            // Allow navbar toggles, dropdowns, and explicit exemptions
            if (
                target.classList.contains('navbar-toggler') ||
                target.hasAttribute('data-bs-toggle') ||
                target.hasAttribute('data-allow-submit') ||
                target.closest('[data-allow-submit]')
            ) {
                return;
            }

            // Explicitly block any element/ancestor marked data-demo-block
            if (target.hasAttribute('data-demo-block') || target.closest('[data-demo-block]')) {
                e.preventDefault();
                e.stopPropagation();
                try { e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch {}
                showDemoNotice();
                return;
            }

            // Allow pure navigation links that are not styled as buttons and are in navbars
            if (target.tagName === 'A') {
                const isNavLink = target.classList.contains('nav-link') || target.classList.contains('navbar-brand');
                const isHash = target.getAttribute('href') && target.getAttribute('href').startsWith('#');
                if (isNavLink || isHash) return;
            }

            // If click originates from inside tables or from known action buttons, block in demo
            const isTableAction = !!target.closest('table');
            const isActionBtn = target.matches('.btn, .edit-btn, .save-btn, #sendEmailButton, [type="submit"]');
            if (isTableAction || isActionBtn) {
                e.preventDefault();
                e.stopPropagation();
                try { e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch {}
                showDemoNotice();
            }
        }, true);
    }
    
    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});