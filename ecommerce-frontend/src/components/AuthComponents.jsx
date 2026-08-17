import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function AuthCard({ children, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-blue-100 mt-1 text-sm">{subtitle}</p>}
        </div>
        
        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
      
      {/* Footer */}
      <p className="text-center mt-6 text-sm text-gray-500">
        © 2026 ShopZone. All rights reserved.
      </p>
    </motion.div>
  );
}

function SocialButton({ onClick, children, variant = 'google' }) {
  const isGoogle = variant === 'google';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all ${
        isGoogle
          ? 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {children}
    </motion.button>
  );
}

function Divider({ text }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-200"></div>
      <span className="text-sm text-gray-400">{text}</span>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}

function InputField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  icon: Icon,
  error,
  minLength 
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="text-lg" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border-2 rounded-xl transition-all focus:outline-none focus:ring-0 ${
            error 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

function SubmitButton({ loading, children, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      type="submit"
      disabled={disabled}
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

function AuthLink({ text, linkText, to }) {
  return (
    <p className="mt-6 text-center text-gray-600">
      {text}{' '}
      <Link to={to} className="text-blue-500 font-medium hover:text-blue-600 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export { AuthCard, SocialButton, Divider, InputField, SubmitButton, AuthLink, ErrorAlert };
