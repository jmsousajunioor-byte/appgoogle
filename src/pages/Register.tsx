import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => <RegisterForm />;

const redirectTo = buildRedirectUrl('/reset-password');



export default RegisterPage;
