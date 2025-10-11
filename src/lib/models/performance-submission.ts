export type PerformanceSubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'published';
export type PerformanceSubmissionType = 'listing' | 'full_service';

export interface PerformanceSubmissionPayload {
  submissionType: PerformanceSubmissionType;
  organizationName: string;
  organizationSlug?: string;
  organizationWebsite?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  performanceTitle: string;
  performanceSlug?: string;
  performanceCategory?: string;
  performanceRegion?: string;
  performanceTags?: string[];
  periodStart?: string;
  periodEnd?: string;
  venue?: string;
  synopsis?: string;
  assetsUrl?: string;
  additionalNotes?: string;
}