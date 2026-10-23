import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // Automatically redirect to the Demand Forecasting dashboard
  redirect('/in/admin/demand');
}
