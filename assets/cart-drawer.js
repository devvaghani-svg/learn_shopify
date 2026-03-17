function refreshCartDrawer() {
  return fetch('/?sections=cart-drawer')
    .then((res) => res.json())
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data['cart-drawer'], 'text/html');

      // Update drawer content
      const newDrawer = doc.querySelector('cart-drawer');
      const currentDrawer = document.querySelector('cart-drawer');
      if (newDrawer && currentDrawer) {
        currentDrawer.innerHTML = newDrawer.innerHTML;
      }

      // Update cart count badge in header
      const countEl = document.querySelector('[data-cart-count]');
      if (countEl) {
        const newCount = doc.querySelector('[data-cart-count]');
        if (newCount) countEl.textContent = newCount.textContent;
      }
    });
}

class CartActions extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('[data-minus], [data-plus], [data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const quantity = parseInt(btn.dataset.quantity);
        const line = parseInt(this.dataset.line);

        // Disable all buttons on this item to prevent double clicks
        this.querySelectorAll('button').forEach((b) => (b.disabled = true));

        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, quantity })
        })
          .then((res) => res.json())
          .then(() => refreshCartDrawer())
          .catch(() => {
            // Re-enable on error
            this.querySelectorAll('button').forEach((b) => (b.disabled = false));
          });
      });
    });
  }
}

customElements.define('cart-actions', CartActions);

class CartDrawer extends HTMLElement {
  connectedCallback() {
    // Event delegation — works even after innerHTML refresh
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-drawer-close]')) this.close();
    });
    document.querySelector('[data-cart-overlay]')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  }

  open() {
    this.classList.remove('translate-x-full');
    document.querySelector('[data-cart-overlay]')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.classList.add('translate-x-full');
    document.querySelector('[data-cart-overlay]')?.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

customElements.define('cart-drawer', CartDrawer);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-cart-open-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('cart-drawer')?.open();
    });
  });
});
