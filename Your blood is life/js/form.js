document.addEventListener('DOMContentLoaded', () => {
  const arabicName = /^[\u0600-\u06FFa-zA-Z\s]{2,60}$/;
  const saudiMobile = /^(05|5)[0-9]{8}$/;
  const nationalId = /^[0-9]{10}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const fieldWrapper = (input) => input.closest('.field') || input.parentElement;
  const errorElement = (input) => {
    const wrapper = fieldWrapper(input);
    if (wrapper?.querySelector('.error-message')) return wrapper.querySelector('.error-message');
    const next = wrapper?.nextElementSibling;
    return next?.classList.contains('error-message') ? next : null;
  };
  const setError = (input, message) => {
    const wrapper = fieldWrapper(input);
    const error = errorElement(input);
    wrapper?.classList.add('has-error');
    wrapper?.classList.remove('is-valid');
    if (error) error.textContent = message;
  };
  const setValid = (input) => {
    const wrapper = fieldWrapper(input);
    const error = errorElement(input);
    wrapper?.classList.remove('has-error');
    wrapper?.classList.add('is-valid');
    if (error) error.textContent = '';
  };
  const clearState = (input) => {
    const wrapper = fieldWrapper(input);
    const error = errorElement(input);
    wrapper?.classList.remove('has-error', 'is-valid');
    if (error) error.textContent = '';
  };

  const validateInput = (input) => {
    if (!input || input.disabled) return true;
    const value = input.type === 'checkbox' || input.type === 'radio' ? input.checked : input.value.trim();
    const label = input.closest('.field')?.querySelector('label')?.textContent?.trim() || 'هذا الحقل';
    if (input.type === 'radio') {
      const group = [...(input.form?.querySelectorAll(`input[type="radio"][name="${input.name}"]`) || [])];
      if (!group.some((radio) => radio.checked)) {
        setError(group[0] || input, `يرجى اختيار ${label}.`);
        return false;
      }
      if (group.some((radio) => radio.checked)) group.forEach(setValid);
      return true;
    }
    if (input.type === 'checkbox' && input.required && !input.checked) {
      setError(input, 'يرجى الموافقة على هذا الخيار للمتابعة.');
      return false;
    }
    if (input.required && !value) { setError(input, `يرجى إدخال ${label}.`); return false; }
    if (!value && !input.required) { clearState(input); return true; }
    if (input.name === 'fullName' && !arabicName.test(input.value.trim())) { setError(input, 'استخدم الاسم بالعربية أو الإنجليزية من حرفين إلى 60 حرفاً.'); return false; }
    if (input.name === 'mobile' && !saudiMobile.test(input.value.trim())) { setError(input, 'أدخل رقم جوال سعودي صحيحاً مثل 05XXXXXXXX.'); return false; }
    if (input.name === 'nationalId' && !nationalId.test(input.value.trim())) { setError(input, 'رقم الهوية يجب أن يتكون من 10 أرقام.'); return false; }
    if (input.type === 'email' && !emailPattern.test(input.value.trim())) { setError(input, 'أدخل بريداً إلكترونياً صحيحاً مثل name@example.com.'); return false; }
    if (input.type === 'number') {
      const numeric = Number(input.value);
      if (input.min && numeric < Number(input.min)) { setError(input, `الحد الأدنى المسموح هو ${input.min}.`); return false; }
      if (input.max && numeric > Number(input.max)) { setError(input, `الحد الأعلى المسموح هو ${input.max}.`); return false; }
    }
    if (!input.checkValidity()) { setError(input, input.title || 'تحقق من صيغة البيانات المدخلة.'); return false; }
    setValid(input);
    return true;
  };

  document.querySelectorAll('[data-validate-form]').forEach((form) => {
    const success = form.querySelector('.success-message');
    const inputs = [...form.querySelectorAll('input, select, textarea')];
    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => { if (fieldWrapper(input)?.classList.contains('has-error')) validateInput(input); });
      input.addEventListener('change', () => validateInput(input));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const valid = inputs.map(validateInput).every(Boolean);
      if (!valid) {
        const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        firstError?.focus();
        return;
      }
      success?.classList.add('is-visible');
      form.classList.add('was-submitted');
      form.querySelector('[type="submit"]')?.setAttribute('aria-disabled', 'true');
      success?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        inputs.forEach(clearState);
        success?.classList.remove('is-visible');
        form.querySelector('[type="submit"]')?.removeAttribute('aria-disabled');
      }, 0);
    });
  });
});
