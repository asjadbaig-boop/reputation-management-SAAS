import AuthCard from "@/components/AuthCard";
import SignInForm from "./sign-in-form";

export default function DashboardLoginPage() {
  return (
    <AuthCard title="Business owner login" description="See what your customers are saying.">
      <SignInForm />
    </AuthCard>
  );
}
