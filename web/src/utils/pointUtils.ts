// utils/pointUtils.ts
import type { Point } from "../types/Point";

/**
 * Lấy tên người dùng từ record điểm
 */
export function getUserName(point: Point): string {
  if (typeof point.user === "string") return "Người dùng";
  return point.user.name || "Người dùng";
}

/**
 * Lấy avatar người dùng từ record điểm
 */
export function getUserAvatar(point: Point): string | undefined {
  if (typeof point.user === "string") return undefined;
  return point.user.avatar;
}

/**
 * Lấy tổng điểm từ một mảng record
 */
export function getTotalPoints(points: Point[]): number {
  return points.reduce((sum, p) => sum + p.points, 0);
}

/**
 * Lọc record theo số điểm tối thiểu
 */
export function filterByMinPoints(points: Point[], min: number): Point[] {
  return points.filter(p => p.points >= min);
}
