export type DashboardDistributionItem = {
  label: string;
  count: number;
};

export type DashboardStats = {
  status_distribution: DashboardDistributionItem[];
  age_demographics: DashboardDistributionItem[];
  blood_type_distribution: DashboardDistributionItem[];
  top_conditions: DashboardDistributionItem[];
};
