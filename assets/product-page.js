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
    slidesTrack.style.transform = 'translateX(-' + (currentIdx * 100) + '%)';
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
  if (slidesTrack) {
    var touchStartX = 0;
    var touchEndX   = 0;

    slidesTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    slidesTrack.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        setSlide(diff > 0 ? currentIdx + 1 : currentIdx - 1);
      }
    }, { passive: true });
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

  function formatMoney(cents) {
    if (cents == null) return '';
    var amount = (cents / 100).toFixed(2);
    return '\u20B9' + amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  /* ── Buy It Now ── */
  var buyNowBtn = document.querySelector('[data-buy-now]');
  var pdpForm   = document.getElementById('pdp-form');

  if (buyNowBtn && pdpForm) {
    buyNowBtn.addEventListener('click', function () {
      var variantId = variantInput ? variantInput.value : '';
      var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
      window.location.href = window.Shopify && window.Shopify.routes
        ? window.Shopify.routes.root + 'cart/' + variantId + ':' + qty + '?checkout'
        : '/cart/' + variantId + ':' + qty + '?checkout';
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
