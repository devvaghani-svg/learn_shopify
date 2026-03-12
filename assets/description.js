class DescriptionSection extends HTMLElement {
  connectedCallback() {
    this._content = this.querySelector('[data-desc-content]');
    this._readMoreBtn = this.querySelector('[data-desc-readmore]');

    if (this._readMoreBtn && this._content) {
      if (this._content.scrollHeight <= 96) {
        this._readMoreBtn.style.display = 'none';
        this._content.classList.remove('is-collapsed');
      } else {
        this._readMoreBtn.addEventListener('click', () => this._toggleReadMore());
      }
    }
  }

  _toggleReadMore() {
    const collapsed = this._content.classList.toggle('is-collapsed');
    this._readMoreBtn.textContent = collapsed ? 'Read more' : 'Read less';
  }
}

customElements.define('description-section', DescriptionSection);
