import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientDashboardLayout } from './_components/ClientDashboardLayout';
import { InquirySummary } from './_components/InquirySummary';
import { FavoriteTherapists } from './_components/FavoriteTherapists';
import { SearchHistory } from './_components/SearchHistory';

export const metadata = {
  title: 'Dashboard',
  description: 'View your inquiries, favorite therapists, and search history',
};

export default async function ClientDashboard() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <ClientDashboardLayout>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <InquirySummary userEmail={user.email ?? ""} />
          <FavoriteTherapists userId={user.id} />
        </div>
        <div>
          <SearchHistory userId={user.id} />
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
