export type UpdateInfo = {
  otaVersion: string;
  releaseNotes?: string[];
  newFeatures?: string[];
  fixedIssues?: string[];
  knownIssues: string[];
  updateTime?: string;
};
