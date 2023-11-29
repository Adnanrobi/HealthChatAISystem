import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox } from "@nextui-org/react";
import { useAuth } from "../../hooks/useAuth";
import { login } from "../../api/auth";
import "./Login.css";
import PasswordInput from "../NextUIComponents/PasswordInput";
import EmailInput from "../NextUIComponents/EmailInput";

function Login() {
  const initialFormData = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const { login: authLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isMedUser, setIsMedUser] = useState(false);
  const navigateTo = useNavigate();

  const handleInputChange = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const token = await login(formData.email, formData.password, isMedUser);
      authLogin(token);
      setSuccessMessage("Login successful!");

      // Redirect to the /home page after successful login
      navigateTo("/home");
    } catch (error) {
      setErrorMessage(
        error.message || "Login failed. Please check your email and password.",
      );
    }
  };
  return (
    <div className="page-container hero-pattern-bg">
      <div className="login-container">
        <h2 className="login-heading">Login</h2>
        <div className="input-container">
          <EmailInput
            input={formData.email}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className="input-container">
          <PasswordInput
            password={formData.password}
            handleInputChange={handleInputChange}
            fieldName="password"
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <div className="checkbox-container" style={{ paddingBottom: "10px" }}>
          <Checkbox
            id="isMedUser"
            checked={isMedUser}
            onChange={() => setIsMedUser(!isMedUser)}
          />
          <label htmlFor="isMedUser">Login as Medical User</label>
        </div>
        <div className="input-container">
          <Button color="default" className="w-full" onClick={handleLogin}>
            Login
          </Button>
        </div>
        <div className="signup-container">
          {"Don't have an Account? "}
          <Link className="signup-link" to="/register">
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
