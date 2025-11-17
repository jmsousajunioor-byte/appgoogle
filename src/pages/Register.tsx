import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => <RegisterForm />;

const redirectTo = buildRedirectUrl('/reset-password');

const { data, error } = await supabaseClient.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectTo,
    data: { ... },
  },
});


export default RegisterPage;
