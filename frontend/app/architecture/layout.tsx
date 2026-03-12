import DashboardLayout from "@/components/DashboardLayout";

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  // We can default this layout to admin so it shows the full sidebar
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
