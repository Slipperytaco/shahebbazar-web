"use client";
import { useEffect, useState } from "react";

export default function VendorInquiries() {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");

  // Load vendors for dropdown
  useEffect(() => {
    async function loadVendors() {
      const res = await fetch("http://localhost:4000/api/vendors");
      const data = await res.json();
      setVendors(data.vendors || []);
    }
    loadVendors();
  }, []);

    async function loadInquiries() {
    if (!vendorId) return;

    const res = await fetch(
        `http://localhost:4000/api/vendors/${vendorId}/inquiries`
    );
    const data = await res.json();
    setInquiries(data.inquiries || []);
    }

    useEffect(() => {
    loadInquiries();
    }, [vendorId]);

  return (
    <div className="page-center">
      <div className="form-card">
        <h2 className="form-title">Vendor Inquiries</h2>

        {/* Vendor Selection Box */}
        <div className="mt-4">
          <label className="text-gray-300">Select Vendor</label>
          <select
            className="form-input mt-2"
            value={vendorId || ""}
            onChange={(e) => setVendorId(Number(e.target.value))}
          >
            <option value="">-- Choose Vendor --</option>
            {vendors.map((v) => (
              <option key={v.vendor_id} value={v.vendor_id}>
                {v.vendor_name}
              </option>
            ))}
          </select>
        </div>

        {/* Create Inquiry Button */}
        {vendorId && (
          <button
            className="form-button-primary mt-4"
            onClick={() => setShowModal(true)}
          >
            Create Inquiry
          </button>
        )}

        {/* No vendor selected */}
        {!vendorId && (
          <p className="text-gray-400 mt-6">
            Select a vendor to view inquiries.
          </p>
        )}

        {/* Inquiry List + Detail */}
        {vendorId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Inquiry List */}
            <div className="md:col-span-1 space-y-4">
              {inquiries.length === 0 && (
                <p className="text-gray-400">No inquiries yet.</p>
              )}

              {inquiries.map((inq) => (
                <div
                  key={inq.inquiry_id}
                  onClick={() => setSelected(inq)}
                  className={`p-4 rounded-md cursor-pointer border ${
                    selected?.inquiry_id === inq.inquiry_id
                      ? "border-purple-500 bg-neutral-800"
                      : "border-neutral-700 bg-neutral-900"
                  }`}
                >
                  <h3 className="font-semibold">
                    {inq.listing_title || "General Inquiry"}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {inq.message.slice(0, 60)}…
                  </p>
                </div>
              ))}
            </div>

            {/* Inquiry Detail */}
            <div className="md:col-span-2">
              {selected ? (
                <div className="p-4 rounded-md bg-neutral-900 border border-neutral-700">
                  <h3 className="text-lg font-semibold mb-2">
                    {selected.listing_title || "General Inquiry"}
                  </h3>

                  <p className="text-gray-300">{selected.message}</p>

                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write a response…"
                    className="form-input mt-4"
                  />

                  <button
                    onClick={async () => {
                      const res = await fetch(
                        `http://localhost:4000/api/inquiries/${selected.inquiry_id}/respond`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ response }),
                        }
                      );
                      if (res.ok) {
                        alert("Response sent!");
                        setResponse("");
                      }
                    }}
                    className="form-button-primary mt-3"
                  >
                    Send Response
                  </button>
                </div>
              ) : (
                <p className="text-gray-400">Select an inquiry to view details.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg w-full max-w-md border border-neutral-700">
            <h3 className="text-xl font-semibold mb-4 text-white">New Inquiry</h3>

            <input
              className="form-input mt-2"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              className="form-input mt-2"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />

            <textarea
              className="form-input mt-2"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="form-button-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="form-button-primary"
                onClick={async () => {
                  await fetch("http://localhost:4000/api/inquiries", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      vendor_id: vendorId,
                      customer_name: customerName,
                      customer_email: customerEmail,
                      message,
                    }),
                  });

                  // Reset fields
                  setCustomerName("");
                  setCustomerEmail("");
                  setMessage("");

                  // Close modal
                  setShowModal(false);

                  // Reload inquiries
                  //setVendorId(vendorId);
                  // updated to refresh on submission: 
                  await loadInquiries(); 

                }}
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
