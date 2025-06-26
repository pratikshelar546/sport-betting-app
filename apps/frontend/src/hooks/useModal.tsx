import { useRef } from 'react';

const useModal = () => {
  const ref = useRef<HTMLDialogElement>(null);

  const onOpen = () => {
    const currentDialog = ref.current;
    if (currentDialog) {
      currentDialog.showModal();
    }
  };

  const onClose = () => {
    const currentDialog = ref.current;
    if (currentDialog && currentDialog.open) {
      currentDialog.close();
    }
  };

  return { ref, onOpen, onClose };
};

export default useModal