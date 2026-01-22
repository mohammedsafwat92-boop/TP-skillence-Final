
import { AccessProfile, Role, AccessStatus, AccessSource } from '../types';
import { ADMIN_EMAILS } from '../constants';

/**
 * Access Registry - Production Simulation
 * Manages user roles and access status.
 */
class AccessService {
  private registry: Map<string, AccessProfile> = new Map();

  constructor() {
    // Bootstrap standard users for demo purposes
    this.seedUser({
      email: 'admin@gmail.com',
      name: 'Sarah Admin',
      role: 'Admin',
      status: 'ACTIVE',
      source: 'MANUAL',
      grantedAt: new Date().toISOString(),
      grantedByEmail: 'system@tp.com',
      lastUpdatedAt: new Date().toISOString()
    });

    this.seedUser({
      email: 'coach@gmail.com',
      name: 'Michael Coach',
      role: 'Coach',
      status: 'ACTIVE',
      source: 'MANUAL',
      grantedAt: new Date().toISOString(),
      grantedByEmail: 'admin@gmail.com',
      lastUpdatedAt: new Date().toISOString()
    });

    this.seedUser({
      email: 'agent@gmail.com',
      name: 'Alex Agent',
      role: 'Agent',
      status: 'ACTIVE',
      source: 'MANUAL',
      grantedAt: new Date().toISOString(),
      grantedByEmail: 'coach@gmail.com',
      lastUpdatedAt: new Date().toISOString()
    });
  }

  private seedUser(profile: AccessProfile) {
    this.registry.set(profile.email.toLowerCase(), profile);
  }

  /**
   * getProfile handles role resolution and mandatory Admin bypass.
   * If an Admin logs in and is missing from the registry, it auto-heals (creates) the entry.
   */
  async getProfile(email: string): Promise<AccessProfile | null> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check Admin Allowlist Bypass (MANDATORY FIX)
    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      let profile = this.registry.get(normalizedEmail);
      
      // Registry Auto-Heal for Admin
      if (!profile) {
        profile = {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: 'Admin',
          status: 'ACTIVE',
          source: 'BOOTSTRAP',
          grantedAt: new Date().toISOString(),
          grantedByEmail: 'recovery-bootstrap@tp.com',
          lastUpdatedAt: new Date().toISOString()
        };
        this.registry.set(normalizedEmail, profile);
        console.info(`[Security] Admin bypass activated for ${normalizedEmail}. Registry entry auto-healed.`);
      } else {
        // Ensure existing admin account is active and role is correct
        profile.role = 'Admin';
        profile.status = 'ACTIVE';
      }
      return profile;
    }

    // 2. Standard Registry Enforce for non-admins (Coach / Agent)
    const profile = this.registry.get(normalizedEmail);
    return profile || null;
  }

  async getAllProfiles(): Promise<AccessProfile[]> {
    return Array.from(this.registry.values());
  }

  async updateStatus(email: string, status: AccessStatus, updatedBy: string): Promise<void> {
    const profile = this.registry.get(email.toLowerCase());
    if (profile) {
      // Don't allow suspending hard-coded admins via UI to prevent lockout
      if (ADMIN_EMAILS.includes(profile.email.toLowerCase()) && status !== 'ACTIVE') {
        console.warn(`[Security] Attempt to suspend Admin ${profile.email} blocked.`);
        return;
      }
      profile.status = status;
      profile.lastUpdatedAt = new Date().toISOString();
      this.registry.set(email.toLowerCase(), profile);
    }
  }

  async bulkAdd(emails: string[], role: Role, grantedBy: string): Promise<number> {
    let addedCount = 0;
    emails.forEach(email => {
      const e = email.trim().toLowerCase();
      if (e && !this.registry.has(e)) {
        this.registry.set(e, {
          email: e,
          name: e.split('@')[0],
          role,
          status: 'ACTIVE',
          source: 'MANUAL',
          grantedAt: new Date().toISOString(),
          grantedByEmail: grantedBy,
          lastUpdatedAt: new Date().toISOString()
        });
        addedCount++;
      }
    });
    return addedCount;
  }

  async autoAddAgent(email: string): Promise<void> {
    const e = email.toLowerCase();
    if (!this.registry.has(e)) {
      this.registry.set(e, {
        email: e,
        name: e.split('@')[0],
        role: 'Agent',
        status: 'ACTIVE',
        source: 'SHL_AUTO',
        grantedAt: new Date().toISOString(),
        grantedByEmail: 'shl-ingest@tp.com',
        lastUpdatedAt: new Date().toISOString()
      });
    }
  }
}

export const accessService = new AccessService();
