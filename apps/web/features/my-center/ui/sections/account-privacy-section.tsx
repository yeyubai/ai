'use client';

import { useEffect, useState } from 'react';
import { Download, ShieldAlert, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cancelDeleteRequest, createDeleteRequest, createExportTask, fetchDeleteRequest, fetchExportTask } from '../../api/my-center.api';
import type { DeleteStatus, ExportTask } from '../../types/my-center.types';

export function AccountPrivacySection() {
  const [exportTask, setExportTask] = useState<ExportTask | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchDeleteRequest().then(setDeleteStatus).catch(() => setDeleteStatus(null));
  }, []);

  const handleExport = async () => {
    const created = await createExportTask();
    const latest = await fetchExportTask(created.taskId);
    setExportTask(latest);
    setMessage('导出任务已创建。');
  };

  const handleDelete = async () => {
    const created = await createDeleteRequest();
    setDeleteStatus(created);
    setMessage('注销申请已创建，可在冷静期内取消。');
  };

  const handleCancelDelete = async () => {
    await cancelDeleteRequest();
    setDeleteStatus(null);
    setMessage('注销申请已取消。');
  };

  return (
    <Card className="border-border/70 bg-card/92 backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/80 to-accent/60">
        <Badge variant="secondary" className="w-fit">账户与隐私</Badge>
        <CardTitle className="text-3xl">低频操作放在这里，不打扰主流程</CardTitle>
        <CardDescription>导出和注销都需要明确状态，不做隐藏入口。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <p className="font-semibold">数据导出</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">导出会生成临时下载链接，方便你查看自己的记录与节奏变化。</p>
          <Button className="mt-4" onClick={() => void handleExport()}>创建导出</Button>
          {exportTask ? (
            <div className="mt-4 rounded-2xl bg-muted/55 p-3 text-sm text-muted-foreground">
              <p>任务状态：{exportTask.status}</p>
              {exportTask.downloadUrl ? <p className="mt-1 break-all">下载链接：{exportTask.downloadUrl}</p> : null}
            </div>
          ) : null}
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <p className="font-semibold">账号注销</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">申请后进入冷静期，可在生效前取消。</p>
          <div className="mt-4 flex gap-3">
            <Button variant="destructive" onClick={() => void handleDelete()}>
              <Trash2 className="h-4 w-4" />
              发起注销
            </Button>
            {deleteStatus ? (
              <Button variant="outline" onClick={() => void handleCancelDelete()}>取消申请</Button>
            ) : null}
          </div>
          {deleteStatus ? (
            <div className="mt-4 rounded-2xl bg-muted/55 p-3 text-sm text-muted-foreground">
              <p>状态：{deleteStatus.status}</p>
              <p className="mt-1">生效时间：{deleteStatus.effectiveAt}</p>
            </div>
          ) : null}
        </div>
        {message ? (
          <Alert className="lg:col-span-2">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
