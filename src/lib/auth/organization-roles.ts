import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

/**
 * Check if the current user is an owner/admin of the specified organization
 * 
 * @param organizationId - The Clerk organization ID to check
 * @returns true if user is org:admin, false otherwise
 * 
 * @example
 * const isAdmin = await isOrganizationOwner("org_123");
 * if (isAdmin) {
 *   // Allow admin-level operations
 * }
 */
export const isOrganizationOwner = cache(
  async (organizationId: string): Promise<boolean> => {
    const { userId } = await auth();
    
    if (!userId || !organizationId) {
      return false;
    }
    
    try {
      const clerk = await clerkClient();
      const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId,
        limit: 100,
      });
      
      // Find the current user's membership in the list
      // OrganizationMembership has publicUserData.userId
      const userMembership = memberships.data.find(
        (membership) => membership.publicUserData?.userId === userId
      );
      
      if (!userMembership) {
        return false;
      }
      
      // Clerk default roles: 'org:admin' (admin) or 'org:member' (regular member)
      // Only admin role grants elevated permissions
      return userMembership.role === "org:admin";
    } catch (error) {
      // If membership fetch fails (user not in org, org doesn't exist, etc.)
      // Default to no access for security
      console.error("Error checking organization role:", error);
      return false;
    }
  }
);

/**
 * Get user's role in the specified organization
 * 
 * @param organizationId - The Clerk organization ID to check
 * @returns "admin" | "member" | null
 * 
 * @example
 * const role = await getUserOrganizationRole("org_123");
 * if (role === "admin") {
 *   // Show admin UI
 * }
 */
export const getUserOrganizationRole = cache(
  async (organizationId: string): Promise<"admin" | "member" | null> => {
    const { userId } = await auth();
    
    if (!userId || !organizationId) {
      return null;
    }
    
    try {
      const clerk = await clerkClient();
      const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId,
        limit: 100,
      });
      
      // Find the current user's membership in the list
      // OrganizationMembership has publicUserData.userId
      const userMembership = memberships.data.find(
        (membership) => membership.publicUserData?.userId === userId
      );
      
      if (!userMembership) {
        return null;
      }
      
      return userMembership.role === "org:admin" ? "admin" : "member";
    } catch (error) {
      console.error("Error fetching organization role:", error);
      return null;
    }
  }
);
