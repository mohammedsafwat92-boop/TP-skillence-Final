
import { HubType, UploadedFileRecord } from '../types';

/**
 * Hub Adapters: Transform uploaded file metadata into hub-specific business records.
 * In a real app, these would perform specific validation and DB writes.
 */

export const languageAdapter = (fileRecord: UploadedFileRecord) => ({
  contentId: fileRecord.id,
  title: fileRecord.fileName,
  skill: 'General',
  cefr: 'B2',
  viewUrl: fileRecord.storagePath,
  addedAt: fileRecord.uploadedAt,
});

export const salesAdapter = (fileRecord: UploadedFileRecord) => ({
  courseId: fileRecord.id,
  courseName: fileRecord.fileName,
  moduleCount: 1,
  difficulty: 'Intermediate',
  addedAt: fileRecord.uploadedAt,
});

export const shlAdapter = (fileRecord: UploadedFileRecord) => ({
  shlId: fileRecord.id,
  rawFileName: fileRecord.fileName,
  ingestedAt: fileRecord.uploadedAt,
  status: 'PENDING_PARSING',
});

export const cultureAdapter = (fileRecord: UploadedFileRecord) => ({
  assetId: fileRecord.id,
  name: fileRecord.fileName,
  type: 'Reference Material',
});

export const workNatureAdapter = (fileRecord: UploadedFileRecord) => ({
  scenarioId: fileRecord.id,
  title: fileRecord.fileName,
  version: '1.0',
});

export const getHubAdapter = (hubType: HubType) => {
  switch (hubType) {
    case 'Language': return languageAdapter;
    case 'Sales': return salesAdapter;
    case 'SHL': return shlAdapter;
    case 'Culture': return cultureAdapter;
    case 'WorkNature': return workNatureAdapter;
    default:
      throw new Error(`No adapter found for hub type: ${hubType}`);
  }
};
