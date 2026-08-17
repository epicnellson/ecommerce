const ERROR_MESSAGES = {
  auth: {
    loginFailed: 'Invalid email or password. Please check your credentials and try again.',
    network: 'Network error. Please check your connection and try again.',
    required: 'Please fill in all required fields.',
    weakPassword: 'Password must be at least 6 characters.',
    emailInvalid: 'Please enter a valid email address.',
    userExists: 'An account with this email already exists.',
    serverError: 'Something went wrong. Please try again later.',
    invalidCredentials: 'Invalid email or password.',
    accountLocked: 'Your account has been locked. Please try again later.',
    sessionExpired: 'Your session has expired. Please log in again.',
  },
  profile: {
    updateFailed: 'Failed to update profile. Please try again.',
    passwordMismatch: 'Passwords do not match.',
    passwordWeak: 'Password must be at least 6 characters.',
    invalidEmail: 'Please enter a valid email address.',
    emailInUse: 'This email is already in use.',
    nameRequired: 'Name is required.',
  },
  address: {
    fetchFailed: 'Unable to load addresses. Please refresh the page.',
    saveFailed: 'Failed to save address. Please try again.',
    deleteFailed: 'Failed to delete address. Please try again.',
    required: 'Please fill in all required address fields.',
    notFound: 'Address not found.',
    invalidData: 'Please check your address details and try again.',
  },
  cart: {
    syncFailed: 'Failed to sync cart. Your changes may not be saved.',
    fetchFailed: 'Failed to load cart. Please refresh the page.',
    addFailed: 'Failed to add item to cart.',
    updateFailed: 'Failed to update cart.',
    removeFailed: 'Failed to remove item from cart.',
  },
  checkout: {
    stockValidation: 'Unable to verify product availability. Please try again.',
    paymentInit: 'Unable to process payment. Please try again or contact support.',
    addressRequired: 'Please select or enter a shipping address.',
    empty: 'Your cart is empty. Add some items before checking out.',
    paymentFailed: 'Payment failed. Please check your card and try again.',
    orderFailed: 'Failed to create order. Please try again.',
    outOfStock: 'Some items are no longer available in the requested quantity.',
  },
  orders: {
    fetchFailed: 'Failed to load orders. Please try again.',
    createFailed: 'Failed to create order. Please try again.',
    notFound: 'Order not found.',
    cancelFailed: 'Failed to cancel order. Please try again.',
  },
  products: {
    fetchFailed: 'Failed to load products. Please try again.',
    notFound: 'Product not found.',
    createFailed: 'Failed to create product. Please try again.',
    updateFailed: 'Failed to update product. Please try again.',
    deleteFailed: 'Failed to delete product. Please try again.',
    outOfStock: 'This item is currently out of stock.',
    insufficientStock: 'Not enough stock available.',
  },
  general: {
    network: 'Network error. Please check your connection.',
    serverError: 'Something went wrong. Please try again later.',
    unknown: 'An unexpected error occurred.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    rateLimited: 'Too many requests. Please wait a moment and try again.',
  },
};

const getErrorMessage = (error, category = 'general') => {
  if (!error) return ERROR_MESSAGES.general.unknown;
  
  const statusCode = error.response?.status;
  const responseData = error.response?.data;
  const message = responseData?.message?.toLowerCase() || '';
  
  if (statusCode === 401) {
    if (message.includes('invalid') || message.includes('password')) {
      return ERROR_MESSAGES.auth.invalidCredentials;
    }
    if (message.includes('token') || message.includes('session')) {
      return ERROR_MESSAGES.auth.sessionExpired;
    }
    return ERROR_MESSAGES.general.unauthorized;
  }
  
  if (statusCode === 403) {
    return ERROR_MESSAGES.general.forbidden;
  }
  
  if (statusCode === 404) {
    if (message.includes('address')) {
      return ERROR_MESSAGES.address.notFound;
    }
    if (message.includes('order')) {
      return ERROR_MESSAGES.orders.notFound;
    }
    if (message.includes('product')) {
      return ERROR_MESSAGES.products.notFound;
    }
    if (message.includes('user')) {
      return ERROR_MESSAGES.profile.updateFailed;
    }
    return ERROR_MESSAGES.general.notFound;
  }
  
  if (statusCode === 429) {
    return ERROR_MESSAGES.general.rateLimited;
  }
  
  if (responseData?.message) {
    const msg = message;
    
    if (msg.includes('email') && msg.includes('password')) {
      return ERROR_MESSAGES.auth.loginFailed;
    }
    if (msg.includes('email')) {
      if (msg.includes('exists') || msg.includes('already') || msg.includes('duplicate')) {
        return ERROR_MESSAGES.auth.userExists;
      }
      return ERROR_MESSAGES.auth.emailInvalid;
    }
    if (msg.includes('password')) {
      if (msg.includes('weak') || msg.includes('short') || msg.includes('6')) {
        return ERROR_MESSAGES.auth.weakPassword;
      }
      return ERROR_MESSAGES.profile.passwordWeak;
    }
    if (msg.includes('name') && msg.includes('required')) {
      return ERROR_MESSAGES.profile.nameRequired;
    }
    if (msg.includes('required') || msg.includes('empty')) {
      if (msg.includes('address') || msg.includes('street') || msg.includes('city') || 
          msg.includes('state') || msg.includes('zip') || msg.includes('phone')) {
        return ERROR_MESSAGES.address.required;
      }
      return ERROR_MESSAGES.auth.required;
    }
    if (msg.includes('duplicate')) {
      if (msg.includes('email')) {
        return ERROR_MESSAGES.profile.emailInUse;
      }
    }
    if (msg.includes('stock') || msg.includes('available')) {
      return ERROR_MESSAGES.products.insufficientStock;
    }
    if (msg.includes('payment') || msg.includes('card')) {
      return ERROR_MESSAGES.checkout.paymentFailed;
    }
    if (msg.includes('rate limit')) {
      return ERROR_MESSAGES.general.rateLimited;
    }
    
    return responseData.message;
  }
  
  if (error.request) {
    return ERROR_MESSAGES.general.network;
  }
  
  return ERROR_MESSAGES[category]?.serverError || ERROR_MESSAGES.general.unknown;
};

export { ERROR_MESSAGES, getErrorMessage };
