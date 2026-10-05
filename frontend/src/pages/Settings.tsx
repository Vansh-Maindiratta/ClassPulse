import { useNavigate } from "react-router-dom";
import { useDemo } from "../hooks/useDemo";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Settings() {
  const navigate = useNavigate();
  const { session, logout } = useDemo();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your ClassPulse account." />
      <Card>
        <p className="text-sm text-muted">Signed in as</p>
        <p className="mt-1 font-medium">{session!.user.name}</p>
        <p className="text-sm text-muted">{session!.user.email}</p>
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
