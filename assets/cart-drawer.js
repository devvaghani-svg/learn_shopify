class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.querySelector('[data-cart-drawer-close]')?.addEventListener('click', () => this.close());
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

// Bind open triggers after DOM is ready — more reliable than connectedCallback
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-cart-open-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('cart-drawer')?.open();
    });
  });
});
