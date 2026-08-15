"use client";

import CsvContactsImport from "./CsvContactsImport";
import AdminMessaging from "./AdminMessaging";

export default function MessagingClientShell() {
  return (
    <div className="space-y-4">
      <CsvContactsImport onImported={() => window.location.reload()} />
      <AdminMessaging />
    </div>
  );
}
