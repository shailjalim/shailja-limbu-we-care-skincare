import React from 'react';

const AdminModal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminModal;