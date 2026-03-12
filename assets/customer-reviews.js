class CustomerReviews extends HTMLElement {
  connectedCallback() {
    this._track = this.querySelector('[data-reviews-track]');
    this._dots = this.querySelectorAll('[data-reviews-dot]');
    this._total = this._dots.length;
    this._current = 0;

    this._dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this._goTo(i));
    });
  }

  _goTo(index) {
    this._current = index;
    this._track.style.transform = `translateX(-${index * 100}%)`;
    this._dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }
}

customElements.define('customer-reviews', CustomerReviews);
