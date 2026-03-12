# Native Bridge Rules

## JSBridge 协议
- 统一字段：id/action/payload/ok/error
- bridge 方法必须做白名单校验与权限控制
- 所有入参必须进行 schema 校验

## Android WebView 安全
- 不需要 JS 时不要开启 setJavaScriptEnabled
- addJavascriptInterface 仅对可信内容启用
- 禁止或最小化本地文件访问 setAllowFileAccess / setAllowFileAccessFromFileURLs / setAllowUniversalAccessFromFileURLs
- 不需要内容访问时关闭 setAllowContentAccess
- 本地资源优先使用 WebViewAssetLoader
- 生产环境禁用 WebView 调试 setWebContentsDebuggingEnabled(false)
- 禁止明文 HTTP 访问，使用 networkSecurityConfig 或 usesCleartextTraffic=false
- 在 shouldOverrideUrlLoading / loadUrl / evaluateJavascript 前先校验 URL

## iOS WebView 安全
- 禁止使用 UIWebView，统一使用 WKWebView
- App Transport Security 默认禁止任意明文加载
- 避免设置 NSAllowsArbitraryLoads=YES，确需例外需有审计与白名单
