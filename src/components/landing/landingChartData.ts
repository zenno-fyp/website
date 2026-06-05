/** Mock series for landing: same shape as `UsageTrendDay` / mobile `UsageTrendBar` */
export type LandingTrendPoint = {
  time: string;
  flow_hours: number;
  debugging_hours: number;
  research_hours: number;
  communication_hours: number;
  distracted_hours: number;
};

export const LANDING_DEVELOPER_TRENDS_WEEK: LandingTrendPoint[] = [
  { time: "Mon", flow_hours: 6.5, debugging_hours: 2.1, research_hours: 1.3, communication_hours: 0.7, distracted_hours: 0.4 },
  { time: "Tue", flow_hours: 7.2, debugging_hours: 1.8, research_hours: 1.5, communication_hours: 0.6, distracted_hours: 0.3 },
  { time: "Wed", flow_hours: 5.8, debugging_hours: 2.5, research_hours: 2.0, communication_hours: 0.9, distracted_hours: 0.5 },
  { time: "Thu", flow_hours: 8.1, debugging_hours: 1.5, research_hours: 1.2, communication_hours: 0.5, distracted_hours: 0.2 },
  { time: "Fri", flow_hours: 6.9, debugging_hours: 2.0, research_hours: 1.8, communication_hours: 0.8, distracted_hours: 0.4 },
];

export function landingTrendWeekTotalHours(points: LandingTrendPoint[]): number {
  return points.reduce(
    (acc, p) =>
      acc +
      p.flow_hours +
      p.debugging_hours +
      p.research_hours +
      p.communication_hours +
      p.distracted_hours,
    0,
  );
}
