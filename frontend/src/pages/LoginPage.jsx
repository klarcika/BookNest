// src/pages/LoginPage.jsx
import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage = () => {
    return <SignIn path="/login" routing="path" />;
};
export default LoginPage;
