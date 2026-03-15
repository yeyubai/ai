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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { fetchDiaryEntry, saveDiaryEntry } from '../../api/diary.api';

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

  if (sessionStatus !== 'ready' || isLoading) {
    return (
      <div className="app-page bg-white px-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="mt-6 h-[60vh] rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white pb-[calc(138px+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pt-4">
        <div className="flex items-center justify-between">
          <Link
            href="/diary"
            aria-label="返回日记列表"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cyan-500 transition hover:bg-cyan-50"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            aria-label="保存日记"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cyan-500 transition hover:bg-cyan-50 disabled:opacity-50"
          >
            <Check className="h-6 w-6" />
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
            className="min-h-[52vh] outline-none [&_img]:mx-auto [&_li]:ml-5 [&_p]:min-h-[1.75rem]"
            style={{
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

      <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-md border-t border-slate-100 bg-white/96 px-4 pb-3 pt-2 backdrop-blur">
        <div className="grid grid-cols-8 gap-1">
          <button type="button" className="h-11 rounded-xl text-[22px] text-slate-700" onClick={() => applyCommand('removeFormat')}>A</button>
          <button type="button" className="h-11 rounded-xl text-[18px] text-slate-700" onClick={() => applyCommand('formatBlock', 'p')}>Aa</button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={() => applyCommand('bold')}><Bold className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={() => applyCommand('italic')}><Italic className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={() => applyCommand('underline')}><Underline className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={() => applyCommand('strikeThrough')}><Strikethrough className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={() => applyCommand('insertUnorderedList')}><List className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-700" onClick={handleChecklist}><ListChecks className="h-5 w-5" /></button>
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1 border-t border-slate-100 pt-2">
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-cyan-500" onClick={() => applyCommand('insertText', ` ${formatDiaryMeta(new Date().toISOString())} `)}><Clock3 className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-cyan-500" onClick={() => fileInputRef.current?.click()}><ImagePlus className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-300" onClick={() => applyCommand('undo')}><RotateCcw className="h-5 w-5" /></button>
          <button type="button" className="flex h-11 items-center justify-center rounded-xl text-slate-300" onClick={() => applyCommand('redo')}><RotateCw className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}
