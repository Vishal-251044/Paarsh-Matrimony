import React, { useState } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const serviceOptions = [
  "Wedding Venues",
  "Wedding Photographers",
  "Caterers for Weddings",
  "Makeup Artists",
  "Decorators",
  "Wedding Planners"
];

export const AddServiceForm = () => {
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    serviceType: '',
    providerName: '',
    providerAddress: '',
    contactNumber: '',
    discountToken: '',
    discountRate: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${BACKEND_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Service provider added successfully!');
        setFormData({
          state: '',
          city: '',
          serviceType: '',
          providerName: '',
          providerAddress: '',
          contactNumber: '',
          discountToken: '',
          discountRate: ''
        });
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.message || 'Failed to add provider'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          name="state"
          placeholder="Enter State"
          value={formData.state}
          onChange={handleChange}
          className="flex-1 p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          name="city"
          placeholder="Enter City"
          value={formData.city}
          onChange={handleChange}
          className="flex-1 p-2 border border-gray-300 rounded"
          required
        />
      </div>

      <select
        name="serviceType"
        value={formData.serviceType}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
        required
      >
        <option value="">Choose Service</option>
        {serviceOptions.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>

      <input
        type="text"
        name="providerName"
        placeholder="Name of Provider"
        value={formData.providerName}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />

      <input
        type="text"
        name="providerAddress"
        placeholder="Address of Provider"
        value={formData.providerAddress}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />

      <input
        type="text"
        name="contactNumber"
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          name="discountToken"
          placeholder="Discount Token"
          value={formData.discountToken}
          onChange={handleChange}
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <input
          type="number"
          name="discountRate"
          placeholder="Discount Rate (%)"
          value={formData.discountRate}
          onChange={handleChange}
          className="flex-1 p-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded bg-red-400 text-white hover:opacity-90 transition-colors"
      >
        {loading ? 'Submitting...' : 'Add Provider'}
      </button>

      {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
    </form>
  );
};
