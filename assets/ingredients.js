document.querySelectorAll('[data-ingr-readmore]').forEach(btn => {
  const desc = btn.previousElementSibling;

  // Hide button if text fits without clamping
  if (desc.scrollHeight <= desc.clientHeight) {
    btn.style.display = 'none';
    return;
  }

  btn.addEventListener('click', () => {
    const collapsed = desc.classList.toggle('is-collapsed');
    btn.textContent = collapsed ? 'Read more' : 'Read less';
  });
});
