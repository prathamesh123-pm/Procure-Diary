import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom Hook: Auto-Save Form Draft to LocalStorage
 * Prevents data loss during network disruptions, accidental reloads, or tab switches.
 */
export function useAutoSaveDraft<T extends Record<string, any>>(
  formKey: string,
  initialValues: T
): [T, (field: keyof T, value: any) => void, (all: Partial<T>) => void, () => void, boolean] {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`draft_${formKey}`);
      if (saved) {
        return { ...initialValues, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return initialValues;
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(`draft_${formKey}`));
  });

  const timeoutRef = useRef<any>(null);

  const saveToStorage = useCallback(
    (data: T) => {
      try {
        localStorage.setItem(`draft_${formKey}`, JSON.stringify(data));
        setHasDraft(true);
      } catch (e) {
        console.warn('Failed to auto-save draft:', e);
      }
    },
    [formKey]
  );

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData(prev => {
        const next = { ...prev, [field]: value };
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          saveToStorage(next);
        }, 500);
        return next;
      });
    },
    [saveToStorage]
  );

  const updateAll = useCallback(
    (updates: Partial<T>) => {
      setFormData(prev => {
        const next = { ...prev, ...updates };
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${formKey}`);
    setFormData(initialValues);
    setHasDraft(false);
  }, [formKey, initialValues]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [formData, updateField, updateAll, clearDraft, hasDraft];
}
