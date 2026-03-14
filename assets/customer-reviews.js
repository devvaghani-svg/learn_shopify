class CustomerReviews extends HTMLElement {
  connectedCallback() {
    this._track = this.querySelector('[data-reviews-track]');
    this._dots = this.querySelectorAll('[data-reviews-dot]');
    this._total = this._dots.length;
    this._current = 0;

    this._dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this._goTo(i));
    });

    // Sync dots on scroll
    this._track.addEventListener('scroll', () => {
      const cardWidth = this._track.children[0] ? this._track.children[0].offsetWidth : 0;
      if (!cardWidth) return;
      const idx = Math.round(this._track.scrollLeft / (cardWidth + 12));
      if (idx !== this._current) {
        this._current = idx;
        this._dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
      }
    }, { passive: true });
  }

  _goTo(index) {
    this._current = index;
    const card = this._track.children[index];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    this._dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }
}

customElements.define('customer-reviews', CustomerReviews);
