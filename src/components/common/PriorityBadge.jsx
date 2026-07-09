import { PRIORITY_LABELS, PRIORITY_CLASSES } from '../../constants';

export default function PriorityBadge({ priority }) {
  const p = priority || 'mid';
  return (
    <span className={`text-[11px] px-[7px] py-[2px] rounded-full font-medium whitespace-nowrap ${PRIORITY_CLASSES[p] || PRIORITY_CLASSES.mid}`}>
      {PRIORITY_LABELS[p] || PRIORITY_LABELS.mid}
    </span>
  );
}
