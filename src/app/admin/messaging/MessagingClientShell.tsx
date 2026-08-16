"use client";

import CsvContactsImport from "./CsvContactsImport";
import ImessageBridgeHealth from "./ImessageBridgeHealth";
import AdminMessaging from "./AdminMessaging";

export default function MessagingClientShell() {
  return (
    <div className="space-y-4">
      <ImessageBridgeHealth />
      <CsvContactsImport onImported={() => window.location.reload()} />
      <AdminMessaging />
    </div>
  );
}
