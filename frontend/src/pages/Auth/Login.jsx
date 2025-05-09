import React, { useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout.jsx";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import { validateEmail } from "../../utils/helper.js";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance, { resetSessionExpiredFlag } from "../../utils/axiosInstance.js";
import {API_PATHS} from "../../utils/apiPaths.js";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useContext(UserContext); // Get updateUser function from context
  const navigate = useNavigate();

  // Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter the password");
      setLoading(false);
      return;
    }

    setError("");

    // Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });
      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token); // Store token in local storage
        updateUser(response.data); // Update user context
        
        // Reset session expired flag when successfully logged in
        resetSessionExpiredFlag();
        
        // Show success message
        toast.success('Login successful!');
        
        // Check if there's a redirect URL saved
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin'); // Clear it after use
          navigate(redirectPath);
        } else {
          // Default redirect based on role
          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "developer" || role === "tester") {
            navigate("/user/dashboard");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify ">
        <h3 className="text-xl font-semibold text-gray-800">Welcome Back </h3>
        <p className="text-sm text-slate-500 mt-[5px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="example@gmail.com"
            type="email"
            autoComplete="username"
            required
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end mb-2">
            <Link to="/forgot-password" className="text-[13px] text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5 mt-2">{error}</p>}

          <button 
            type="submit" 
            className={`btn-primary w-full mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};
export default Login;
