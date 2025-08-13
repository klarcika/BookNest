// src/pages/RegisterPage.jsx
import React from 'react';

import { SignUp } from '@clerk/clerk-react';

const RegisterPage = () => {
    return <SignUp path="/register" routing="path" />;
};

export default RegisterPage;

