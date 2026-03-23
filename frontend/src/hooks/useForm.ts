import { useState } from 'react';
import { validateForm, ValidationError } from '../components/ErrorHandler';
import { useToast } from './useToast';

interface UseFormProps<T> {
  initialValues: T;
  validationRules?: any;
  onSubmit: (values: T) => Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors.some(e => e.field === field)) {
      setErrors(prev => prev.filter(e => e.field !== field));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    if (validationRules && validationRules[field as string]) {
      const fieldErrors = validateForm(
        { [field]: values[field] },
        { [field]: validationRules[field as string] }
      );
      
      if (fieldErrors.length > 0) {
        setErrors(prev => [...prev, ...fieldErrors]);
      }
    }
  };

  const validate = (): boolean => {
    if (!validationRules) return true;
    
    const validationErrors = validateForm(values, validationRules);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      // Show first error as toast
      showToast('error', validationErrors[0].message);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error: any) {
      showToast('error', error.message || 'Form submission failed');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors([]);
    setTouched({});
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setFieldError = (field: keyof T, message: string) => {
    setErrors(prev => [...prev, { field: field as string, message }]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    clearErrors,
    isValid: errors.length === 0
  };
};

// Specific form validation rules
export const validationRules = {
  email: {
    required: true,
    email: true,
    maxLength: 100,
    patternMessage: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 50,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    patternMessage: 'Password must contain at least one letter and one number'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    patternMessage: 'Name can only contain letters and spaces'
  },
  age: {
    min: 13,
    max: 120,
    pattern: /^\d+$/,
    patternMessage: 'Please enter a valid age'
  },
  weight: {
    min: 30,
    max: 300,
    pattern: /^\d+(\.\d{1})?$/,
    patternMessage: 'Please enter a valid weight'
  },
  height: {
    min: 100,
    max: 250,
    pattern: /^\d+$/,
    patternMessage: 'Please enter a valid height in cm'
  }
};
