import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/env";

class ApiClient {
  async request(
    method: string,
    endpoint: string,
    body?: any,
    auth = false,
    isForm = false
  ) {
    const headers: any = {};

    if (!isForm) {
      headers["Content-Type"] = "application/json";
    }

    if (auth) {
      const token = await AsyncStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    };

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json();
  }

  get(endpoint: string, auth = false) {
    return this.request("GET", endpoint, undefined, auth);
  }

  post(endpoint: string, data?: any, auth = false, isForm = false) {
    return this.request("POST", endpoint, data, auth, isForm);
  }

  put(endpoint: string, data?: any, auth = false, isForm = false) {
    return this.request("PUT", endpoint, data, auth, isForm);
  }

  delete(endpoint: string, auth = false) {
    return this.request("DELETE", endpoint, undefined, auth);
  }
}

export default new ApiClient();
