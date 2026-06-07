import { OrganizationUsers } from "@/components/portal/provider/users/OrganizationUsers";

export const metadata = {
  title: "Organization users — Provider portal",
  description: "Manage organization users and pending invites.",
};

export default function OrganizationUsersPage() {
  return <OrganizationUsers />;
}
