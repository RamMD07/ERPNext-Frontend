import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Building2, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.username, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4"
              >
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to ERPNext
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access your workspace
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                name="username"
                type="text"
                label="Email or Username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your email or username"
                required
                autoComplete="username"
                startIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                startIcon={<Lock className="h-4 w-4" />}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={!formData.username || !formData.password}
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by Frappe Framework
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
            Demo Credentials:
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Username: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Administrator</code></div>
            <div>Password: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin</code></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;