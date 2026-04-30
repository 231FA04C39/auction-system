import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/auth/authSlice";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { Card, CardContent } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";

const Signup = () => {
  useDocumentTitle("Sign Up");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isError, setIsError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(signup(formData)).unwrap();
      navigate("/");
    } catch (error) {
      console.log("Signup Failed:", error);
      setIsError(error || "something went wrong");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join the auction platform today
          </p>
        </div>

        {/* Card */}
        <Card padding="p-7">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
              />

              {isError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {isError}
                </div>
              )}

              <Button type="submit" fullWidth disabled={loading} size="lg">
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
