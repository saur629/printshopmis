"use client";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  StatCard,
  Badge,
  Button,
  Modal,
  FormGroup,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  Loading,
  Empty,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const INV_STATUS_COLOR: Record<string, string> = {
  UNPAID: "yellow",
  PARTIAL: "orange",
  PAID: "green",
  OVERDUE: "red",
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewInv, setPreviewInv] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    dueDate: "",
    notes: "",
    items: [{ description: "", qty: "", rate: "", gstPct: "18" }],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/masters/clients").then((r) => r.json()),
    ]).then(([invs, cls]) => {
      setInvoices(Array.isArray(invs) ? invs : []);
      setClients(cls);
      setLoading(false);
    });
  }, []);

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", qty: "", rate: "", gstPct: "18" }],
    }));
  }
  function removeItem(i: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  function updateItem(i: number, field: string, val: string) {
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });
  }

  const subTotal = form.items.reduce(
    (s, item) => s + (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0),
    0,
  );
  const gstTotal = form.items.reduce((s, item) => {
    const amt = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
    return s + (amt * (parseFloat(item.gstPct) || 18)) / 100;
  }, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const inv = await res.json();
      setInvoices((prev) => [inv, ...prev]);
      setShowModal(false);
      setForm({
        clientId: "",
        dueDate: "",
        notes: "",
        items: [{ description: "", qty: "", rate: "", gstPct: "18" }],
      });
      toast.success(`Invoice ${inv.invNo} created!`);
    } catch {
      toast.error("Failed to create invoice");
    }
    setSaving(false);
  }

  function printInvoice() {
    window.print();
  }

  const counts = {
    total: invoices.length,
    billed: invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    unpaid: invoices.reduce(
      (s, i) => s + ((i.totalAmount || 0) - (i.paidAmount || 0)),
      0,
    ),
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <PageShell
      title="Invoices & Billing"
      action={{ label: "+ New Invoice", onClick: () => setShowModal(true) }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard
          label="Invoices This Month"
          value={counts.total}
          icon="🧾"
          color="blue"
        />
        <StatCard
          label="Total Billed"
          value={formatCurrency(counts.billed)}
          icon="💰"
          color="green"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(counts.unpaid)}
          icon="⏰"
          color="yellow"
        />
        <StatCard
          label="Overdue"
          value={counts.overdue}
          icon="🚨"
          color="red"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + New Invoice
            </Button>
          </CardHeader>
          {loading ? (
            <Loading />
          ) : invoices.length === 0 ? (
            <Empty message="No invoices yet" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Inv No.</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td
                        style={{
                          color: "#3b82f6",
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {inv.invNo}
                      </td>
                      <td style={{ fontWeight: 500 }}>{inv.client?.name}</td>
                      <td>{formatCurrency(inv.subTotal)}</td>
                      <td style={{ color: "#8892a4" }}>
                        {formatCurrency(inv.gstAmount)}
                      </td>
                      <td style={{ color: "#10b981", fontWeight: 600 }}>
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td>
                        <Badge color={INV_STATUS_COLOR[inv.status]}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" onClick={() => setPreviewInv(inv)}>
                          Preview
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Invoice Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
            {previewInv && (
              <div style={{ display: "flex", gap: 6 }}>
                <Button onClick={printInvoice}>🖨️ Print</Button>
              </div>
            )}
          </CardHeader>
          <div style={{ padding: 20 }}>
            {!previewInv ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#8892a4",
                  fontSize: 12,
                }}
              >
                Select an invoice to preview
              </div>
            ) : (
              <div id="invoice-print">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1px solid #2a3348",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#3b82f6",
                      }}
                    >
                      {process.env.NEXT_PUBLIC_SHOP_NAME || "PrintFlow"}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#8892a4",
                        marginTop: 4,
                        lineHeight: 1.7,
                      }}
                    >
                      {process.env.NEXT_PUBLIC_SHOP_ADDRESS ||
                        "Lucknow, Uttar Pradesh"}
                      <br />
                      GST:{" "}
                      {process.env.NEXT_PUBLIC_SHOP_GST || "09XXXXX1234Z1ZX"}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#8892a4",
                      lineHeight: 1.8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#e2e8f0",
                      }}
                    >
                      INVOICE
                    </div>
                    <div>
                      No: <b style={{ color: "#3b82f6" }}>{previewInv.invNo}</b>
                    </div>
                    <div>Date: {formatDate(previewInv.date)}</div>
                    <div>Due: {formatDate(previewInv.dueDate)}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                    fontSize: 11,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#8892a4",
                        fontWeight: 600,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontSize: 9,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Bill To
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      {previewInv.client?.name}
                    </div>
                    <div style={{ color: "#8892a4" }}>
                      {previewInv.client?.city}
                    </div>
                    {previewInv.client?.gstNo && (
                      <div style={{ color: "#8892a4" }}>
                        GST: {previewInv.client.gstNo}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#8892a4",
                        fontWeight: 600,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontSize: 9,
                        letterSpacing: "0.5px",
                      }}
                    >
                      Payment Status
                    </div>
                    <Badge color={INV_STATUS_COLOR[previewInv.status]}>
                      {previewInv.status}
                    </Badge>
                    <div style={{ color: "#8892a4", marginTop: 4 }}>
                      Paid: {formatCurrency(previewInv.paidAmount || 0)}
                    </div>
                  </div>
                </div>

                <table style={{ fontSize: 11, marginBottom: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Description</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(previewInv.items || []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{item.description}</td>
                        <td>{item.qty}</td>
                        <td>{formatCurrency(item.rate)}</td>
                        <td>{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", gap: 40, fontSize: 12 }}>
                    <span style={{ color: "#8892a4" }}>Subtotal</span>
                    <span>{formatCurrency(previewInv.subTotal)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 40, fontSize: 12 }}>
                    <span style={{ color: "#8892a4" }}>GST</span>
                    <span>{formatCurrency(previewInv.gstAmount)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 40,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#3b82f6",
                      paddingTop: 6,
                      borderTop: "1px solid #2a3348",
                      width: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span>Total</span>
                    <span>{formatCurrency(previewInv.totalAmount)}</span>
                  </div>
                </div>

                {previewInv.notes && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 10px",
                      background: "#1e2535",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "#8892a4",
                    }}
                  >
                    Notes: {previewInv.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Invoice"
        footer={
          <>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Invoice"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <FormGroup label="Client *">
              <Select
                value={form.clientId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientId: e.target.value }))
                }
                required
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Due Date *">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                required
              />
            </FormGroup>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#8892a4",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Line Items *
              </label>
              <Button size="sm" type="button" onClick={addItem}>
                + Add Item
              </Button>
            </div>
            {form.items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#1e2535",
                  border: "1px solid #2a3348",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(i, "description", e.target.value)
                    }
                    placeholder="Item description"
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(i, "qty", e.target.value)}
                    placeholder="Qty"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(i, "rate", e.target.value)}
                    placeholder="Rate ₹"
                    required
                  />
                  <Select
                    value={item.gstPct}
                    onChange={(e) => updateItem(i, "gstPct", e.target.value)}
                  >
                    <option value="18">GST 18%</option>
                    <option value="12">GST 12%</option>
                    <option value="5">GST 5%</option>
                    <option value="0">No GST</option>
                  </Select>
                  {form.items.length > 1 && (
                    <Button
                      size="sm"
                      type="button"
                      variant="danger"
                      onClick={() => removeItem(i)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <FormGroup label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Payment terms, bank details..."
            />
          </FormGroup>

          <div
            style={{
              background: "#1e2535",
              borderRadius: 8,
              padding: "12px 14px",
              border: "1px solid #2a3348",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#8892a4" }}>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#8892a4" }}>GST</span>
              <span>{formatCurrency(gstTotal)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#3b82f6",
                paddingTop: 6,
                borderTop: "1px solid #2a3348",
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(subTotal + gstTotal)}</span>
            </div>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
