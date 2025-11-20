import { atom, useAtom } from "jotai";

export const createFormAtom = atom<boolean>(false);

export const useCreateForm = () => {
  const [open, setOpen] = useAtom(createFormAtom);

  return {
    open,
    setOpen,
  };
};

export const entryImageAtom = atom<string | null>(null);
export const entryImageUploadingAtom = atom<boolean>(false);

export const useEntryImage = () => {
  const [image, setImage] = useAtom(entryImageAtom);
  const [uploading, setUploading] = useAtom(entryImageUploadingAtom);

  return {
    image,
    setImage,
    uploading,
    setUploading,
  };
};

export const entryDetailsFormAtom = atom<boolean>(false);

export const useEntryDetailsForm = () => {
  const [openDetails, setOpenDetails] = useAtom(entryDetailsFormAtom);

  return {
    openDetails,
    setOpenDetails,
  };
};

/**
 * Tracks whether the obituary text editor is currently active.
 * When true, the AI assistant and comment submissions are disabled
 * to prevent conflicts with manual editing.
 */
export const isEditingObituaryAtom = atom<boolean>(false);

/**
 * Tracks when an obituary is being updated via AI chat so UI components can
 * coordinate their loading states.
 */
export const obituaryUpdateProcessingAtom = atom<boolean>(false);