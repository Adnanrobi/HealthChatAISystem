import React from "react";
import "./LandingPage.css";
import { Button } from "@nextui-org/react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="container">
      <p className="my-4 text-6xl font-semibold">Welcome to HealthChatAI</p>
      <p className="text-xl italic text-gray-800">
        Engage with the most advanced AI-powered helpline.
      </p>
      <br />
      <div className="my-8 button-group">
        <Link to="/login">
          <Button color="primary" size="lg" className="text-lg font-medium">
            Log in
          </Button>
        </Link>
        <Link to="/register">
          <Button color="secondary" size="lg" className="text-lg font-medium">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
