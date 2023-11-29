// src/Routes.js
import React from "react";
import { Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Homepage";
import ProtectedRoute from "./components/ProtectedRoute";

function Routes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/home" component={Home} />
    </Switch>
  );
}

export default Routes;
