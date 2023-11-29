import React, { useState, useEffect } from "react";
import { Button, Select, SelectItem, Input } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { register } from "../../api/auth";
import PasswordInput from "../NextUIComponents/PasswordInput";
import EmailInput from "../NextUIComponents/EmailInput";
import "./Register.css";

function Register() {
  const initialFormData = {
    username: "",
    email: "",
    dateOfBirth: "",
    gender: "M",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const genderOptions = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
    { label: "Other", value: "O" },
  ];

  const [selectedGender, setSelectedGender] = useState(genderOptions[0].value);

  const handleGenderSelectionChange = (e) => {
    const index = +e.currentKey.split("$.")[1];
    setSelectedGender(genderOptions[index].value);
  };

  const handleInputChange = (value, name) => {
    if (name === "gender") {
      setFormData({
        ...formData,
        gender: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    handleInputChange(selectedGender, "gender");
  }, [selectedGender]);

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const handleRegister = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const { username, email, dateOfBirth, password, confirmPassword, gender } =
      formData;

    if (
      !username ||
      !email ||
      !dateOfBirth ||
      !password ||
      !confirmPassword ||
      !gender
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const message = await register({
        name: username,
        email,
        dateOfBirth,
        password,
        confirm_password: confirmPassword,
        gender,
      });
      setSuccessMessage(message);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      clearForm();
    } catch (error) {
      setErrorMessage(
        error.message || "Registration failed. Please try again.",
      );
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <div className="page-container hero-pattern-bg">
      <div className="register-container">
        <h2 className="register-heading">Register</h2>
        <div className="input-container">
          <div className="flex flex-col flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
            <Input
              type="text"
              label="Username"
              name="username"
              variant="bordered"
              value={formData.username}
              onChange={(e) => {
                handleInputChange(e.target.value, "username");
              }}
            />
          </div>
        </div>
        <div className="input-container">
          <EmailInput
            input={formData.email}
            setEmail={handleInputChange}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className="input-container">
          <div className="flex flex-col flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
            <Input
              type="date"
              name="dateOfBirth"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(e) => {
                handleInputChange(e.target.value, "dateOfBirth");
              }}
              placeholder="Date of Birth"
            />
          </div>
        </div>
        <div className="input-container">
          <Select
            className="max-w-xs"
            label="Select Gender"
            value={formData.gender}
            onSelectionChange={handleGenderSelectionChange}
          >
            <SelectItem value="M">Male</SelectItem>
            <SelectItem value="F">Female</SelectItem>
            <SelectItem value="O">Other</SelectItem>
          </Select>
        </div>
        <div className="input-container">
          <PasswordInput
            password={formData.password}
            handleInputChange={handleInputChange}
            fieldName="password"
          />
        </div>
        <div className="input-container">
          <PasswordInput
            password={formData.confirmPassword}
            handleInputChange={handleInputChange}
            fieldName="confirmPassword"
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <div className="input-container">
          <Button color="default" className="w-full" onClick={handleRegister}>
            Register
          </Button>
        </div>
        <div className="input-container">
          <div>Already have an Account? </div>
          <Link className="login-link" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
