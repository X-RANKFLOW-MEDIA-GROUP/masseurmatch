export type ABTestStatus = "draft" | "running" | "completed" | "rolled_back";

export interface ABTestMetrics {
  profile_views: number;
  contact_clicks: number;
  profile_completeness: number;
  engagement_rate?: number;
  sample_size: number;
  timestamp: string;
}

export interface ABTestResults {
  control_metrics: ABTestMetrics[];
  test_metrics: ABTestMetrics[];
  final_control_metrics?: ABTestMetrics;
  final_test_metrics?: ABTestMetrics;
  metric_comparison?: {
    metric_name: string;
    control_value: number;
    test_value: number;
    difference_percent: number;
    winner: "control" | "test" | "neutral";
  }[];
  statistical_significance?: number;
  recommendation?: string;
  sample_size?: number;
}

export interface ABTest {
  id: string;
  name: string;
  field_name: string;
  test_value: unknown;
  control_value: unknown;
  test_segment_percent: number;
  started_at?: string;
  ended_at?: string;
  results?: ABTestResults;
  status: ABTestStatus;
  reason?: string;
  created_by?: string;
  created_at: string;
  profiles_in_test?: number;
  profiles_in_control?: number;
}

export interface CreateABTestRequest {
  name: string;
  field_name: string;
  test_value: unknown;
  test_segment_percent: number;
  reason: string;
}

export interface FinalizeABTestRequest {
  test_id: string;
  notes?: string;
}

export interface RolloutABTestRequest {
  test_id: string;
  gradual?: boolean;
  gradual_percent_per_day?: number;
}

export interface MetricsSnapshot {
  profile_id: string;
  segment: "control" | "test";
  profile_views: number;
  contact_clicks: number;
  profile_completeness: number;
  snapshot_date: string;
}
