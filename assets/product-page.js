(function () {
  'use strict';

  /* ── Gallery ── */
  var slidesTrack = document.getElementById('pdp-slides');
  var thumbBtns   = document.querySelectorAll('[data-gallery-thumb]');
  var prevBtn     = document.querySelector('[data-gallery-prev]');
  var nextBtn     = document.querySelector('[data-gallery-next]');
  var slides      = document.querySelectorAll('[data-slide-index]');
  var currentIdx  = 0;
  var totalSlides = slides.length;

  function setSlide(idx) {
    if (!slidesTrack || totalSlides === 0) return;
    currentIdx = (idx + totalSlides) % totalSlides;
    var slideEls = slidesTrack.querySelectorAll('.pdp__slide');
    var target = slideEls[currentIdx];
    if (target) slidesTrack.style.transform = 'translateX(-' + target.offsetLeft + 'px)';
    syncThumbs(currentIdx);
  }

  function syncThumbs(idx) {
    thumbBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', parseInt(btn.dataset.galleryThumb) === idx);
    });
  }

  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setSlide(parseInt(this.dataset.galleryThumb));
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { setSlide(currentIdx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { setSlide(currentIdx + 1); });

  // ── Touch swipe ──
  var mainWrap = document.getElementById('pdp-scroll-track');
  if (mainWrap) {
    var touchStartX = 0;
    mainWrap.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    mainWrap.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) setSlide(diff > 0 ? currentIdx + 1 : currentIdx - 1);
    }, { passive: true });

    // ── Mouse drag ──
    var mouseStartX = 0;
    var isDragging = false;
    mainWrap.addEventListener('mousedown', function (e) {
      mouseStartX = e.clientX;
      isDragging = true;
    });
    mainWrap.addEventListener('mouseup', function (e) {
      if (!isDragging) return;
      isDragging = false;
      var diff = mouseStartX - e.clientX;
      if (Math.abs(diff) > 40) setSlide(diff > 0 ? currentIdx + 1 : currentIdx - 1);
    });
    mainWrap.addEventListener('mouseleave', function () { isDragging = false; });

    // ── Wheel / trackpad scroll (horizontal only) ──
    var scrollCooldown = false;
    var scrollAccum = 0;
    mainWrap.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
      e.preventDefault();
      if (scrollCooldown) return;
      scrollAccum += e.deltaX;
      if (Math.abs(scrollAccum) < 150) return;
      var dir = scrollAccum > 0 ? 1 : -1;
      scrollAccum = 0;
      scrollCooldown = true;
      setSlide(currentIdx + dir);
      setTimeout(function () { scrollCooldown = false; }, 600);
    }, { passive: false });
  }



  /* ── Variants ── */
  var variantsData = [];
  var variantsJson = document.getElementById('pdp-variants-json');
  if (variantsJson) {
    try { variantsData = JSON.parse(variantsJson.textContent); } catch (e) {}
  }

  var variantBtns   = document.querySelectorAll('[data-variant-id]');
  var variantInput  = document.getElementById('pdp-variant-id');
  var priceEl       = document.getElementById('pdp-price');
  var compareEl     = document.getElementById('pdp-compare-price');
  var atcBtn        = document.querySelector('.pdp__atc-btn');
  var buyNowBtn     = document.querySelector('[data-buy-now]');

  function formatMoney(cents) {
    if (cents == null) return '';
    var amount = (cents / 100).toFixed(2);
    var symbol = window.__currencySymbol || '';
    return symbol + amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function selectVariant(variantId) {
    var variant = variantsData.find(function (v) { return v.id === variantId; });
    if (!variant) return;

    if (variantInput) variantInput.value = variantId;

    if (priceEl) priceEl.textContent = formatMoney(variant.price);

    if (compareEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareEl.textContent = formatMoney(variant.compare_at_price);
        compareEl.style.display = '';
      } else {
        compareEl.style.display = 'none';
      }
    }

    variantBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', parseInt(btn.dataset.variantId) === variantId);
    });

    // Sold out state
    var soldOut = !variant.available;
    if (atcBtn) {
      atcBtn.disabled = soldOut;
      atcBtn.textContent = soldOut ? 'Sold Out' : 'Add to Cart';
    }
    if (buyNowBtn) buyNowBtn.disabled = soldOut;

    // Update coupon prices
    document.querySelectorAll('[data-discount]').forEach(function (box) {
      var discount = parseInt(box.dataset.discount) || 0;
      var discountAmt = Math.round(variant.price * discount / 100);
      var finalPrice = variant.price - discountAmt;
      var priceEl = box.querySelector('[data-coupon-price]');
      if (priceEl) priceEl.textContent = 'Get it for ' + formatMoney(finalPrice);
    });

    // If variant has specific images, scroll gallery to first
    if (variant.images && variant.images.length > 0) {
      setSlide(0);
    }
  }

  variantBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectVariant(parseInt(this.dataset.variantId));
    });
  });

  /* ── Quantity ── */
  var qtyInput = document.getElementById('pdp-qty');
  var qtyDec   = document.querySelector('[data-qty-dec]');
  var qtyInc   = document.querySelector('[data-qty-inc]');

  function formatQty(n) {
    return n < 10 ? '0' + n : String(n);
  }

  if (qtyDec) {
    qtyDec.addEventListener('click', function () {
      var val = parseInt(qtyInput.value) || 1;
      if (val > 1) { qtyInput.value = formatQty(val - 1); }
    });
  }

  if (qtyInc) {
    qtyInc.addEventListener('click', function () {
      var val = parseInt(qtyInput.value) || 1;
      qtyInput.value = formatQty(val + 1);
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('blur', function () {
      var val = parseInt(this.value) || 1;
      this.value = formatQty(Math.max(1, val));
    });
    // Allow only digits while typing
    qtyInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  /* ── Add to Cart (AJAX) ── */
  var pdpFormEl = document.getElementById('pdp-form');
  if (pdpFormEl && atcBtn) {
    pdpFormEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var variantId = variantInput ? variantInput.value : '';
      var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
      if (!variantId) return;

      atcBtn.disabled = true;
      var originalText = atcBtn.textContent.trim();
      atcBtn.textContent = 'Adding...';

      // Open drawer immediately
      document.querySelector('cart-drawer')?.open();

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId), quantity: qty })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          return typeof refreshCartDrawer === 'function' ? refreshCartDrawer() : Promise.resolve();
        })
        .then(function () {
          atcBtn.textContent = originalText;
          atcBtn.disabled = false;
        })
        .catch(function () {
          atcBtn.textContent = originalText;
          atcBtn.disabled = false;
        });
    });
  }

  /* ── Buy It Now ── */
  var buyNowBtn = document.querySelector('[data-buy-now]');
  var pdpForm   = document.getElementById('pdp-form');

  if (buyNowBtn && pdpForm) {
    buyNowBtn.addEventListener('click', function () {
      var variantId = variantInput ? variantInput.value : '';
      var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
      if (!variantId) return;
      buyNowBtn.disabled = true;
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId), quantity: qty })
      }).then(function () {
        window.location.href = '/checkout';
      }).catch(function () {
        buyNowBtn.disabled = false;
      });
    });
  }

  /* ── Coupon copy ── */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = this.dataset.copy;
      if (!code) return;

      navigator.clipboard.writeText(code).then(function () {
        var original = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;stroke:#1d5c58"><path d="M4 10l4 4 8-8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        setTimeout(function () { btn.innerHTML = original; }, 1800);
      }).catch(function () {
        var el = document.createElement('textarea');
        el.value = code;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      });
    });
  });

})();
