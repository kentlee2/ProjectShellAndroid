package com.royal.projectshellandroid.util;

import android.text.TextUtils;
import android.util.Log;

import com.royal.projectshellandroid.bean.CheckResult;
import com.royal.projectshellandroid.bean.PingNetEntity;
import com.royal.projectshellandroid.ui.Constants;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class NetWorkCheckManager {
    private static String fastUrl = "";
    private static OnUrlCheckCallBack urlCheckCallBack;

    /**
     * 请求默认线路
     */
    public static void checkDefaultUrl() {
        final String[] urls = Constants.defaultLineUrl.split(",");
        startCheck(urls);
    }

    /**
     * 线路检测
     * @param urls
     */
    public static void startCheck(final String[] urls) {
        String path = SPUtils.getPrefString(Constants.localPath, "");
        String localPath;
        if (TextUtils.isEmpty(path)) {
            localPath = Constants.defaultUrl;
        } else {
            localPath ="file:"+ path;
        }
        List<CheckResult> results = new ArrayList<>();
        Log.i("线路" , "线路检测中==========");
        for (int i = 0; i < urls.length; i++) {
            PingNetEntity pingNetEntity = new PingNetEntity(urls[i], 2, 10, new StringBuffer());
            PingNetEntity ping = PingNet.ping(pingNetEntity);
            if (ping.isResult()) {
                CheckResult result = new CheckResult();
                Log.i("线路" + i + "地址：", ping.getIp());
                Log.i("线路" + i + "速度：", "time=" + ping.getPingTime() + " ms ");
                Log.i("线路" + i +"结果：", ping.isResult() + "");
                result.setSpeed(Integer.valueOf(ping.getPingTime()));
                result.setUrl("http://" + ping.getIp());
                results.add(result);
            } else {
                //所有线路检查失败，使用第一条线路
                if (i == urls.length - 1) {
                    fastUrl = "http://"+Constants.defaultLineUrl.split(",")[0];
                }
            }
        }
        if (!results.isEmpty()) {
            Collections.sort(results, new Comparator<CheckResult>() {
                @Override
                public int compare(CheckResult f1, CheckResult f2) {
                    if (f1.getSpeed() <= f2.getSpeed()) {
                        return -1;
                    }
                    return 1;
                }
            });
            fastUrl = results.get(0).getUrl();
        }
        Log.i("已选择最快线路", fastUrl);
        if (urlCheckCallBack != null) {
            urlCheckCallBack.urlCheckCallBack(localPath,fastUrl );
        }
    }

    public static void setOnUrlCheckCallBack(OnUrlCheckCallBack callBack) {
        urlCheckCallBack = callBack;
    }

    public interface OnUrlCheckCallBack {
        void urlCheckCallBack(String localUrlPath, String url);
    }
}
