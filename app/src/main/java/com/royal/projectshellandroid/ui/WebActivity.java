package com.royal.projectshellandroid.ui;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.JsResult;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ProgressBar;
import android.widget.Toast;

import com.github.lzyzsd.jsbridge.BridgeHandler;
import com.github.lzyzsd.jsbridge.BridgeWebView;
import com.github.lzyzsd.jsbridge.BridgeWebViewClient;
import com.github.lzyzsd.jsbridge.CallBackFunction;
import com.github.lzyzsd.jsbridge.DefaultHandler;
import com.royal.projectshellandroid.R;
import com.royal.projectshellandroid.util.QRCodeUtil;
import com.royal.projectshellandroid.util.Utils;

public class WebActivity extends AppCompatActivity {
    private BridgeWebView mWebView;
    private ProgressBar pb;
    private String url;
    private String h5Url;
    private static final int MY_PERMISSIONS_REQUEST = 1;
    private long exitTime = 0;
    private String mData = "";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);
        mWebView = findViewById(R.id.mWebView);
        pb = findViewById(R.id.pb);
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);
        settings.setAllowFileAccess(true);
        settings.setAppCacheEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        mWebView.setDefaultHandler(new DefaultHandler());
//        mWebView.addJavascriptInterface(new MyJsInterFace(),"registerHandler");
        Intent intent = getIntent();
        if (intent != null) {
            url = intent.getStringExtra("url");
            h5Url = intent.getStringExtra("h5Url");
        }

        mWebView.setWebViewClient(new BridgeWebViewClient(mWebView) {
            @Override
            public void onPageStarted(WebView webView, String s, Bitmap bitmap) {
                super.onPageStarted(webView, s, bitmap);
            }

            @Override
            public void onPageFinished(WebView webView, String s) {
                super.onPageFinished(webView, s);
            }

            @Override
            public void onReceivedSslError(WebView webView, SslErrorHandler sslErrorHandler, SslError sslError) {
                sslErrorHandler.proceed();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView webView, String url) {
                try {
                    if (url.startsWith("weixin://") || url.startsWith("alipays://") ||
                            url.startsWith("pay://") || url.startsWith("mqqapi://") || url.startsWith("tel://") || url.contains(".apk")) {

                        //其他自定义的scheme.
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    }
                } catch (Exception e) {
                    return false;
                }
                return super.shouldOverrideUrlLoading(webView, url);
            }
        });
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView webView, String s, String s1, JsResult jsResult) {
                return super.onJsAlert(webView, s, s1, jsResult);
            }

            @Override
            public void onProgressChanged(WebView webView, int i) {
                super.onProgressChanged(webView, i);
                if (i == 100) {
                    pb.setVisibility(View.INVISIBLE);
                } else {
                    pb.setVisibility(View.VISIBLE);
                    pb.setProgress(i);
                }
            }
        });
        mWebView.loadUrl(url);
        mWebView.callHandler("setConfigInfo", h5Url + ","+getString(R.string.language), new CallBackFunction() {
            @Override
            public void onCallBack(String data) {
                Log.e("fff", data);
            }
        });
        mWebView.registerHandler("showToast", new BridgeHandler() {
            @Override
            public void handler(String data, CallBackFunction function) {
                Log.d("showToast:", "handler = submitFromWeb, data from web = " + data);
            }
        });
        mWebView.registerHandler("saveQRCodeImg", new BridgeHandler() {
            @Override
            public void handler(String data, CallBackFunction function) {
                Log.d("saveQRCodeImg:", "handler = submitFromWeb, data from web = " + data);
                mData = data;
                checkPermissions();
            }
        });
    }

    private void saveToGallery() {
        Bitmap bmp = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher_round);
        String[] content = mData.split(",");
        QRCodeUtil.contentName = content[1];
        QRCodeUtil.context = WebActivity.this;
        Bitmap newBmp = QRCodeUtil.createQRCodeBitmap(content[0], Utils.dip2px(WebActivity.this,180), bmp, 0.2f);
        boolean isSuccess =  Utils.saveImageToGallery(WebActivity.this, newBmp);
        if(isSuccess){
            Toast.makeText(this, "已保存到系统相册", Toast.LENGTH_SHORT).show();
        }
    }

    private void checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                        MY_PERMISSIONS_REQUEST);
            } else {
                saveToGallery();
            }
        }else{
            saveToGallery();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {

        if (requestCode == MY_PERMISSIONS_REQUEST) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                saveToGallery();
            } else {
                Toast.makeText(this, "权限已拒绝,请在设置中允许存储权限", Toast.LENGTH_SHORT).show();
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_DOWN) {
            if ((System.currentTimeMillis() - exitTime) > 2000) {
                Toast.makeText(WebActivity.this, "再按一次退出程序", Toast.LENGTH_SHORT).show();
                exitTime = System.currentTimeMillis();
            } else {
                moveTaskToBack(true);
//                finish();
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (mWebView != null)
            mWebView.destroy();
        super.onDestroy();
    }

}
