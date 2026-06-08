function isLocked(iso) {
  const start = new Date(iso);
  const lockTime = new Date(start.getTime() - 10 * 60 * 1000);
  return Date.now() >= lockTime.getTime();
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.match-row').forEach(row => {
    const startAt = row.dataset.startAt;
    const locked = isLocked(startAt);
    const badge = row.querySelector('.match-badge');
    const form = row.querySelector('.pred-form, .prediction-form');
    if (locked) {
      if (badge) { badge.textContent = 'مقفول'; badge.classList.remove('open'); badge.classList.add('locked'); }
      row.classList.add('locked');
      if (form) {
        form.querySelectorAll('input').forEach(i => i.disabled = true);
        const btn = form.querySelector('button');
        if (btn) btn.disabled = true;
      }
    } else {
      if (badge) { badge.textContent = 'متاح'; badge.classList.remove('locked'); badge.classList.add('open'); }
    }
  });
});
