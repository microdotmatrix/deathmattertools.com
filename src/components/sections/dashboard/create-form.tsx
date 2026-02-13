"use client";

import { FileUploader } from "@/components/elements/file-uploader";
import { AnimatedInput } from "@/components/elements/form/animated-input";
import { useUploadThing } from "@/components/elements/uploads";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useUploadCleanup } from "@/hooks/use-upload-cleanup";
import { createEntryAction } from "@/lib/db/mutations/entries";
import { useCreateForm, useEntryImage } from "@/lib/state";
import { ActionState, cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const CreateEntryForm = () => {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createEntryAction,
    {
      error: "",
    }
  );
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [deathDate, setDeathDate] = useState<Date | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { setImage, setUploading } = useEntryImage();
  const { setOpen } = useCreateForm();
  const formRef = useRef<HTMLFormElement>(null);

  // Cleanup orphaned uploads on unmount or reset
  const { cleanupUpload, resetCleanupState } = useUploadCleanup(
    imageKey,
    isSubmitted
  );

  const { startUpload, isUploading } = useUploadThing("entryProfileImage", {
    onUploadProgress: () => {
      setUploading(true);
    },
    onClientUploadComplete: (res) => {
      const uploadedFile = res?.[0];
      const uploadedUrl = uploadedFile?.url ?? uploadedFile?.serverData?.url ?? null;
      const uploadedKey = uploadedFile?.key ?? uploadedFile?.serverData?.key ?? null;

      toast.success("Image uploaded successfully");
      setImageUrl(uploadedUrl);
      setImage(uploadedUrl);
      setImageKey(uploadedKey);
      setUploading(false);
      setUploadComplete(true);
    },
    onUploadError: (error) => {
      toast.error("Error uploading image");
      setUploading(false);
    },
  });

  useEffect(() => {
    if (state.success && state.entryId) {
      setIsSubmitted(true); // Prevent cleanup hook from deleting the claimed upload
      toast.success("Profile created successfully");
      formRef.current?.reset();
      setImage(null);
      setImageUrl(null);
      setImageKey(null);
      setUploadComplete(false);
      setOpen(false);
      // Redirect to entry page with survey prompt
      router.push(`/${state.entryId}?showSurveyPrompt=true`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, setImage, setOpen, router]);

  return (
    <form action={formAction} className="space-y-6" ref={formRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <AnimatedInput
          name="name"
          type="text"
          label="Name"
          placeholder="Enter full name"
          defaultValue={state.name}
          required
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div>
          <DatePicker
            label="Date of Birth"
            date={birthDate}
            setDate={setBirthDate}
            buttonClasses="h-10 w-full"
          />
          <input
            type="hidden"
            name="dateOfBirth"
            defaultValue={birthDate?.toISOString() || ""}
          />
        </div>
        <div>
          <DatePicker
            label="Date of Death"
            date={deathDate}
            setDate={setDeathDate}
            buttonClasses="h-10 w-full"
          />
          <input
            type="hidden"
            name="dateOfDeath"
            defaultValue={deathDate?.toISOString() || ""}
          />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div>
          <AnimatedInput
            name="birthLocation"
            label="Birth Location"
            placeholder="City, State/Country"
            defaultValue={state.birthLocation}
          />
        </div>
        <div>
          <AnimatedInput
            name="deathLocation"
            label="Death Location"
            placeholder="City, State/Country"
            defaultValue={state.deathLocation}
          />
        </div>
      </motion.div>

      <AnimatedInput
        name="causeOfDeath"
        label="Cause of Death"
        placeholder="Cause of Death"
        defaultValue={state.causeOfDeath}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1 }}
      >
        {isUploading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : uploadComplete ? (
          <div className="flex flex-col items-center justify-center h-16">
            <Check className="h-6 w-6" />
            <span>Image Uploaded Successfully!</span>
            {/* TODO: Add replace button */}
          </div>
        ) : (
          <FileUploader
            maxFiles={1}
            accept={["image/*"]}
            maxSize={1024 * 1024 * 2}
            onFilesReady={(files) => {
              startUpload(files);
            }}
          />
        )}
        <input type="hidden" name="image" value={imageUrl ?? ""} readOnly />
        <input type="hidden" name="imageKey" value={imageKey ?? ""} readOnly />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex items-center gap-2"
      >
        <Button
          type="submit"
          disabled={pending}
          className={cn("flex-1", pending && "opacity-50 cursor-not-allowed")}
        >
          {pending ? "Creating..." : "Create Entry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            // Clean up orphaned upload from UploadThing CDN
            if (imageKey) {
              await cleanupUpload();
            }
            // Reset form state
            setBirthDate(undefined);
            setDeathDate(undefined);
            setImageUrl(null);
            setImageKey(null);
            setUploadComplete(false);
            setImage(null);
            resetCleanupState();
            formRef.current?.reset();
          }}
          disabled={pending}
          className={cn("flex-1", pending && "opacity-50 cursor-not-allowed")}
        >
          Reset
        </Button>
      </motion.div>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
};
