import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { login } from "../api/auth";
import "./Login.css";
import PasswordInput from "./NextUIComponents/PasswordInput";
import EmailInput from "./NextUIComponents/EmailInput";

function Login() {
  const { login: authLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userToken, setUserToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Reset error and success messages
    setErrorMessage("");
    setSuccessMessage("");
    setUserToken("");

    // Validate input
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      // Call the login function from api/auth.js
      const token = await login(email, password);
      authLogin(token); // Update the authentication state
      setUserToken(token); // Set the user token
      setSuccessMessage("Login successful!");
    } catch (error) {
      setErrorMessage("Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <h2 className="login-heading">Login</h2>
        <div className="input-container">
          <EmailInput email={email} setEmail={setEmail} />
        </div>
        <div className="input-container">
          <PasswordInput password={password} setPassword={setPassword} />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {userToken && <div>Your token: {userToken}</div>}
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
