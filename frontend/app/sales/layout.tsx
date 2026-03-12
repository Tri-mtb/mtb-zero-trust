import DashboardLayout from "@/components/DashboardLayout";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="sales">{children}</DashboardLayout>;
}
