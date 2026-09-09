import { signInAsDemoRole } from "@/app/actions/demo-auth";
import { Button } from "@/components/ui/button";
import { DEMO_ROLES, roleDefinition } from "@/lib/auth/capabilities";
import { demoUserByRole } from "@/lib/demo/seed/users";

const TIER_LABELS: Record<string, string> = {
  operational: "Operational",
  governance: "Governance",
  control: "Control",
};

/**
 * Demo sign-in. Each role lands on the same portal with a different capability
 * set, which is the fastest way to show the privilege model working.
 */
export function DemoRolePicker() {
  return (
    <div className="space-y-2">
      {DEMO_ROLES.map((role) => {
        const definition = roleDefinition(role);
        const user = demoUserByRole(role);

        return (
          <form key={role} action={signInAsDemoRole}>
            <input type="hidden" name="role" value={role} />
            <Button
              type="submit"
              variant="ghost"
              className="h-auto w-full justify-start rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10"
            >
              <span className="flex w-full flex-col gap-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white">
                    {definition.label}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
                    {TIER_LABELS[definition.tier]}
                  </span>
                </span>
                <span className="text-xs font-normal leading-relaxed text-white/50">
                  {user.name} · {definition.mission}
                </span>
              </span>
            </Button>
          </form>
        );
      })}
    </div>
  );
}
