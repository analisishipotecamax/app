
'use client';

import { useMemo } from 'react';
import { useDocRevalidatable, UseDocRevalidatableResult } from './use-doc-revalidatable';
import { useUser, useFirestore, useMemoFirebase } from '../provider';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

/**
 * A hook to fetch and subscribe to the current user's profile from Firestore.
 *
 * This hook combines `useUser` to get the authenticated user's ID and `useDocRevalidatable`
 * to subscribe to the corresponding document in the 'users' collection.
 * It also exposes a `revalidate` function to manually trigger a data refresh.
 *
 * @returns {UseDocRevalidatableResult<UserProfile>} An object containing the user profile data,
 * loading state, error state, and a `revalidate` function.
 */
export function useUserProfile(): UseDocRevalidatableResult<UserProfile> {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  return useDocRevalidatable<UserProfile>(userProfileRef);
}
