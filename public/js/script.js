function changeImage(thumbnail) {
  const mainImage = document.getElementById('mainImage');
  if (!mainImage || !thumbnail) return;
  mainImage.classList.add('is-changing');
  setTimeout(() => {
    mainImage.src = thumbnail.src;
    mainImage.alt = thumbnail.alt || mainImage.alt;
    mainImage.classList.remove('is-changing');
  }, 120);
  document.querySelectorAll('.thumbnail').forEach((item) => item.classList.remove('active'));
  thumbnail.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const burgerBtn = document.querySelector('.burger-btn');
  const navMenu = document.querySelector('.nav-menu');
  burgerBtn?.addEventListener('click', () => navMenu?.classList.toggle('active'));

  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('hotel-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    const icon = themeToggle?.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  themeToggle?.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('hotel-theme', nextTheme);
    applyTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена', '', 'info', 1800);
  });

  function formatMoney(value) { return `${Number(value || 0).toLocaleString('ru-RU')} ₽`; }
  function getNoun(number, one, two, five) {
    let n = Math.abs(Number(number)) % 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }
  function getNightsCount(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(nights) ? Math.max(nights, 1) : 1;
  }

  const filterGuests = document.getElementById('filter-guests');
  const filterPrice = document.getElementById('filter-price');
  const filterType = document.getElementById('filter-type');
  const filterReset = document.getElementById('filter-reset');
  const filterResult = document.getElementById('filter-result');
  const roomCards = document.querySelectorAll('#rooms-grid .room-card[data-price]');

  function updateRoomFilters() {
    if (!roomCards.length) return;
    const guestsValue = filterGuests?.value || 'all';
    const priceValue = filterPrice?.value || 'all';
    const typeValue = filterType?.value || 'all';
    let visibleCount = 0;
    roomCards.forEach((card) => {
      const guests = Number(card.dataset.guests || 0);
      const price = Number(card.dataset.price || 0);
      const type = card.dataset.type || '';
      const isVisible = (guestsValue === 'all' || guests <= Number(guestsValue)) &&
        (priceValue === 'all' || price <= Number(priceValue)) &&
        (typeValue === 'all' || type === typeValue);
      card.classList.toggle('is-hidden-by-filter', !isVisible);
      if (isVisible) visibleCount += 1;
    });
    if (filterResult) filterResult.innerText = visibleCount ? `Найдено номеров: ${visibleCount}` : 'По выбранным фильтрам номеров не найдено';
  }
  [filterGuests, filterPrice, filterType].forEach((control) => control?.addEventListener('change', updateRoomFilters));
  filterReset?.addEventListener('click', () => {
    if (filterGuests) filterGuests.value = 'all';
    if (filterPrice) filterPrice.value = 'all';
    if (filterType) filterType.value = 'all';
    updateRoomFilters();
  });
  updateRoomFilters();

  const galleryContainer = document.querySelector('.main-image-container');
  const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
  if (galleryContainer && thumbnails.length > 1) {
    let activeSlide = Math.max(0, thumbnails.findIndex((thumb) => thumb.classList.contains('active')));
    const prevBtn = document.createElement('button');
    const nextBtn = document.createElement('button');
    prevBtn.type = 'button'; nextBtn.type = 'button';
    prevBtn.className = 'gallery-arrow gallery-arrow-prev'; nextBtn.className = 'gallery-arrow gallery-arrow-next';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>'; nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    galleryContainer.append(prevBtn, nextBtn);
    function showSlide(index) {
      activeSlide = (index + thumbnails.length) % thumbnails.length;
      changeImage(thumbnails[activeSlide]);
    }
    prevBtn.addEventListener('click', () => showSlide(activeSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(activeSlide + 1));
  }

  function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  function showToast(title, message = '', type = 'success', timeout = 3200) {
    const toast = document.createElement('div');
    const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><div><div class="toast-title">${title}</div>${message ? `<div class="toast-message">${message}</div>` : ''}</div>`;
    getToastContainer().appendChild(toast);
    const closeToast = () => { toast.classList.add('hide'); toast.addEventListener('animationend', () => toast.remove(), { once: true }); };
    toast.addEventListener('click', closeToast);
    setTimeout(closeToast, timeout);
  }

  document.querySelectorAll('.room-card, .service-item, .contact-item, .booking-form-card, .checkout-form, .cart-summary, .checkout-summary, .cart-item, .summary-item, .room-gallery-section, .room-info-section')
    .forEach((item, index) => { item.classList.add('fade-up', 'is-visible'); item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`; });

  const checkInInput = document.querySelector('.check-in');
  const checkOutInput = document.querySelector('.check-out');
  const liveTotal = document.getElementById('booking-live-total');
  const bookingCard = document.querySelector('.booking-form-card');

  function updateLiveTotal() {
    if (!liveTotal || !bookingCard) return;
    const price = Number(bookingCard.dataset.price || 0);
    const checkIn = checkInInput?.value || '';
    const checkOut = checkOutInput?.value || '';
    const priceEl = liveTotal.querySelector('.booking-live-price');
    const noteEl = liveTotal.querySelector('.booking-live-note');
    if (!checkIn || !checkOut) {
      priceEl.innerText = 'Выберите даты';
      noteEl.innerText = 'Минимальная стоимость — 1 ночь';
      return;
    }
    const nights = getNightsCount(checkIn, checkOut);
    priceEl.innerText = formatMoney(price * nights);
    noteEl.innerText = `${formatMoney(price)} × ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')}`;
  }

  function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
  if (checkInInput && checkOutInput) {
    if (window.flatpickr) {
      const commonOptions = { dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', minDate: 'today', locale: window.flatpickr.l10ns?.ru || 'ru', disableMobile: true };
      const checkoutPicker = flatpickr(checkOutInput, { ...commonOptions, onChange: updateLiveTotal });
      flatpickr(checkInInput, { ...commonOptions, onChange: (selectedDates) => {
        if (selectedDates[0]) {
          const minCheckoutDate = addDays(selectedDates[0], 1);
          checkoutPicker.set('minDate', minCheckoutDate);
          if (!checkOutInput.value || new Date(checkOutInput.value) <= selectedDates[0]) checkoutPicker.setDate(minCheckoutDate, true);
        }
        updateLiveTotal();
      }});
    }
    checkInInput.addEventListener('change', updateLiveTotal);
    checkOutInput.addEventListener('change', updateLiveTotal);
    updateLiveTotal();
  }

  document.querySelector('.js-add-to-cart')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const typeName = bookingCard?.dataset.typeName || document.querySelector('.room-detail-title')?.innerText.trim();
    const price = bookingCard?.dataset.price || '0';
    const image = bookingCard?.dataset.image || '';
    const checkIn = checkInInput?.value || '';
    const checkOut = checkOutInput?.value || '';
    const guests = document.querySelector('.guests-select')?.value || '1';
    if (!checkIn || !checkOut) {
      showToast('Выберите даты', 'Укажите дату заезда и дату выезда.', 'warning');
      return;
    }
    try {
      const response = await fetch('/bookings/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeName, price, image, checkIn, checkOut, guests })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Не удалось добавить номер');
      const nights = getNightsCount(checkIn, checkOut);
      showToast('Номер добавлен в бронь', `${typeName}: ${nights} ${getNoun(nights, 'ночь', 'ночи', 'ночей')} — ${formatMoney(Number(price) * nights)}`);
      setTimeout(() => { window.location.href = '/bookings/getCart'; }, 850);
    } catch (err) {
      showToast('Ошибка', err.message, 'error');
    }
  });
});
