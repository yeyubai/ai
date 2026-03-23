'use client';

import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bold,
  Check,
  Clock3,
  ImagePlus,
  Italic,
  List,
  ListChecks,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { cn } from '@/lib/utils';
import { fetchDiaryEntry, saveDiaryEntry } from '../../api/diary.api';

type EditorToolbarAction = {
  key: string;
  ariaLabel: string;
  onClick: () => void;
  icon?: typeof Bold;
  label?: string;
  tone?: 'default' | 'accent' | 'muted';
  labelClassName?: string;
};

const editorHeaderActionClassName = cn(
  buttonVariants({ variant: 'ghost', size: 'icon-lg' }),
  'rounded-full text-cyan-500 hover:bg-cyan-50',
);

const editorToolbarActionClassName =
  'inline-flex h-11 w-full items-center justify-center rounded-xl border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 hover:bg-slate-100';

const editorToolbarToneClassName: Record<NonNullable<EditorToolbarAction['tone']>, string> = {
  default: 'text-slate-700',
  accent: 'text-cyan-500',
  muted: 'text-slate-300',
};

function formatDiaryMeta(value: string): string {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/g, '')
    .trim();
}

function htmlToPlainText(html: string): string {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, '').trim();
  }

  const container = window.document.createElement('div');
  container.innerHTML = html;
  return (container.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function DiaryEditorSection({ entryId }: { entryId?: string }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [html, setHtml] = useState('');
  const [plainText, setPlainText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(entryId));
  const [isSaving, setIsSaving] = useState(false);
  const [metaTime, setMetaTime] = useState(formatDiaryMeta(new Date().toISOString()));

  useEffect(() => {
    if (!token || sessionStatus !== 'ready') {
      return;
    }

    if (!entryId) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const entry = await fetchDiaryEntry(entryId);
        if (!active) {
          return;
        }

        if (!entry) {
          setError('日记不存在或已被移除。');
          return;
        }

        setHtml(entry.contentHtml);
        setPlainText(entry.plainText);
        setMetaTime(formatDiaryMeta(entry.updatedAt));
        if (editorRef.current) {
          editorRef.current.innerHTML = entry.contentHtml;
        }
      } catch {
        if (active) {
          setError('日记读取失败，请稍后重试。');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [entryId, sessionStatus, token]);

  useEffect(() => {
    if (!entryId && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.focus();
    }
  }, [entryId]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  const syncEditorContent = () => {
    const nextHtml = sanitizeHtml(editorRef.current?.innerHTML ?? '');
    const nextPlainText = htmlToPlainText(nextHtml);
    setHtml(nextHtml);
    setPlainText(nextPlainText);
  };

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const handleChecklist = () => {
    applyCommand('insertHTML', '<ul><li>待办事项</li></ul>');
  };

  const handleImagePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('image read failed'));
      reader.readAsDataURL(file);
    });

    applyCommand(
      'insertHTML',
      `<img src="${dataUrl}" alt="日记图片" style="max-width:100%;border-radius:18px;margin:16px 0;" />`,
    );

    event.target.value = '';
  };

  const handleSave = async () => {
    const nextHtml = sanitizeHtml(editorRef.current?.innerHTML ?? html ?? '');
    const nextPlainText = htmlToPlainText(nextHtml);
    setHtml(nextHtml);
    setPlainText(nextPlainText);
    setIsSaving(true);
    setError(null);

    try {
      await saveDiaryEntry(
        {
          contentHtml: nextHtml || '<p></p>',
          plainText: nextPlainText,
        },
        entryId,
      );
      router.replace('/diary');
    } catch {
      setError('保存日记失败，请稍后重试。');
      setIsSaving(false);
    }
  };

  const primaryToolbarActions: EditorToolbarAction[] = [
    {
      key: 'clear-formatting',
      ariaLabel: 'Clear formatting',
      label: 'A',
      labelClassName: 'text-[1.25rem] font-medium tracking-[-0.03em]',
      onClick: () => applyCommand('removeFormat'),
    },
    {
      key: 'paragraph',
      ariaLabel: 'Paragraph style',
      label: 'Aa',
      labelClassName: 'text-[1.05rem] font-semibold tracking-[-0.02em]',
      onClick: () => applyCommand('formatBlock', 'p'),
    },
    {
      key: 'bold',
      ariaLabel: 'Bold',
      icon: Bold,
      onClick: () => applyCommand('bold'),
    },
    {
      key: 'italic',
      ariaLabel: 'Italic',
      icon: Italic,
      onClick: () => applyCommand('italic'),
    },
    {
      key: 'underline',
      ariaLabel: 'Underline',
      icon: Underline,
      onClick: () => applyCommand('underline'),
    },
    {
      key: 'strike-through',
      ariaLabel: 'Strike through',
      icon: Strikethrough,
      onClick: () => applyCommand('strikeThrough'),
    },
    {
      key: 'unordered-list',
      ariaLabel: 'Bullet list',
      icon: List,
      onClick: () => applyCommand('insertUnorderedList'),
    },
    {
      key: 'checklist',
      ariaLabel: 'Checklist',
      icon: ListChecks,
      onClick: handleChecklist,
    },
  ];

  const secondaryToolbarActions: EditorToolbarAction[] = [
    {
      key: 'insert-time',
      ariaLabel: 'Insert time',
      icon: Clock3,
      tone: 'accent',
      onClick: () => applyCommand('insertText', ` ${formatDiaryMeta(new Date().toISOString())} `),
    },
    {
      key: 'insert-image',
      ariaLabel: 'Insert image',
      icon: ImagePlus,
      tone: 'accent',
      onClick: () => fileInputRef.current?.click(),
    },
    {
      key: 'undo',
      ariaLabel: 'Undo',
      icon: RotateCcw,
      tone: 'muted',
      onClick: () => applyCommand('undo'),
    },
    {
      key: 'redo',
      ariaLabel: 'Redo',
      icon: RotateCw,
      tone: 'muted',
      onClick: () => applyCommand('redo'),
    },
  ];

  const renderToolbarAction = ({
    key,
    ariaLabel,
    onClick,
    icon: Icon,
    label,
    tone = 'default',
    labelClassName,
  }: EditorToolbarAction) => (
    <button
      key={key}
      type="button"
      aria-label={ariaLabel}
      className={cn(editorToolbarActionClassName, editorToolbarToneClassName[tone])}
      onClick={onClick}
    >
      {Icon ? (
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={cn(
            'inline-flex min-w-[1.5rem] items-center justify-center leading-none',
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
    </button>
  );

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page bg-white px-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton
          className="mt-6 rounded-[32px]"
          style={{ height: 'max(24rem, calc(var(--app-viewport-height) - 16rem))' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[var(--app-viewport-height)] bg-white pb-[calc(138px+var(--app-safe-area-bottom)+var(--native-keyboard-inset))]">
      <div className="app-safe-top-compact mx-auto flex min-h-[var(--app-viewport-height)] w-full max-w-md flex-col px-4">
        <div className="flex items-center justify-between">
          <Link
            href="/diary"
            aria-label="返回日记列表"
            className={editorHeaderActionClassName}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            aria-label="保存日记"
            className={editorHeaderActionClassName}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 px-1 text-sm text-slate-400">
          {metaTime} | {plainText.length}字
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-6 flex-1 px-1">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditorContent}
            className="outline-none [&_img]:mx-auto [&_li]:ml-5 [&_p]:min-h-[1.75rem]"
            style={{
              minHeight: 'max(20rem, calc(var(--app-viewport-height) - 21rem - var(--native-keyboard-inset)))',
              fontSize: '17px',
              lineHeight: '1.95',
              color: '#0f172a',
            }}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleImagePick(event)}
        />
      </div>

      <div className="native-keyboard-surface fixed inset-x-0 bottom-[calc(16px+var(--app-safe-area-bottom)+var(--native-keyboard-inset))] z-30 mx-auto w-full max-w-md border-t border-slate-100 bg-white/96 px-4 pb-3 pt-2 backdrop-blur">
        <div className="grid grid-cols-8 gap-1">
          {primaryToolbarActions.map(renderToolbarAction)}
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1 border-t border-slate-100 pt-2">
          {secondaryToolbarActions.map(renderToolbarAction)}
        </div>
      </div>
    </div>
  );
}
