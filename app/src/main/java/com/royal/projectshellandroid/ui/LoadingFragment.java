package com.royal.projectshellandroid.ui;

import android.app.Dialog;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.DialogFragment;

import com.royal.projectshellandroid.R;

public class LoadingFragment extends DialogFragment {

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        final Dialog dialog = new Dialog(getActivity(), R.style.loading_dialog);
        dialog.setContentView(R.layout.fragment_loading);
        dialog.setCancelable(true);
        return dialog;
    }

    public void dismiss() {
       dismissAllowingStateLoss();
    }
}
