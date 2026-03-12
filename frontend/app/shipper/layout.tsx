import DashboardLayout from "@/components/DashboardLayout";

export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="shipper">{children}</DashboardLayout>;
}
