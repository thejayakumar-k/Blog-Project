import React, { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_API_URL;

function VendorFeatures() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVendors = async () => {
    try {
      const { data: vendorsList } = await axios.get(`${backendUrl}/api/vendors`);
      const { data: featuresList } = await axios.get(`${backendUrl}/api/vendor-features`);

      const merged = vendorsList.map((v) => {
        const f = featuresList.find((feat) => feat.vendorId === v.vendorId);
        return {
          ...v,
          upiPayment: f ? f.upiPayment : false,
          multiLanguage: f ? f.multiLanguage : false,
          voiceEnable: f ? f.voiceEnable : false,
        };
      });

      setVendors(merged);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      showToast("Failed to load vendors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleManage = (vendor) => {
    setSelectedVendor(vendor);
    setManageModalOpen(true);
  };

  const handleSaveFeatures = async (vendorId, features) => {
    try {
      const vendor = vendors.find((v) => v.vendorId === vendorId);
      await axios.post(`${backendUrl}/api/vendor-features`, {
        vendorId,
        vendorName: vendor.vendorName,
        vendorEmail: vendor.vendorEmail,
        ...features,
      });
      showToast("Features updated successfully!");
      setManageModalOpen(false);
      setSelectedVendor(null);
      fetchVendors();
    } catch (err) {
      console.error("Failed to save features:", err);
      showToast("Failed to save features", "error");
    }
  };

  const handleAddVendor = async (email, password, vendorName) => {
    try {
      await axios.post(`${backendUrl}/api/vendors`, { email, password, vendorName });
      showToast("Vendor created successfully!");
      setAddModalOpen(false);
      fetchVendors();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create vendor";
      showToast(msg, "error");
    }
  };

  const handleDeleteVendor = async (vendorId, vendorName) => {
    if(!confirm(`Delete "${vendorName}"? This will remove them from the system.`)) return;
    try {
      await axios.delete(`${backendUrl}/api/vendors/${vendorId}`);
      showToast("Vendor deleted successfully!");
      fetchVendors();
    } catch (err) {
      showToast("Failed to delete vendor", "error");
    }
  };

  const handleChangePassword = async (vendorId, newPassword) => {
    try {
      await axios.put(`${backendUrl}/api/vendors/${vendorId}/password`, { password: newPassword });
      showToast("Password updated successfully!");
      setChangePasswordModalOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      showToast(msg, "error");
    }
  };

  const ToggleBadge = ({ enabled }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {enabled ? "ON" : "OFF"}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Features</h1>
          <p className="text-gray-500 mt-1">Manage feature toggles for each vendor.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Vendor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No vendors found. Click "Add Vendor" to create one.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor Name</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UPI Payment</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Multi-language</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Voice Enable</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.vendorId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{vendor.vendorName}</p>
                      <p className="text-xs text-gray-400">{vendor.vendorEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center"><ToggleBadge enabled={vendor.upiPayment} /></td>
                  <td className="px-6 py-4 text-center"><ToggleBadge enabled={vendor.multiLanguage} /></td>
                  <td className="px-6 py-4 text-center"><ToggleBadge enabled={vendor.voiceEnable} /></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleManage(vendor)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => { setSelectedVendor(vendor); setChangePasswordModalOpen(true); }}
                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                        title="Change password"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.vendorId, vendor.vendorName)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete vendor"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {manageModalOpen && selectedVendor && (
        <ManageFeatureModal
          vendor={selectedVendor}
          onSave={handleSaveFeatures}
          onClose={() => { setManageModalOpen(false); setSelectedVendor(null); }}
        />
      )}

      {addModalOpen && (
        <AddVendorModal
          onAdd={handleAddVendor}
          onClose={() => setAddModalOpen(false)}
        />
      )}

      {changePasswordModalOpen && selectedVendor && (
        <ChangePasswordModal
          vendor={selectedVendor}
          onSave={handleChangePassword}
          onClose={() => { setChangePasswordModalOpen(false); setSelectedVendor(null); }}
        />
      )}
    </div>
  );
}

function ManageFeatureModal({ vendor, onSave, onClose }) {
  const [upiPayment, setUpiPayment] = useState(vendor.upiPayment);
  const [multiLanguage, setMultiLanguage] = useState(vendor.multiLanguage);
  const [voiceEnable, setVoiceEnable] = useState(vendor.voiceEnable);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Features</h2>
            <p className="text-sm text-gray-500">{vendor.vendorName} &mdash; {vendor.vendorEmail}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <FeatureToggle label="UPI Payment" enabled={upiPayment} onToggle={() => setUpiPayment(!upiPayment)} />
          <FeatureToggle label="Multi-language" enabled={multiLanguage} onToggle={() => setMultiLanguage(!multiLanguage)} />
          <FeatureToggle label="Voice Enable" enabled={voiceEnable} onToggle={() => setVoiceEnable(!voiceEnable)} />
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(vendor.vendorId, { upiPayment, multiLanguage, voiceEnable })} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddVendorModal({ onAdd, onClose }) {
  const [vendorName, setVendorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(email, password, vendorName);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Vendor</h2>
            <p className="text-sm text-gray-500">Creates account in Firebase Auth + database</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Vendor 03"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="vendor@example.com"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ vendor, onSave, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(vendor.vendorId, newPassword);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">{vendor.vendorName} &mdash; {vendor.vendorEmail}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeatureToggle({ label, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <span className="font-medium text-gray-700">{label}</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default VendorFeatures;
