// Fonctions API

import { getToken } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(url, options = {}) {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur API");
  }
  
  return response.json();
}

export async function getProfile() {
  return apiFetch("/user/profile");
}

export async function uploadFile(endpoint, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur upload");
  }
  
  return response.json();
}
