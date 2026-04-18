
import { CenterRegistrationForm } from "@/components/auth/CenterRegistrationForm";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const CenterRegistration = () => {
  const { user, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-healthcare-50 py-12">
      <div className="healthcare-container max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-healthcare-800">Healthcare Center Registration</h1>
          <p className="text-healthcare-600 mt-2">
            Register your specialized healthcare center to join our network
          </p>
        </div>
        
        <CenterRegistrationForm />
      </div>
    </div>
  );
};

export default CenterRegistration; 