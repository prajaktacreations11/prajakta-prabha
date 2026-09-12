import TagPill from '@/components/TagPill';
import { getAllTags } from '@/lib/search';

export default function TagCloud() {
  const tags = getAllTags();
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center" data-testid="tag-cloud">
      {tags.map(({ tag }) => (
        <TagPill key={tag} tag={tag} />
      ))}
    </div>
  );
}
