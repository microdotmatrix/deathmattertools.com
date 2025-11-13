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
export const entryImagesAtom = atom<string[]>([]);

export const useEntryImage = () => {
  const [image, setImage] = useAtom(entryImageAtom);
  const [uploading, setUploading] = useAtom(entryImageUploadingAtom);
  const [images, setImages] = useAtom(entryImagesAtom);

  return {
    image,
    setImage,
    uploading,
    setUploading,
    images,
    setImages,
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