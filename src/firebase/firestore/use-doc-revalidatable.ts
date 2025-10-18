
'use client';
    
import { useState, useEffect, useCallback } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocRevalidatableResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
  revalidate: () => void; // Function to force re-fetch
}

/**
 * Enhanced React hook to subscribe to a single Firestore document in real-time,
 * with a manual revalidation function.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocRevalidatableResult<T>} Object with data, isLoading, error, and revalidate function.
 */
export function useDocRevalidatable<T = any>(
  docRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocRevalidatableResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const [revalidationToken, setRevalidationToken] = useState(0);

  const revalidate = useCallback(() => {
    setRevalidationToken(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null); // Clear previous data on revalidation or ref change

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Error in useDocRevalidatable:", err);
        setError(err);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', {
          path: docRef.path,
          operation: 'get'
        });
      }
    );

    return () => unsubscribe();
  }, [docRef, revalidationToken]); // Re-run effect if docRef or revalidationToken changes.

  if(docRef && !docRef.__memo) {
    console.warn('The ref passed to useDocRevalidatable was not memoized with useMemoFirebase. This can lead to infinite loops and performance issues.', docRef)
  }

  return { data, isLoading, error, revalidate };
}

    