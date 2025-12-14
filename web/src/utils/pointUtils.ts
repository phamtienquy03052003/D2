
import type { Point } from "../types/Point";


export function getUserName(point: Point): string {
  if (typeof point.user === "string") return "Người dùng";
  return point.user.name || "Người dùng";
}


export function getUserAvatar(point: Point): string | undefined {
  if (typeof point.user === "string") return undefined;
  return point.user.avatar;
}


export function getTotalPoints(points: Point[]): number {
  return points.reduce((sum, p) => sum + p.points, 0);
}


export function filterByMinPoints(points: Point[], min: number): Point[] {
  return points.filter(p => p.points >= min);
}
