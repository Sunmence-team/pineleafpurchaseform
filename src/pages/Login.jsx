import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import assets from '../assets/assests';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(`${API_URL}/api/login`, values, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          const { token } = response.data;
          localStorage.setItem('token', token);

          toast.success('Login successful');
          setTimeout(() => {
            toast('Redirecting to dashboard...');
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }, 1000);
        }
      } catch (err) {
        console.error('Error during logging in:', err);
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          toast.error(err.response.data.message || 'Invalid credentials. Please check your inputs.');
        } else {
          toast.error(
            err.response?.data?.message || err.message || 'An unexpected error occurred while logging in. Please try again later.'
          );
        }
      } finally {
        setTimeout(() => {
          setSubmitting(false);
        }, 2000);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-secClr/50 p-4">
      <div
        className="mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12 w-full lg:w-[60%] md:w-3/4 transform transition-all duration-500 ease-in-out animate-fadeIn"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <img src={assets.logo} className="w-18" alt="" />
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome</h2>
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2 font-medium">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5318] transition duration-300 hover:border-[#2F5318]"
                required
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="text-red-500 text-xs mt-2">{formik.errors.username}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5318] transition duration-300 hover:border-[#2F5318]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2F5318] transition duration-300"
              >
                {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-xs mt-2">{formik.errors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="w-full py-3 bg-[#2F5318] text-white font-medium rounded-lg hover:bg-[#254015] transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;