package com.aiweightcoach.android;

import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {

    private static final String LOCAL_FALLBACK_URL = "http://localhost/fallback.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        bridgeBuilder.addWebViewListener(new ReleaseGuardWebViewListener());
        super.onCreate(savedInstanceState);
    }

    private static boolean isReleaseMode() {
        return "release".equalsIgnoreCase(BuildConfig.NATIVE_APP_MODE);
    }

    private static boolean isFallbackUrl(String url) {
        return url != null && url.startsWith(LOCAL_FALLBACK_URL);
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private static String normalizeJsString(String value) {
        if (value == null || "null".equals(value) || "undefined".equals(value)) {
            return "";
        }

        String normalized = value.trim();
        if (normalized.length() >= 2 && normalized.startsWith("\"") && normalized.endsWith("\"")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        return normalized.replace("\\u003C", "<").replace("\\n", "\n").replace("\\\"", "\"");
    }

    private static int compareVersions(String currentVersion, String minimumVersion) {
        String[] currentParts = currentVersion.split("[^0-9]+");
        String[] minimumParts = minimumVersion.split("[^0-9]+");
        int maxLength = Math.max(currentParts.length, minimumParts.length);

        for (int index = 0; index < maxLength; index++) {
            int current = index < currentParts.length && !currentParts[index].isEmpty()
                ? parseVersionPart(currentParts[index])
                : 0;
            int minimum = index < minimumParts.length && !minimumParts[index].isEmpty()
                ? parseVersionPart(minimumParts[index])
                : 0;

            if (current != minimum) {
                return Integer.compare(current, minimum);
            }
        }

        return 0;
    }

    private static int parseVersionPart(String part) {
        try {
            return Integer.parseInt(part);
        } catch (NumberFormatException error) {
            return 0;
        }
    }

    private static String buildFallbackUrl(String reason, String targetUrl, String expectedVersion, String actualVersion) {
        return LOCAL_FALLBACK_URL +
            "?reason=" + urlEncode(reason) +
            "&target=" + urlEncode(targetUrl) +
            "&expectedVersion=" + urlEncode(expectedVersion) +
            "&actualVersion=" + urlEncode(actualVersion) +
            "&updateUrl=" + urlEncode(BuildConfig.RELEASE_UPDATE_URL) +
            "&supportUrl=" + urlEncode(BuildConfig.RELEASE_SUPPORT_URL);
    }

    private static class ReleaseGuardWebViewListener extends WebViewListener {

        private boolean hasCommittedRemoteContent = false;

        @Override
        public void onPageStarted(WebView webView) {
            String currentUrl = webView.getUrl();
            if (currentUrl != null && !isFallbackUrl(currentUrl) && !currentUrl.startsWith("http://localhost")) {
                hasCommittedRemoteContent = false;
            }
        }

        @Override
        public void onPageCommitVisible(WebView webView, String url) {
            if (url != null && !isFallbackUrl(url) && !url.startsWith("http://localhost")) {
                hasCommittedRemoteContent = true;
            }
        }

        @Override
        public void onReceivedError(WebView webView) {
            maybeLoadFallback(webView, "load_error", BuildConfig.MIN_WEB_APP_VERSION, "");
        }

        @Override
        public void onReceivedHttpError(WebView webView) {
            maybeLoadFallback(webView, "http_error", BuildConfig.MIN_WEB_APP_VERSION, "");
        }

        @Override
        public void onPageLoaded(WebView webView) {
            maybeVerifyWebVersion(webView);
        }

        private void maybeVerifyWebVersion(WebView webView) {
            if (!isReleaseMode()) {
                return;
            }

            String minimumVersion = BuildConfig.MIN_WEB_APP_VERSION;
            if (minimumVersion == null || minimumVersion.isEmpty()) {
                return;
            }

            String currentUrl = webView.getUrl();
            if (currentUrl == null || isFallbackUrl(currentUrl) || currentUrl.startsWith("http://localhost")) {
                return;
            }

            String script =
                "(function() {" +
                "  return window.__APP_VERSION__" +
                "    || (document.querySelector('meta[name=\"ai-web-app-version\"]') && document.querySelector('meta[name=\"ai-web-app-version\"]').content)" +
                "    || (document.body && document.body.dataset && document.body.dataset.appVersion)" +
                "    || '';" +
                "})()";

            webView.evaluateJavascript(
                script,
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        String actualVersion = normalizeJsString(value);
                        if (actualVersion.isEmpty() || compareVersions(actualVersion, minimumVersion) < 0) {
                            maybeLoadFallback(webView, "version_mismatch", minimumVersion, actualVersion);
                        }
                    }
                }
            );
        }

        private void maybeLoadFallback(WebView webView, String reason, String expectedVersion, String actualVersion) {
            if (!isReleaseMode()) {
                return;
            }

            if (hasCommittedRemoteContent) {
                return;
            }

            String currentUrl = webView.getUrl();
            if (currentUrl == null || isFallbackUrl(currentUrl)) {
                return;
            }

            webView.loadUrl(buildFallbackUrl(reason, currentUrl, expectedVersion, actualVersion));
        }
    }
}
