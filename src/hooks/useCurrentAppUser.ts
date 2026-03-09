import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export function useCurrentAppUser() {
  const { user, isLoaded } = useUser();
  const upsertCurrentUser = useMutation(api.users.upsertCurrentUser);
  const upsertInFlight = useRef(false);
  const [createdUserId, setCreatedUserId] = useState<Id<"users"> | null>(null);

  const externalAuthId = user?.id;

  const existingUser = useQuery(
    api.users.getUserByExternalAuthId,
    externalAuthId ? { externalAuthId } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user || !externalAuthId) {
      return;
    }

    if (existingUser === undefined || existingUser || upsertInFlight.current) {
      return;
    }

    upsertInFlight.current = true;

    void upsertCurrentUser({
      externalAuthId,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined
    })
      .then((id) => setCreatedUserId(id))
      .finally(() => {
        upsertInFlight.current = false;
      });
  }, [existingUser, externalAuthId, isLoaded, upsertCurrentUser, user]);

  const appUserId = (existingUser?._id ?? createdUserId) as Id<"users"> | null;

  const isReady = !isLoaded
    ? false
    : !externalAuthId
      ? true
      : existingUser !== undefined || createdUserId !== null;

  return {
    appUser: existingUser,
    appUserId,
    isReady
  };
}
