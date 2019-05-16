package com.royal.projectshellandroid.ui;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.DialogFragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.royal.projectshellandroid.R;
import com.royal.projectshellandroid.util.DownloadUtil;
import com.royal.projectshellandroid.util.Utils;

public class UpdateDialogFragment extends DialogFragment implements View.OnClickListener {

    private View view;
    private TextView tvContent;
    private TextView btnUpdate;
    private ProgressBar pb;
    private String UpdateUrl;
    private String savePath;
    private TextView cuPos;

    public static UpdateDialogFragment newInstance(String UpdateUrl, String log, String savePath) {
        UpdateDialogFragment updateDialogFragment = new UpdateDialogFragment();
        Bundle bundle = new Bundle();
        bundle.putString("log", log);
        bundle.putString("UpdateUrl", UpdateUrl);
        bundle.putString("savePath", savePath);
        updateDialogFragment.setArguments(bundle);
        return updateDialogFragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setStyle(DialogFragment.STYLE_NO_TITLE, R.style.loading_dialog);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        getDialog().requestWindowFeature(Window.FEATURE_NO_TITLE);
        setCancelable(false);

        view = inflater.inflate(R.layout.upgrade_dialog, container, false);
        tvContent = view.findViewById(R.id.tvContent);
        btnUpdate = view.findViewById(R.id.btnUpdate);
        cuPos = view.findViewById(R.id.cuPos);
        pb = view.findViewById(R.id.pb);
        btnUpdate.setOnClickListener(this);
        if (getArguments() != null) {
            String log = getArguments().getString("log");
            UpdateUrl = getArguments().getString("UpdateUrl");
            savePath = getArguments().getString("savePath");
            tvContent.setText(log);
        }
        initView();
        return view;
    }

    private void initView() {

    }

    public void dismiss() {
        dismissAllowingStateLoss();
    }


    @Override
    public void onClick(View v) {
        if (btnUpdate.getText().equals(getString(R.string.update_now))) {
            btnUpdate.setText(getString(R.string.downloading));
            btnUpdate.setClickable(false);
            downLoad();
        }
    }

    private void downLoad() {
        DownloadUtil.getInstance().download(UpdateUrl, savePath, new DownloadUtil.OnDownloadListener() {
            @Override
            public void onDownloadSuccess(String path) {
                Toast.makeText(getActivity(), R.string.download_success, Toast.LENGTH_SHORT).show();
                Utils.installApk(getContext(), path);
                dismiss();
            }

            @Override
            public void onDownloading(int progress) {
                pb.setProgress(progress);
                cuPos.setText(progress + "/100");
            }

            @Override
            public void onDownloadFailed() {
                Toast.makeText(getActivity(), R.string.download_fail, Toast.LENGTH_SHORT).show();
            }
        });
    }

}

