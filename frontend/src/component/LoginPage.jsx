// components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginAndSignup.module.css';
import image from '../assets/image.png';
import { register, login } from '../services/authService';

const initialFormState = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: ''
};

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const togglePage = () => {
    setIsSignup(prev => !prev);
    setFormData(initialFormState);
    setError('');
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { password, confirmPassword } = formData;
      console.log('Password:', password);
      console.log('Confirm Password:', confirmPassword);
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match!');
      }
      
      const { confirmPassword: _, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, password } = formData;
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, type = 'text', placeholder) => (
    <input
      type={type}
      name={name}
      placeholder={placeholder || name}
      className={`${styles.input} ${error ? styles.inputError : ''}`}
      value={formData[name]}
      onChange={handleChange}
      required
      disabled={loading}
    />
  );

  const renderSignupForm = () => (
    <>
      <h2 className={styles.title}>Join us Today!</h2>
      <form className={styles.form} onSubmit={handleRegister}>
        {renderInput('name')}
        {renderInput('email', 'email', 'Email id')}
        {renderInput('mobile', 'tel', 'Mobile no.')}
        {renderInput('password', 'password')}
        {renderInput('confirmPassword', 'password', 'Confirm Password')}
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className={styles.loginLink}>
        Already have an account?{' '}
        <button 
          onClick={togglePage} 
          className={styles.link}
          disabled={loading}
        >
          Login
        </button>
      </div>
    </>
  );

  const renderLoginForm = () => (
    <>
      <h2 className={styles.title}>Login</h2>
      <form className={styles.form} onSubmit={handleLogin}>
        {renderInput('email', 'email', 'Email id')}
        {renderInput('password', 'password')}
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className={styles.loginLink}>
        Don't have an account?{' '}
        <button 
          onClick={togglePage} 
          className={styles.link}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img src={image} alt="Scenic landscape" className={styles.image} />
      </div>
      <div className={styles.formContainer}>
        {error && <div className={styles.error}>{error}</div>}
        {isSignup ? renderSignupForm() : renderLoginForm()}
      </div>
    </div>
  );
};

export default LoginPage;