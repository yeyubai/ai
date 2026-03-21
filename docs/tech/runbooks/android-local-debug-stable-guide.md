# Android 本地联调稳定手册

owner: engineering
last_updated: 2026-03-21
related_files:
- apps/native/.env
- apps/native/capacitor.config.ts
- apps/web/.env

## 目标

这份手册用于固化当前混合 App 的稳定本地联调流程，覆盖以下场景：
- Android 模拟器本地联调
- Android 真机本地联调
- 当前仓库已经踩过的高频问题与排查方式

## 核心规则

1. 不要让模拟器和真机共用同一个 `NATIVE_WEB_APP_URL`。
2. 真机绝对不能使用 `localhost`。
3. 模拟器可以使用 `10.0.2.2`，也可以在配合 `adb reverse` 时使用 `localhost`。
4. 真机联调时，不要在 `apps/web/.env` 中写死 `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1`。
5. 每次修改 `apps/native/.env` 后，都必须重新执行一次 `npx cap sync android`，然后再安装新包。

## 环境文件

### apps/native/.env

根据联调目标选择不同配置。

模拟器：

```env
NATIVE_APP_MODE=debug
NATIVE_WEB_APP_URL=http://10.0.2.2:3000
```

真机：

```env
NATIVE_APP_MODE=debug
NATIVE_WEB_APP_URL=http://你的电脑局域网IP:3000
```

例如：

```env
NATIVE_APP_MODE=debug
NATIVE_WEB_APP_URL=http://192.168.198.50:3000
```

注意：
- URL 必须带上 `http://`
- 如果少了协议头，Android App 会在启动时直接崩溃

### apps/web/.env

真机联调时，不要把 API 地址固定写死成 `localhost`。

错误示例：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

推荐做法：
- 真机联调期间直接删除这条配置
- 让前端自动根据当前页面的 hostname 推导 API 地址

## 启动服务

在仓库根目录执行：

```bash
npm.cmd run dev
```

启动后先验证：
- Web 可从本机访问：`http://localhost:3000`
- Backend 可从本机访问：`http://localhost:3001/api/v1/health`

真机联调时，还要额外验证：
- `http://你的电脑局域网IP:3000`
- `http://你的电脑局域网IP:3001/api/v1/health`

## Android 模拟器流程

### 方案 A：使用 `10.0.2.2`

1. 将 `apps/native/.env` 配成：

```env
NATIVE_WEB_APP_URL=http://10.0.2.2:3000
```

2. 同步原生工程：

```bash
cd apps/native
npx cap sync android
```

3. 构建调试包：

```bash
npm run android:assemble:debug
```

4. 将新 APK 重新安装到模拟器。

### 方案 B：使用 `localhost + adb reverse`

1. 先建立端口反向映射：

```bash
adb -s emulator-5554 reverse tcp:3000 tcp:3000
adb -s emulator-5554 reverse tcp:3001 tcp:3001
```

2. 将 `apps/native/.env` 配成：

```env
NATIVE_WEB_APP_URL=http://localhost:3000
```

3. 再执行同步和打包：

```bash
cd apps/native
npx cap sync android
npm run android:assemble:debug
```

4. 将新 APK 重新安装到模拟器。

## Android 真机流程

1. 确认手机和电脑在同一个 Wi-Fi / 局域网下。
2. 找到电脑当前的局域网 IP。
3. 将 `apps/native/.env` 配成：

```env
NATIVE_WEB_APP_URL=http://你的电脑局域网IP:3000
```

4. 同步原生工程：

```bash
cd apps/native
npx cap sync android
```

5. 构建调试包：

```bash
npm run android:assemble:debug
```

6. 安装到真机：

```bash
adb -s DEVICE_ID install -r app/build/outputs/apk/debug/app-debug.apk
```

7. 安装完成后，彻底关闭 App，再重新打开。

## 推荐命令

建议以后直接在 `apps/native` 目录下优先使用：

```bash
npx cap sync android
npx cap copy android
npm run android:assemble:debug
```

原因：
- `cap sync` 和 `cap copy` 是 Capacitor 原生命令，更容易排查问题
- 本地联调时，原生命令比多层包装脚本更直观
- 包装脚本只在“确实增加了额外行为”时才有保留价值，例如构建前补 Gradle 兼容补丁

## 常见问题

### 现象：一直显示原生占位页

说明：
- App 没有加载到真实的 Web 地址

优先检查：
- `apps/native/.env` 是否存在
- `NATIVE_WEB_APP_URL` 是否已配置
- `android/app/src/main/assets/capacitor.config.json` 里的 `server.url` 是否是预期值
- 修改配置后，是否重新执行过 `cap sync android` 并安装了新包

### 现象：App 一打开就闪退

当前仓库已确认的原因：
- `NATIVE_WEB_APP_URL` 少写了 `http://`

错误示例：

```env
NATIVE_WEB_APP_URL=192.168.198.50:3000
```

正确示例：

```env
NATIVE_WEB_APP_URL=http://192.168.198.50:3000
```

### 现象：临时会话初始化失败

说明：
- Web 页面已经打开，但 `POST /api/v1/auth/guest` 失败了

优先检查：
- `apps/web/.env` 里是否还写死了 `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1`
- 真机/模拟器是否能访问：
  - `http://你的电脑局域网IP:3001/api/v1/health`
- 设备和电脑是否确实在同一网络
- Windows 防火墙是否允许 `3001` 入站访问

### 现象：浏览器能打开 3000，但 App 里仍然失败

优先检查：
- 设备浏览器是否能同时打开：
  - `http://你的电脑局域网IP:3000`
  - `http://你的电脑局域网IP:3001/api/v1/health`
- 修改 native 配置后，是否安装了最新 APK

### 现象：Next dev 报 `*.pack.gz` 缓存文件缺失

说明：
- 通常是 `.next-dev` 缓存损坏，或者上次 dev 进程被强行打断

处理方式：

```bash
cd apps/web
rd /s /q .next-dev
```

然后重启前端 dev。

## 验收清单

- `apps/native/.env` 与当前联调目标一致
- `apps/web/.env` 没有把 API 固定到 `localhost:3001`
- 每次 native 环境变量变更后都重新执行过 `npx cap sync android`
- 目标设备上安装的是最新 APK
- 设备浏览器可以打开 Web 页面和 backend health 接口
