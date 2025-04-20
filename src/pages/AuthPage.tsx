import React, { useState } from "react";

interface FormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  username: string;
  password: string;
  level: string;
}

interface LoginData {
  username: string;
  password: string;
}

const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    username: "",
    password: "",
    level: "Beginner",
  });

  const [loginData, setLoginData] = useState<LoginData>({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignup) {
      console.log("Signup Data:", formData);
      alert("Account created successfully! (Data logged in console)");
      setIsSignup(false);
    } else {
      console.log("Login Data:", loginData);
      alert("Login button clicked! (No validation for now)");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#CBC3E3] flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isSignup ? "Create an Account" : "Login"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {isSignup && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                onChange={handleChange}
                required
                className="input"
              />
              <select name="gender" onChange={handleChange} className="input">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                name="height"
                placeholder="Height (cm)"
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                onChange={handleChange}
                required
                className="input"
              />
              <select name="level" onChange={handleChange} className="input">
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </>
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={isSignup ? handleChange : handleLoginChange}
            required
            className="input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={isSignup ? handleChange : handleLoginChange}
            required
            className="input"
          />

          <button
            type="submit"
            className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-4 bg-transparent border-none text-blue-600 hover:underline w-full text-center cursor-pointer outline-none appearance-none shadow-none"
        >
          {isSignup
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

export default Auth;