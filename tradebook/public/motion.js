(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const seen = new WeakSet();
  const easing = 'cubic-bezier(.16,1,.3,1)';
  function play(element, frames, options = {}) {
    if (!element || reduced.matches || !element.animate || !element.getClientRects().length) return;
    // Cancel only this module's animation on this element, leaving other behavior intact.
    for (const item of active) if (item.element === element) item.animation.cancel();
    const animation = element.animate(frames, {duration:520, easing, ...options});
    const item = {element, animation}; active.add(item);
    animation.finished.catch(() => {}).finally(() => active.delete(item));
  }
  function arrive(element, delay = 0) {
    play(element, [{opacity:.25, translate:'0 12px'}, {opacity:1, translate:'0 0'}], {delay, fill:'backwards'});
  }
  const targets = '.primary-stats > article, .calendar-panel, .selected-day, .analytics-grid > .panel, .duration-panel, .form-section, .history-intro';
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    let index = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target); arrive(entry.target, Math.min(index++ * 45, 180));
      observer.unobserve(entry.target);
    });
  }, {threshold:.08}) : null;
  document.querySelectorAll(targets).forEach(el => observer?.observe(el));
  let lastView = '';
  function routeMotion() {
    const name = document.body.dataset.view;
    if (name === lastView) return;
    lastView = name;
    arrive(document.querySelector('.pagehead'));
    const view = document.getElementById('view-' + name);
    if (!view) return;
    // Animate the visible composition; lower sections reveal only as they enter the viewport.
    let index = 0;
    view.querySelectorAll(targets).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.height && rect.top < innerHeight && rect.bottom > 0) {
        seen.add(el); observer?.unobserve(el); arrive(el, Math.min(++index * 45, 225));
      }
    });
  }
  new MutationObserver(routeMotion).observe(document.body,{attributes:true,attributeFilter:['data-view']});
  routeMotion();
  // Calendar redraws on sync too: animate only actual month/date changes.
  let month = document.getElementById('calendarMonth')?.textContent;
  let day = document.getElementById('selectedDateTitle')?.textContent;
  const calendar = document.getElementById('calendarDays');
  if (calendar) new MutationObserver(() => {
    const nextMonth = document.getElementById('calendarMonth')?.textContent;
    const nextDay = document.getElementById('selectedDateTitle')?.textContent;
    if (month !== nextMonth) {
      month = nextMonth;
      play(calendar,[{opacity:.35,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:380});
    }
    if (day !== nextDay) {
      day = nextDay;
      arrive(document.getElementById('selectedDaySummary'));
      arrive(document.getElementById('dayTrades'),45);
    }
  }).observe(calendar,{childList:true});
  const toast = document.getElementById('toast');
  if (toast) new MutationObserver(() => {
    if (toast.style.display !== 'none') play(toast,[{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:280});
  }).observe(toast,{childList:true});
  reduced.addEventListener('change', () => {if (reduced.matches) for (const item of active) item.animation.cancel();});
})();
