/* Поведение страницы: открыто ли сейчас, бюджет букета, появление блоков, отзывы, форма, кнопка звонка на телефоне. */
(function () {
  var TEL = '<a href="tel:+79131482066">+7 (913) 148-20-66</a>';
  var FORM_ENDPOINT = ''; /* {{адрес приёма заявок}} */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  var hero = $('hero'), bar = $('bar'), contacts = $('contacts');

  /* Время в Омске (UTC+6), магазин открыт каждый день 8:00–20:00 */
  var now = $('now'), h = new Date(Date.now() + 6 * 3600000).getUTCHours(), open = h >= 8 && h < 20;
  now.textContent = open ? 'Сейчас открыто, до 20:00' : (h < 8 ? 'Сегодня откроемся в 8:00' : 'Завтра откроемся в 8:00');
  now.classList.toggle('on', open);
  now.hidden = false;

  /* Бюджет: от 1500 до 5000 рублей, букет в 3D растёт вместе с суммой */
  var sum = $('sum'), out = $('sumOut');
  function setSum() {
    var v = +sum.value;
    out.textContent = v.toLocaleString('ru-RU') + ' рублей';
    if (window.BQ) BQ.set(5 + (v - 1500) / 3500 * 25);
  }
  sum.addEventListener('input', setSum);
  setSum();

  function update() {
    var H = innerHeight, hr = hero.getBoundingClientRect(), cr = contacts.getBoundingClientRect();
    if (window.BQ) BQ.live(hr.bottom > 0);
    bar.classList.toggle('on', hr.bottom < H * .3 && cr.top > H * .6);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }, { passive: true });
  addEventListener('resize', update);
  update();

  if (!reduce && 'IntersectionObserver' in window) {
    var rise = document.querySelectorAll('.sec h2,.sec .sub,.big-q,.phone,.steps li,.gal figure,.duo blockquote,.clock,.fresh figure,.cards li,.sign,.plist,.rev-g:not(.rev-more) .rev,.facade,.form');
    rise.forEach(function (el) { el.classList.add('rise'); });
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rise.forEach(function (el) { seen.observe(el); });
  }

  var more = $('revMore'), btn = $('revBtn');
  btn.addEventListener('click', function () {
    var o = more.classList.toggle('open');
    btn.setAttribute('aria-expanded', o);
    btn.textContent = o ? 'Свернуть отзывы' : 'Показать ещё отзывы';
  });

  /* Форма не делает вид, что заявка ушла, пока нет адреса приёма */
  var form = $('form'), msg = $('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ph = form.elements.phone, ok = ph.value.replace(/\D/g, '').length >= 10;
    ph.classList.toggle('invalid', !ok);
    if (!ok) { msg.textContent = 'Укажите телефон, чтобы мы могли перезвонить.'; ph.focus(); return; }
    if (!FORM_ENDPOINT) { msg.innerHTML = 'Заявки с сайта пока не подключены, поэтому ваш номер не отправлен. Позвоните, пожалуйста: ' + TEL; return; }
    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (r) { if (!r.ok) throw 0; msg.textContent = 'Заявка принята, перезвоним.'; form.reset(); })
      .catch(function () { msg.innerHTML = 'Заявка не отправилась. Позвоните, пожалуйста: ' + TEL; });
  });
})();
