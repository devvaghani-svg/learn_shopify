class DescriptionSection extends HTMLElement {
  connectedCallback() {
    this._modal = this.querySelector('[data-desc-modal]');
    this._iframe = this.querySelector('[data-desc-iframe]');
    this._closeBtn = this.querySelector('[data-desc-close]');

    this.querySelectorAll('[data-desc-play]').forEach(btn => {
      btn.addEventListener('click', () => this._open(btn.dataset.descPlay));
    });

    this._closeBtn.addEventListener('click', () => this._close());

    this._modal.addEventListener('click', (e) => {
      if (e.target === this._modal) this._close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._close();
    });
  }

  _open(url) {
    // Convert YouTube/Vimeo URL to embed URL
    let embedUrl = url;

    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    this._iframe.src = embedUrl;
    this._modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  _close() {
    this._modal.classList.remove('is-open');
    this._iframe.src = '';
    document.body.style.overflow = '';
  }
}

customElements.define('description-section', DescriptionSection);
