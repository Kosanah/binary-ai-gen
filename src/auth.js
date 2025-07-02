// utils/auth.js
// Utility functions for authentication and role management

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('user');
}

export function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

export function logout() {
  localStorage.removeItem('user');
}
