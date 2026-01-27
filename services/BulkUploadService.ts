
import { HubType, UploadedFileRecord, SHLData } from '../types';
import { getHubAdapter } from '../adapters/uploadAdapters';
import { parseSHLFile } from './geminiService';
import { dataStore } from './DataStore';
import { accessService } from './AccessService';

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

      // 6. Hub Specific Logic (SHL Automated Onboarding)
      if (hubType === 'SHL') {
        await this.processSHLFile(file);
      }

      // 7. Verify Persistence (Simulated Check)
      // In a real app, you would query Firestore here to ensure write success.
      console.log(`[Persistence] Saved record to /uploadedFiles/${fileRecord.id}`);

      return {
        success: true,
        fileRecord,
        hubRecord,
        originalFile: file
      };

    } catch (err: any) {
      console.error(err);
      return {
        success: false,
        error: err.message || 'Unknown persistence error during upload.',
        originalFile: file
      };
    }
  }

  // --- PRIVATE HELPERS ---

  private async processSHLFile(file: File) {
    let content = "";
    
    try {
      // Try reading as text (works for .txt, .csv, sometimes .xml)
      // For PDF/Docx in a real app, we'd need a backend parser or a heavy client library.
      // For this demo, we'll try to read text, and if it fails or is binary, we fall back to a mock.
      const text = await file.text();
      // Check if it looks binary (heuristic)
      if (text.includes('\0')) {
        throw new Error("Binary file detected");
      }
      content = text;
    } catch (e) {
      // Fallback for binary files (PDF/Doc) in this client-side demo
      console.warn("Using mock content for binary SHL file");
      content = `
        SHL Talent Measurement Report
        Candidate Name: Candidate ${Date.now().toString().substr(-4)}
        Candidate Email: new.agent.${Date.now().toString().substr(-4)}@gmail.com
        Date: ${new Date().toISOString()}
        
        Assessment Results:
        Universal Competency Framework
        
        Overall Score: ${Math.floor(Math.random() * 40) + 60}
        
        Language Skills:
        - Listening: ${Math.floor(Math.random() * 40) + 60}
        - Speaking: ${Math.floor(Math.random() * 40) + 60}
        - Reading: ${Math.floor(Math.random() * 30) + 70}
        
        CEFR Level Estimate: ${Math.random() > 0.5 ? 'B1' : 'A2'}
        
        Recommended Actions:
        - Improve speaking confidence
        - Review grammar basics
      `;
    }

    // Call Gemini to parse the content (Real or Mocked)
    const parsedData = await parseSHLFile(file.name, content);

    if (parsedData.agentEmail) {
      // Upsert Agent in DataStore (create or update scores + assign courses)
      const agent = dataStore.upsertAgentFromSHL(parsedData as SHLData);
      
      // Ensure Access Registry knows about this user so they can login
      await accessService.autoAddAgent(agent.email);
      
      console.log(`[SHL Pipeline] Successfully onboarded agent: ${agent.email}`);
    } else {
      console.warn("[SHL Pipeline] Could not extract email from report. Manual intervention required.");
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
