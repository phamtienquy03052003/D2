import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const timeAgo = (date: string | Date): string => {
    if (!date) return "vừa xong";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "vừa xong";
    return formatDistanceToNow(d, { addSuffix: true, locale: vi });
};
