
import { HubType, UploadedFileRecord } from '../types';
import { getHubAdapter } from '../adapters/uploadAdapters';

export interface UploadResult {
  success: boolean;
  fileRecord?: UploadedFileRecord;
  hubRecord?: any;
  error?: string;
  originalFile?: File; // Helper for batch processing identification
}

class BulkUploadService {
  /**
   * Main entry point for bulk uploads.
   * Enforces lock state, simulates storage upload, and persists metadata.
   */
  async uploadFile(
    file: File,
    hubType: HubType,
    userEmail: string,
    isLocked: boolean
  ): Promise<UploadResult> {
    
    // 1. Mandatory Lock Check
    if (isLocked) {
      return {
        success: false,
        error: 'System is locked. Admin unlock required.',
        originalFile: file
      };
    }

    // 2. Validate File Type (Basic Enterprise Rules)
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.csv', '.pptx', '.doc', '.ppt', '.txt'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return {
        success: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
        originalFile: file
      };
    }

    try {
      // 3. Simulate Storage Upload (Firebase Storage equivalent)
      const storagePath = `uploads/${hubType}/${Date.now()}_${file.name}`;
      
      // 4. Create Firestore Record Metadata
      const fileRecord: UploadedFileRecord = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        size: file.size,
        hubType: hubType,
        storagePath: storagePath,
        uploadedBy: userEmail,
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE'
      };

      // 5. Apply Hub Adapter
      const adapter = getHubAdapter(hubType);
      const hubRecord = adapter(fileRecord);

      // Simulation: Persistence delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // 6. Verify Persistence (Simulated Check)
      // In a real app, you would query Firestore here to ensure write success.
      console.log(`[Persistence] Saved record to /uploadedFiles/${fileRecord.id}`);
      console.log(`[Persistence] Saved hub record to /${hubType.toLowerCase()}/${fileRecord.id}`);

      return {
        success: true,
        fileRecord,
        hubRecord,
        originalFile: file
      };

    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unknown persistence error during upload.',
        originalFile: file
      };
    }
  }

  /**
   * Processes a batch of files with concurrency limiting to prevent UI freezing.
   * Limits concurrent uploads to 3.
   */
  async processBatch(
    files: File[],
    hubType: HubType,
    userEmail: string,
    isLocked: boolean,
    onItemComplete: (result: UploadResult) => void
  ): Promise<void> {
    const CONCURRENCY_LIMIT = 3;
    const queue = [...files];

    // Worker function to process items from queue
    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) break;

        const result = await this.uploadFile(file, hubType, userEmail, isLocked);
        onItemComplete(result);
      }
    };

    // Create worker pool
    const workers = Array.from(
      { length: Math.min(CONCURRENCY_LIMIT, files.length) }, 
      () => worker()
    );

    await Promise.all(workers);
  }
}

export const bulkUploadService = new BulkUploadService();
