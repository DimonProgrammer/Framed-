/**
 * FRAMED — Strategy Session Landing Page
 * Form validation, FAQ toggle, smooth interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initForm();
    initSmoothScroll();
});

/* --- FAQ Accordion --- */
function initFAQ() {
    const items = document.querySelectorAll('.faq__item');

    items.forEach(item => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close all
            items.forEach(i => {
                i.classList.remove('active');
                const a = i.querySelector('.faq__answer');
                a.style.maxHeight = null;
                i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });

            // Open clicked (if it was closed)
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* --- Form Validation & Submission --- */
function initForm() {
    const form = document.getElementById('strategyForm');
    if (!form) return;

    const requiredFields = form.querySelectorAll('[required]');

    // Clear errors on input
    requiredFields.forEach(field => {
        field.addEventListener('input', () => {
            clearFieldError(field);
        });
        field.addEventListener('change', () => {
            clearFieldError(field);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        let isValid = true;
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.form__input--error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Collect data
        const formData = collectFormData(form);

        // Submit
        const submitBtn = form.querySelector('.btn--submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем...';

        try {
            await submitForm(formData);
            showSuccess();
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Записаться на стратсессию';
            alert('Произошла ошибка. Попробуйте ещё раз или напишите нам в Telegram.');
            console.error('Form submission error:', err);
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const errorEl = field.parentElement.querySelector('.form__error');

    if (!value) {
        field.classList.add('form__input--error');
        if (errorEl) errorEl.textContent = 'Обязательное поле';
        return false;
    }

    return true;
}

function clearFieldError(field) {
    field.classList.remove('form__input--error');
    const errorEl = field.parentElement.querySelector('.form__error');
    if (errorEl) errorEl.textContent = '';
}

function collectFormData(form) {
    const data = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    data.submitted_at = new Date().toISOString();
    data.page_url = window.location.href;
    return data;
}

async function submitForm(data) {
    /*
     * TODO: Подключить один из вариантов отправки:
     *
     * Вариант 1 — Formspree (бесплатно, до 50 заявок/мес):
     *   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     *       method: 'POST',
     *       headers: { 'Content-Type': 'application/json' },
     *       body: JSON.stringify(data)
     *   });
     *
     * Вариант 2 — amoCRM (через webhook):
     *   const response = await fetch('https://your-domain.amocrm.ru/api/v4/leads', {
     *       method: 'POST',
     *       headers: { 'Authorization': 'Bearer TOKEN', 'Content-Type': 'application/json' },
     *       body: JSON.stringify(transformToAmoCRM(data))
     *   });
     *
     * Вариант 3 — Telegram Bot (уведомление в чат):
     *   const text = formatTelegramMessage(data);
     *   await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
     *       method: 'POST',
     *       headers: { 'Content-Type': 'application/json' },
     *       body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
     *   });
     *
     * Вариант 4 — Google Sheets (через Apps Script):
     *   await fetch('YOUR_APPS_SCRIPT_URL', {
     *       method: 'POST',
     *       body: JSON.stringify(data)
     *   });
     */

    // Временно: сохраняем в localStorage + выводим в консоль
    console.log('Form submitted:', data);

    const leads = JSON.parse(localStorage.getItem('framed_leads') || '[]');
    leads.push(data);
    localStorage.setItem('framed_leads', JSON.stringify(leads));

    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
}

function showSuccess() {
    const form = document.getElementById('strategyForm');
    const success = document.getElementById('formSuccess');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';

    // Scroll to success message
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* --- Smooth Scroll for anchor links --- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/*
 * Утилита: форматирование заявки для Telegram-уведомления
 * Использовать при подключении Telegram Bot API
 */
function formatTelegramMessage(data) {
    const revenueLabels = {
        'under15': 'до 15 млн',
        '15-50': '15-50 млн',
        '50-100': '50-100 млн',
        '100-200': '100-200 млн',
        'over200': '200+ млн'
    };

    const formatLabels = {
        'clothing': 'Одежда',
        'shoes': 'Обувь',
        'jewelry': 'Ювелирные изделия',
        'accessories': 'Аксессуары',
        'multi': 'Мультибренд',
        'other': 'Другое'
    };

    return `<b>Новая заявка на стратсессию</b>

<b>Имя:</b> ${data.name}
<b>Бутик:</b> ${data.boutique}
<b>Город:</b> ${data.city}
<b>Формат:</b> ${formatLabels[data.format] || data.format}
<b>Оборот:</b> ${revenueLabels[data.revenue] || data.revenue}
<b>Instagram:</b> ${data.instagram || '—'}
<b>Контакт:</b> ${data.contact}
<b>Удобное время:</b> ${data.time_pref || '—'}

<b>Проблема:</b>
${data.problem}`;
}
