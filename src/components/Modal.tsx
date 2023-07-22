import React from "react";

declare global {
  interface Window {
    my_modal_5: HTMLDialogElement | undefined;
  }
}

interface ModalProps {
  text: string;
  handleDeleteSelectedRows: () => void;
}

const Modal: React.FC<ModalProps> = ({ text, handleDeleteSelectedRows }) => {
  const showModal = () => {
    if (window.my_modal_5) {
      window.my_modal_5.showModal();
    }
  };

  const handleDeleteClick = () => {
    handleDeleteSelectedRows();
    if (window.my_modal_5) {
      window.my_modal_5.close();
    }
  };

  return (
    <>
      <button
        className="btn bg-red-600 border-none text-[#eee] hover:bg-[#eee] hover:text-red-600 hover:shadow-lg"
        onClick={showModal}
      >
        {text || "Delete"}
      </button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <form method="dialog" className="modal-box">
          <p className="py-4 text-[20px] text-[#eee]">
            Are you sure you want to delete?
          </p>
          <div className="modal-action">
            <button className="btn">Cancel</button>
            <button
              onClick={handleDeleteClick} // Call handleDeleteClick function on button click
              className="btn bg-red-600 text-[#eee] hover:bg-[#eee] hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default Modal;
