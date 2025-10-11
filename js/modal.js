const dlg = document.getElementById('contactDialog');
const openBtn = document.getElementById('openDialog');
const closeBtn = document.getElementById('closeDialog');
const form = document.getElementById('contactForm');
const successAlert = document.getElementById('successAlert');
let lastActive = null;

function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', function (e) {
    const cursorPosition = e.target.selectionStart;
    const originalLength = e.target.value.length;

    let value = e.target.value.replace(/\D/g, '');

    if (value.startsWith('7') || value.startsWith('8')) {
      value = value.substring(1);
    }

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    const x = value.match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    const newValue = '+7' + (x[1] ? ' (' + x[1] : '') + (x[2] ? ') ' + x[2] : '') + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] : '');

    e.target.value = newValue;

    if (originalLength !== newValue.length) {
      e.target.setSelectionRange(newValue.length, newValue.length);
    } else {
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  });

  phoneInput.addEventListener('blur', function () {
    const digitsOnly = phoneInput.value.replace(/\D/g, '');
    if (digitsOnly.length !== 11) {
      phoneInput.setCustomValidity('Введите полный номер телефона (11 цифр)');
    } else {
      phoneInput.setCustomValidity('');
    }
  });
}

function formatPhoneNumber(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.substring(1);
  }
  if (digits.length > 10) {
    digits = digits.substring(0, 10);
  }
  const x = digits.match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
  return '+7' + (x[1] ? ' (' + x[1] : '') + (x[2] ? ') ' + x[2] : '') + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] : '');
}

function initDateField() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const todayFormatted = `${year}-${month}-${day}`;

  dateInput.value = todayFormatted;
  dateInput.setAttribute('min', todayFormatted);

  dateInput.addEventListener('change', function () {
    dateInput.setCustomValidity('');
  });
}

function showAlert() {
  successAlert.classList.remove('hidden');
  successAlert.classList.add('show');
  setTimeout(() => {
    successAlert.classList.remove('show');
    successAlert.classList.add('hidden');
  }, 3000);
}


openBtn.addEventListener('click', () => {
  lastActive = document.activeElement;

  const formElements = form?.elements;
  if (formElements) {
    [...formElements].forEach(el => {
      el.setCustomValidity?.('');
      el.removeAttribute('aria-invalid');
    });
  }

  initDateField();

  dlg.showModal();
  dlg.querySelector('input, select, textarea, button')?.focus();
});

closeBtn.addEventListener('click', () => dlg.close('cancel'));

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const phoneInput = form.elements.phone;
  if (phoneInput) {
    phoneInput.value = formatPhoneNumber(phoneInput.value);
  }

  [...form.elements].forEach(el => {
    el.setCustomValidity?.('');
    el.removeAttribute('aria-invalid');
  });

  if (!form.checkValidity()) {
    const email = form.elements.email;
    if (email?.validity.typeMismatch) {
      email.setCustomValidity('Введите корректный e-mail, например name@example.com');
    }

    const phone = form.elements.phone;
    if (phone && phone.value.replace(/\D/g, '').length !== 11) {
      phone.setCustomValidity('Введите полный номер телефона (11 цифр)');
    }

    form.reportValidity();

    [...form.elements].forEach(el => {
      if (el.willValidate && !el.checkValidity()) {
        el.setAttribute('aria-invalid', 'true');
      }
    });
    return;
  }

  console.log('Форма валидна! Данные для отправки:', new FormData(form));

  console.log('Форма валидна! Данные:', {
    name: form.elements.name.value,
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    date: form.elements.date.value,
    topic: form.elements.topic.value,
    message: form.elements.message.value
  });

  dlg.close('success');
  form.reset();
  showAlert();
});

dlg.addEventListener('close', () => {
  lastActive?.focus();
});

document.addEventListener('DOMContentLoaded', () => {
  initPhoneMask();
  initDateField();
});
