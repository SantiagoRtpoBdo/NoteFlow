import { create } from "zustand";

interface EditorStore {
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  setIsSaving: (isSaving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setLastSavedAt: (date: Date) =>
    set({ lastSavedAt: date, hasUnsavedChanges: false }),
  setHasUnsavedChanges: (hasChanges: boolean) =>
    set({ hasUnsavedChanges: hasChanges }),
}));
