import { z } from 'zod';

// Helper to validate CPF numbers following Brazilian rules
export const validateCPF = (cpf: string): boolean => {
  let sanitized = cpf.replace(/[^\d]/g, '');

  if (sanitized.length !== 11 || /^(\d)\1{10}$/.test(sanitized)) {
    return false;
  }

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

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido')
      .transform(value => value.toLowerCase()),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    fullName: z
      .string()
      .min(3, 'Nome completo deve ter no mínimo 3 caracteres')
      .max(255, 'Nome muito longo'),
    cpf: z
      .string()
      .optional()
      .refine(value => !value || validateCPF(value), 'CPF inválido'),
    phone: z
      .string()
      .optional()
      .refine(
        value =>
          !value || /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/.test(value),
        'Telefone inválido',
      ),
    birthDate: z
      .string()
      .optional()
      .refine(value => {
        if (!value) return true;
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18 && age <= 120;
      }, 'Você deve ter pelo menos 18 anos'),
    termsAccepted: z.boolean().refine(value => value === true, 'Você deve aceitar os termos de uso'),
    privacyAccepted: z
      .boolean()
      .refine(value => value === true, 'Você deve aceitar a política de privacidade'),
    marketingConsent: z.boolean().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
