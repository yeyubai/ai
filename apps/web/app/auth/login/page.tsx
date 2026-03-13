import { Compass, HeartPulse, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPageSection } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className="page-shell page-shell-centered relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_circle_at_10%_20%,hsl(177_72%_70%/.24),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_88%_14%,hsl(24_100%_78%/.2),transparent_48%)]" />
      <div className="relative grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="hidden border-border/70 bg-card/88 backdrop-blur lg:flex">
          <CardHeader className="space-y-3 border-b border-border/60 bg-gradient-to-r from-secondary/70 to-accent/60">
            <Badge variant="secondary" className="w-fit">日常减脂教练</Badge>
            <CardTitle className="text-3xl">今天只做 3 件事，先把节奏找回来</CardTitle>
            <CardDescription>这是一个面向反复减脂失败者的科学减脂陪伴服务。我们先帮你完成下一步，而不是再给你一大套复杂计划。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 motion-stagger sm:grid-cols-3">
            <div className="surface-card p-4"><Compass className="h-5 w-5 text-primary" /><p className="mt-3 text-sm text-muted-foreground">首页首屏只给一个明确下一步。</p></div>
            <div className="surface-card p-4"><Sparkles className="h-5 w-5 text-primary" /><p className="mt-3 text-sm text-muted-foreground">晚间复盘会在你掉队时自动切换恢复模式。</p></div>
            <div className="surface-card p-4"><HeartPulse className="h-5 w-5 text-primary" /><p className="mt-3 text-sm text-muted-foreground">趋势和会员能力都围绕“更稳地坚持”。</p></div>
          </CardContent>
        </Card>
        <div className="motion-enter motion-delay-1">
          <LoginPageSection />
        </div>
      </div>
    </main>
  );
}
