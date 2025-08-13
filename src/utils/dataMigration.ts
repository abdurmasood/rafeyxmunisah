'use client';

// Data migration utility for migrating localStorage data to Supabase

interface LocalUpdate {
  id: number;
  timestamp: string;
  content: string;
  isRead: boolean;
}

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
  message: string;
}

export class DataMigrationUtility {
  private static readonly STORAGE_KEY = 'heartbeat-updates';
  private static readonly MIGRATION_STATUS_KEY = 'heartbeat-migration-status';

  /**
   * Check if migration has already been completed
   */
  static isMigrationCompleted(): boolean {
    try {
      const status = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      return status === 'completed';
    } catch (error) {
      console.warn('Failed to check migration status:', error);
      return false;
    }
  }

  /**
   * Mark migration as completed
   */
  static markMigrationCompleted(): void {
    try {
      localStorage.setItem(this.MIGRATION_STATUS_KEY, 'completed');
    } catch (error) {
      console.warn('Failed to mark migration as completed:', error);
    }
  }

  /**
   * Get local updates from localStorage
   */
  static getLocalUpdates(): LocalUpdate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to read local updates:', error);
      return [];
    }
  }

  /**
   * Migrate localStorage updates to Supabase
   */
  static async migrateToSupabase(
    defaultUserId: string = 'local-user',
    clearLocalAfterMigration: boolean = true
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      errors: [],
      message: ''
    };

    try {
      // Check if migration already completed
      if (this.isMigrationCompleted()) {
        result.success = true;
        result.message = 'Migration already completed';
        return result;
      }

      // Get local updates
      const localUpdates = this.getLocalUpdates();
      
      if (localUpdates.length === 0) {
        result.success = true;
        result.message = 'No local updates to migrate';
        this.markMigrationCompleted();
        return result;
      }

      console.log(`Found ${localUpdates.length} local updates to migrate`);

      // Convert local updates to Supabase format
      const supabaseUpdates = localUpdates.map(update => ({
        user_id: defaultUserId,
        content: update.content,
        emotion_type: 'neutral', // Default emotion type
        timestamp: update.timestamp,
        is_read: update.isRead
      }));

      // Send to sync API
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_sync_updates',
          data: supabaseUpdates
        })
      });

      const syncResult = await response.json();

      if (!response.ok) {
        throw new Error(syncResult.error || 'Migration API request failed');
      }

      result.success = true;
      result.migratedCount = syncResult.synced || 0;
      result.skippedCount = localUpdates.length - result.migratedCount;
      
      if (syncResult.errors > 0) {
        result.errors.push(`${syncResult.errors} updates failed to sync`);
      }

      // Clear localStorage if requested and migration was successful
      if (clearLocalAfterMigration && result.migratedCount > 0) {
        try {
          localStorage.removeItem(this.STORAGE_KEY);
          console.log('Cleared local updates after successful migration');
        } catch (clearError) {
          console.warn('Failed to clear local storage after migration:', clearError);
          result.errors.push('Failed to clear local storage after migration');
        }
      }

      // Mark migration as completed
      this.markMigrationCompleted();

      result.message = `Successfully migrated ${result.migratedCount} updates to Supabase`;
      if (result.skippedCount > 0) {
        result.message += ` (${result.skippedCount} skipped)`;
      }

    } catch (error) {
      console.error('Migration failed:', error);
      result.success = false;
      result.message = error instanceof Error ? error.message : 'Migration failed with unknown error';
      result.errors.push(result.message);
    }

    return result;
  }

  /**
   * Reset migration status (for debugging/re-migration)
   */
  static resetMigrationStatus(): void {
    try {
      localStorage.removeItem(this.MIGRATION_STATUS_KEY);
      console.log('Migration status reset');
    } catch (error) {
      console.warn('Failed to reset migration status:', error);
    }
  }

  /**
   * Get migration statistics
   */
  static getMigrationStats() {
    const localUpdates = this.getLocalUpdates();
    const isCompleted = this.isMigrationCompleted();
    
    return {
      hasLocalData: localUpdates.length > 0,
      localUpdateCount: localUpdates.length,
      migrationCompleted: isCompleted,
      needsMigration: localUpdates.length > 0 && !isCompleted
    };
  }
}

// Hook for using migration in React components
export function useMigration() {
  const migrateData = async (userId?: string) => {
    return DataMigrationUtility.migrateToSupabase(userId);
  };

  const getStats = () => {
    return DataMigrationUtility.getMigrationStats();
  };

  const resetStatus = () => {
    DataMigrationUtility.resetMigrationStatus();
  };

  return {
    migrateData,
    getStats,
    resetStatus,
    isCompleted: DataMigrationUtility.isMigrationCompleted()
  };
}