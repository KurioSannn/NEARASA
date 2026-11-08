import { days, type MerchantPost } from '@/types/business-profile';

export default function ScheduleSummary({ post }: { post: MerchantPost }) {
  const grouped: { first: number; last: number; hours: string }[] = [];
  for (let day = 1; day <= 7; day++) {
    const hours = post.schedules.filter(slot => slot.weekday === day).sort((a, b) => a.opens_at.localeCompare(b.opens_at)).map(slot => slot.all_day ? '24 jam' : `${slot.opens_at.slice(0, 5)}–${slot.closes_at.slice(0, 5)}${slot.closes_at < slot.opens_at ? ' besok' : ''}`).join(', ') || 'Tutup';
    const previous = grouped.at(-1);
    if (previous?.hours === hours) previous.last = day;
    else grouped.push({ first: day, last: day, hours });
  }
  return <ul className="profile-schedule-summary">{grouped.map(group => <li key={group.first}><span>{days[group.first]}{group.last !== group.first ? `–${days[group.last]}` : ''}</span><strong>{group.hours}</strong></li>)}</ul>;
}
