import React from 'react';
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-1/2 max-w-[500px] text-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <div className='flex flex-col items-center gap-4'>
            {children}
            <button className="relative left-[45%] bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500" onClick={onClose}>
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;