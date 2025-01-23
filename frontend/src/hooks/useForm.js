// src/hooks/useForm.js
import { useState } from 'react';

const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value, // Update the value of the field that changed
    }));

    // Validate input on change
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  // Function to reset form values to initial state
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  // Function to handle form submission
  const handleSubmit = (e, submitCallback) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      submitCallback(values); // Call the submit callback with form values if no errors
    }
  };

  return { values, handleChange, resetForm, handleSubmit, errors }; // Return values, handlers, and errors
};

export default useForm;
