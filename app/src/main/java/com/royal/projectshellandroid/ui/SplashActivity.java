package com.royal.projectshellandroid.ui;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.gyf.immersionbar.ImmersionBar;
import com.lzy.okgo.OkGo;
import com.lzy.okgo.model.Response;
import com.royal.projectshellandroid.R;
import com.royal.projectshellandroid.bean.VersionBean;
import com.royal.projectshellandroid.util.DownloadUtil;
import com.royal.projectshellandroid.util.JsonCallback;
import com.royal.projectshellandroid.util.NetWorkCheckManager;
import com.royal.projectshellandroid.util.SPUtils;
import com.royal.projectshellandroid.util.ToastUtil;
import com.royal.projectshellandroid.util.Utils;
import com.royal.projectshellandroid.util.ZipUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Locale;

public class SplashActivity extends AppCompatActivity {


    private View llProgress;
    private TextView tvProgress;
    private String unZipPath;
    private File zipFile;
    private String h5Version;
    private String log;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ImmersionBar.with(this).init();
        setContentView(R.layout.activity_splash);
        unZipPath = getFilesDir().getPath();
        llProgress = findViewById(R.id.llProgress);
        tvProgress = findViewById(R.id.tvProgress);
        getInitData();

        NetWorkCheckManager.setOnUrlCheckCallBack(new NetWorkCheckManager.OnUrlCheckCallBack() {
            @Override
            public void urlCheckCallBack(String localUrlPath, String url) {
                toWebPage(localUrlPath, url);
            }
        });
    }


    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    private void getInitData() {
        OkGo.<VersionBean>get(Constants.updateUrl).execute(new JsonCallback<VersionBean>() {
            @Override
            public void onSuccess(Response<VersionBean> response) {
                super.onSuccess(response);
                VersionBean bean = response.body();
                int key = bean.getV_key();
                String enlog = bean.getLog_en();
                String cnLog = bean.getLog_cn();
                String updateUrl = bean.getUrl_and();
                String h5Url = bean.getUrl_h5(); //更新含h5网页的zip地址
                String urls = bean.getUrl_req(); //线路地址
                String apkVersion = bean.getV_and(); //apk版本名
                h5Version = bean.getV_h5(); //h5版本名
                String h5V = Utils.getH5fileVersion();
                SPUtils.setPrefString(Constants.lineUrl, urls);
                String versionName = Utils.getVerName(SplashActivity.this); //当前apk版本名
                int versioncode = Utils.getVersionCode(SplashActivity.this); //当前apk版本号
                String locale = Locale.getDefault().getLanguage();//当前系统语言
                if(locale.equals(Constants.zh)){
                    log = cnLog;
                }else{
                    log = enlog;
                }
                //服务器版本号不等于当前apk版本名
                if (Utils.compareVersion(apkVersion, versionName) != 0) {
                    if (key == 1) {//更新原生apk
                        showUpdate(updateUrl, log);
                    } else {
                        NetWorkCheckManager.startCheck(urls.split(","));
                    }
                } else {
                    //服务器h5版本号不等于当前本地apk版本号
                    if ((Utils.compareVersion(h5Version, h5V) != 0)) {
                        if (key == 1) { //开关状态为开，自动下载解压缩，然后加载h5页面
                            downLoadZip(h5Url, urls);
                        } else {
                            NetWorkCheckManager.startCheck(urls.split(","));
                        }
                    } else {
                        NetWorkCheckManager.startCheck(urls.split(","));
                    }
                }
            }
            @Override
            public void onError(Response<VersionBean> response) {
                super.onError(response);
                ToastUtil.showToast(SplashActivity.this, R.string.net_error);
                String defaultLineUrl = SPUtils.getPrefString(Constants.lineUrl, "");
                if (TextUtils.isEmpty(defaultLineUrl)) {
                    NetWorkCheckManager.checkDefaultUrl();
                } else {
                    NetWorkCheckManager.startCheck(defaultLineUrl.split(","));
                }
            }
        });
    }


    /**
     * 下载zip文件
     */
    private void downLoadZip(String h5Url, final String checkUrl) {
        llProgress.setVisibility(View.VISIBLE);
        //下载到files目录中
        DownloadUtil.getInstance().download(h5Url, unZipPath, new DownloadUtil.OnDownloadListener() {
            @Override
            public void onDownloadSuccess(String path) {
                tvProgress.setText("100%");
                llProgress.setVisibility(View.GONE);
                SPUtils.setPrefString("h5Version", h5Version);
                //解压ZIP压缩包
                try {
                    //下载成功先删除本地文件
                    checkLocalFile();
                    //zip文件
                    zipFile = new File(path);
                    ZipUtils.UnZipFolder(zipFile.getAbsolutePath(), unZipPath);
                    String realPath = unZipPath + "/" + Utils.getFileName(path).split("\\.")[0] + "/login.html";
                    SPUtils.setPrefString(Constants.localPath, realPath); //保存线路地址
                    SPUtils.setPrefString(Constants.zipFileName, path); //保存的本地文件路径
                    NetWorkCheckManager.startCheck(checkUrl.split(","));
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onDownloading(int progress) {
                tvProgress.setText(progress + "%");
            }

            @Override
            public void onDownloadFailed() {
                ToastUtil.showToast(SplashActivity.this, getString(R.string.download_fail));
            }
        });
    }

    /**
     * 下载成功先删除本地zip文件
     */
    private void checkLocalFile() {
        String filePath = SPUtils.getPrefString(Constants.zipFileName, "");
        File file = new File(filePath);
        if (file.exists()) {
            file.delete();
            SPUtils.clear(Constants.zipFileName);
            Log.d(getString(R.string.app_name), "本地文件删除成功");
        }
    }


    /**
     * apk更新对话框
     *
     * @param updateUrl
     * @param log
     */
    private void showUpdate(String updateUrl, String log) {
        llProgress.setVisibility(View.GONE);
        UpdateDialogFragment dialogFragment = UpdateDialogFragment.newInstance(updateUrl, log, unZipPath);
        dialogFragment.show(getSupportFragmentManager(), "UpdateDialogFragment");
    }

    private void toWebPage(String localUrlPath, String url) {
        startActivity(new Intent(SplashActivity.this, WebActivity.class).putExtra("url", localUrlPath).putExtra("h5Url", url));
        finish();
    }
}
