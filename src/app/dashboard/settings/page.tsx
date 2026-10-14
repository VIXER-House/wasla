import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/page-title";
import { Card, CardHeader } from "@/components/ui/card";
import { PasswordForm, ProfileForm } from "./client";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="Settings" description={`Signed in as ${user.email} · member since ${formatDate(user.createdAt)}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="p-5"><ProfileForm name={user.name} workspace={user.account.name} email={user.email} /></div>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <div className="p-5"><PasswordForm /></div>
        </Card>
      </div>
    </>
  );
}
