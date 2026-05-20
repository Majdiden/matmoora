import { useFormatter, useTranslations } from 'next-intl';

export interface CommentNode {
  id: string;
  content: string;
  date: string;
  authorName: string;
  parentId?: string | null;
}

interface Props {
  comments: CommentNode[];
}

/**
 * Server-rendered comment thread (TECH_SPEC §14.1). Approved comments only —
 * publication happens via the revalidation hook after moderation.
 */
export function CommentList({ comments }: Props) {
  const t = useTranslations();
  const format = useFormatter();

  if (comments.length === 0) {
    return <p className="text-sm text-neutral-500">{t('Comments.empty')}</p>;
  }

  return (
    <ol className="space-y-6">
      {comments.map((c) => (
        <li key={c.id} className="border-s-2 border-neutral-200 ps-4">
          <div className="text-sm font-medium">{c.authorName}</div>
          <div className="text-xs text-neutral-500">
            <time dateTime={c.date}>
              {format.dateTime(new Date(c.date), { dateStyle: 'medium' })}
            </time>
          </div>
          <div
            className="mt-2 text-sm leading-relaxed"
            // Content is sanitized by WP on save; if rendering raw HTML from
            // less-trusted sources, run through isomorphic-dompurify first
            // (TECH_SPEC §17.1).
            dangerouslySetInnerHTML={{ __html: c.content }}
          />
        </li>
      ))}
    </ol>
  );
}
