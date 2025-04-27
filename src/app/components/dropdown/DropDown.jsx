import React, { useState } from 'react';

const DropDown = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-white"
      >
        ⋮ {/* teen dots jaise WhatsApp mein hote hain */}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg z-10">
          <button
            onClick={onEdit}
            className="block w-full text-left px-4 py-2 text-black text-sm hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DropDown;
