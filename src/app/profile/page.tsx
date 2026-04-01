"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/layout/PageShell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  FormGroup,
  Input,
  Badge,
} from "@/components/ui";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "purple",
  ADMIN: "blue",
  OPERATOR: "yellow",
  USER: "gray",
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  const [users, setUsers] = useState<any[]>([]);
  const [ownForm, setOwnForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [ownLoading, setOwnLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({
    userId: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [adminLoading, setAdminLoading] = useState(false);

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(sessionUser?.role);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users")
        .then((r) => r.json())
        .then(setUsers);
    }
  }, [isAdmin]);

  async function handleOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    if (ownForm.newPassword !== ownForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (ownForm.newPassword.length < 6) {
      toast.error("Minimum 6 characters");
      return;
    }
    setOwnLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: ownForm.currentPassword,
          newPassword: ownForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password changed successfully!");
      setOwnForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setOwnLoading(false);
  }

  async function handleAdminChange(e: React.FormEvent) {
    e.preventDefault();
    if (!adminForm.userId) {
      toast.error("Select a user");
      return;
    }
    if (adminForm.newPassword !== adminForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (adminForm.newPassword.length < 6) {
      toast.error("Minimum 6 characters");
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adminForm.userId,
          newPassword: adminForm.newPassword,
          forceChange: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const user = users.find((u) => u.id === adminForm.userId);
      toast.success(`Password reset for ${user?.name}!`);
      setAdminForm({ userId: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setAdminLoading(false);
  }

  const initials =
    sessionUser?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <PageShell title="My Profile & Password">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Profile Card */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {sessionUser?.name}
                </div>
                <div
                  style={{ fontSize: 13, color: "#8892a4", marginBottom: 6 }}
                >
                  @{sessionUser?.email}
                </div>
                <Badge color={ROLE_COLORS[sessionUser?.role] || "gray"}>
                  {sessionUser?.role?.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr",
            gap: 20,
          }}
        >
          {/* Change Own Password */}
          <Card>
            <CardHeader>
              <CardTitle>🔐 Change My Password</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleOwnPassword}>
                <FormGroup label="Current Password *">
                  <Input
                    type="password"
                    value={ownForm.currentPassword}
                    onChange={(e) =>
                      setOwnForm((f) => ({
                        ...f,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    required
                  />
                </FormGroup>
                <FormGroup label="New Password *">
                  <Input
                    type="password"
                    value={ownForm.newPassword}
                    onChange={(e) =>
                      setOwnForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    placeholder="Minimum 6 characters"
                    required
                  />
                </FormGroup>
                <FormGroup label="Confirm New Password *">
                  <Input
                    type="password"
                    value={ownForm.confirmPassword}
                    onChange={(e) =>
                      setOwnForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Re-enter new password"
                    required
                  />
                </FormGroup>
                {ownForm.confirmPassword && (
                  <div
                    style={{
                      marginBottom: 14,
                      fontSize: 12,
                      color:
                        ownForm.newPassword === ownForm.confirmPassword
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {ownForm.newPassword === ownForm.confirmPassword
                      ? "✔ Passwords match"
                      : "✗ Passwords do not match"}
                  </div>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={ownLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {ownLoading ? "Changing..." : "🔐 Change My Password"}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Admin Reset Any User */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>👑 Reset Any User Password</CardTitle>
              </CardHeader>
              <CardBody>
                <div
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 14,
                    fontSize: 11,
                    color: "#f59e0b",
                  }}
                >
                  ⚠ Admin can reset any user password without knowing their
                  current password.
                </div>
                <form onSubmit={handleAdminChange}>
                  <FormGroup label="Select User *">
                    <select
                      value={adminForm.userId}
                      onChange={(e) =>
                        setAdminForm((f) => ({ ...f, userId: e.target.value }))
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "#1e2535",
                        border: "1px solid #2a3348",
                        borderRadius: 8,
                        color: "#e2e8f0",
                        fontSize: 13,
                        outline: "none",
                      }}
                    >
                      <option value="">-- Select User --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.username}) — {u.role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="New Password *">
                    <Input
                      type="password"
                      value={adminForm.newPassword}
                      onChange={(e) =>
                        setAdminForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Confirm Password *">
                    <Input
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(e) =>
                        setAdminForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Re-enter new password"
                      required
                    />
                  </FormGroup>
                  {adminForm.confirmPassword && (
                    <div
                      style={{
                        marginBottom: 14,
                        fontSize: 12,
                        color:
                          adminForm.newPassword === adminForm.confirmPassword
                            ? "#10b981"
                            : "#ef4444",
                      }}
                    >
                      {adminForm.newPassword === adminForm.confirmPassword
                        ? "✔ Passwords match"
                        : "✗ Passwords do not match"}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={adminLoading}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {adminLoading ? "Resetting..." : "👑 Reset User Password"}
                  </Button>
                </form>
              </CardBody>
            </Card>
          )}
        </div>

        {/* All Users Table */}
        {isAdmin && (
          <Card style={{ marginTop: 20 }}>
            <CardHeader>
              <CardTitle>All Users — Quick Select</CardTitle>
            </CardHeader>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "#8892a4",
                        }}
                      >
                        {u.username}
                      </td>
                      <td>
                        <Badge color={ROLE_COLORS[u.role] || "gray"}>
                          {u.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td style={{ color: "#8892a4" }}>{u.mobile || "—"}</td>
                      <td>
                        <Badge color={u.active ? "green" : "red"}>
                          {u.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() =>
                            setAdminForm((f) => ({ ...f, userId: u.id }))
                          }
                        >
                          Select →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
