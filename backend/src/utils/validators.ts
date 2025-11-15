export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateCPF = (cpf: string): boolean => {
  const sanitized = cpf.replace(/[^\d]/g, '');
  if (sanitized.length !== 11 || /^(\d)\1{10}$/.test(sanitized)) return false;

  let sum = 0;
  for (let i = 1; i <= 9; i += 1) {
    sum += parseInt(sanitized.substring(i - 1, i), 10) * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(sanitized.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i += 1) {
    sum += parseInt(sanitized.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(sanitized.substring(10, 11), 10)) return false;

  return true;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Senha deve ter no mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra maiúscula');
  if (!/[a-z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra minúscula');
  if (!/[0-9]/.test(password)) errors.push('Senha deve conter pelo menos um número');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Senha deve conter pelo menos um caractere especial');
  return { valid: errors.length === 0, errors };
};

export const validatePhone = (phone: string): boolean =>
  /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/.test(phone);

export const validateAge = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 18;
};

