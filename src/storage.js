// utils/storage.js
// Utility functions for localStorage data management

export function getCandidates() {
  return JSON.parse(localStorage.getItem('candidates') || '[]');
}

export function saveCandidates(candidates) {
  localStorage.setItem('candidates', JSON.stringify(candidates));
}

export function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

export function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
