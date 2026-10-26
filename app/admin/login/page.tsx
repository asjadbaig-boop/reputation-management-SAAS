import AuthCard from "@/components/AuthCard";
import LoginForm from "./login-form";

export default function AdminLoginPage() {
  return (
    <AuthCard title="Admin" description="Enter the admin password to continue.">
      <LoginForm />
    </AuthCard>
  );
}
