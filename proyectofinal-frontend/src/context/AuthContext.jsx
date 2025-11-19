import React, { useEffect, useState } from "react";
import AuthContext from "./authContextDef";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [roles, setRoles] = useState(() => {
    try {
      const r = localStorage.getItem("roles");
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  });
  const [userRole, setUserRoleState] = useState(() => localStorage.getItem("userRole") || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (roles && roles.length) localStorage.setItem("roles", JSON.stringify(roles));
    else localStorage.removeItem("roles");
  }, [roles]);

  useEffect(() => {
    if (userRole) localStorage.setItem("userRole", userRole);
    else localStorage.removeItem("userRole");
  }, [userRole]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = ({ token: newToken, roles: newRoles = [], user: newUser = null }) => {
    setToken(newToken);
    setRoles(newRoles);
    setUser(newUser);
    // Do not set userRole here — selection may be required if multiple roles
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    setUser(null);
    setUserRoleState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  };

  const setUserRole = (role) => {
    setUserRoleState(role);
  };

  return (
    <AuthContext.Provider value={{ token, roles, userRole, user, login, logout, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

