export function PrivacyDataSection() {
  return (
    <>
      <h2>What we store</h2>
      <p>
        Loftlancer stores account and session information, organization and
        project records, membership and access settings, project activity, and
        data created in project apps. Environment variable values are encrypted
        at rest. The product masks those values in the interface unless a person
        with permission reveals them.
      </p>
      <h2>How we use data</h2>
      <p>
        Data is used to provide the hosted service, authenticate accounts,
        enforce access rules, deliver requested invitations and notifications,
        and maintain activity records. The audit-event timeline is controlled by
        a service configuration flag and is not enabled for every installation.
        We do not sell personal data.
      </p>
      <h2>Your choices</h2>
      <p>
        Account settings provide controls to review sessions and request
        deletion. Deletion replaces profile details with a deleted-user record
        and revokes sessions; related organization, project, and activity
        records may remain for other members. For a self-hosted installation,
        contact the operator about data requests.
      </p>
    </>
  );
}
