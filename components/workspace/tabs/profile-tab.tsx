import {
  AddDependentDialog,
  EditTaxProfileDialog,
  EditUserProfileDialog,
  SubmitRiskAssessmentDialog,
} from "@/components/clients/profile/profile-editors";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatGrid, StatItem } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { formatDate, titleCase } from "@/lib/format";
import type { DemoClientRecord } from "@/lib/demo/types";

type ProfileTabProps = {
  record: DemoClientRecord;
  canEdit: boolean;
};

export function ProfileTab({ record, canEdit }: ProfileTabProps) {
  const { client, detail } = record;
  const user = detail.user;
  const assessment = detail.riskAssessment;

  return (
    <div className="space-y-4">
      <SectionPanel
        title="Personal & contact"
        description="What the client sees on their profile."
        actions={
          canEdit ? <EditUserProfileDialog clientId={client.id} user={user} /> : null
        }
      >
        <StatGrid columns={2}>
          <StatItem label="Display name" value={user.display_name} />
          <StatItem label="Email" value={user.email} />
          <StatItem label="Phone" value={user.phone_number ?? "—"} />
          <StatItem
            label="Preferred contact"
            value={titleCase(String(user.preferred_contact ?? "—"))}
          />
          <StatItem label="Occupation" value={user.occupation ?? "—"} />
          <StatItem
            label="Marital status"
            value={titleCase(user.marital_status ?? "—")}
          />
          <StatItem
            label="Dependents (count)"
            value={user.dependents != null ? String(user.dependents) : "—"}
          />
          <StatItem label="Date of birth" value={formatDate(user.date_of_birth ?? "")} />
          <StatItem label="City" value={user.city ?? "—"} />
          <StatItem label="Country" value={user.resident_country ?? "—"} />
          <StatItem
            label="Citizenships"
            value={user.citizenships?.join(", ") || "—"}
          />
          <StatItem label="Currency" value={user.currency} />
          <StatItem
            label="Investment currency"
            value={user.investment_currency ?? user.currency}
          />
        </StatGrid>
        {user.bio ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {user.bio}
          </p>
        ) : null}
      </SectionPanel>

      <SectionPanel
        title="Dependents"
        description="Household members on file."
        actions={canEdit ? <AddDependentDialog clientId={client.id} /> : null}
      >
        {detail.dependents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dependents on file.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {detail.dependents.map((dependent) => (
              <li
                key={dependent.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{dependent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {titleCase(dependent.relationship)} ·{" "}
                    {formatDate(dependent.dateOfBirth)}
                  </p>
                </div>
                {dependent.financialReliance ? (
                  <Badge variant="outline">
                    {titleCase(dependent.financialReliance)} reliance
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel
          title="Risk profile"
          description={
            assessment
              ? `Assessed ${formatDate(assessment.created_at)}`
              : "Not assessed yet"
          }
          actions={
            canEdit ? <SubmitRiskAssessmentDialog clientId={client.id} /> : null
          }
        >
          {assessment?.result ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {titleCase(assessment.result.risk_band)}
              </p>
              <p className="text-sm text-muted-foreground">
                {assessment.result.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Strategy: {assessment.result.strategy}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No assessment yet.
            </p>
          )}
        </SectionPanel>

        <SectionPanel
          title="Tax profile"
          actions={
            canEdit ? (
              <EditTaxProfileDialog
                clientId={client.id}
                taxProfile={detail.taxProfile}
              />
            ) : null
          }
        >
          {detail.taxProfile ? (
            <StatGrid columns={2}>
              <StatItem
                label="Effective rate"
                value={`${detail.taxProfile.effectiveTaxRatePct}%`}
              />
              <StatItem
                label="Marginal rate"
                value={`${detail.taxProfile.marginalTaxRatePct}%`}
              />
              <StatItem
                label="Filing status"
                value={titleCase(detail.taxProfile.filingStatus)}
              />
              <StatItem
                label="Region"
                value={detail.taxProfile.stateOrRegion}
              />
            </StatGrid>
          ) : (
            <p className="text-sm text-muted-foreground">No tax profile on file.</p>
          )}
        </SectionPanel>
      </div>

      {detail.freshness.length > 0 ? (
        <SectionPanel title="Last updated" description="When each section changed.">
          <div className="flex flex-wrap gap-2">
            {detail.freshness.map((entry) => (
              <Badge key={entry.section} variant="outline">
                {titleCase(entry.section)} · {formatDate(entry.updatedAt)}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Profile completion: {detail.profileCompletionScore}%
          </p>
        </SectionPanel>
      ) : null}
    </div>
  );
}
