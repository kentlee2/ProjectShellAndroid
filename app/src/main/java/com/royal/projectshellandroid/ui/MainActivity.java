package com.royal.projectshellandroid.ui;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;

import com.royal.projectshellandroid.R;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

    }
    public void one(View view){
         startActivity(new Intent(this,SplashActivity.class).putExtra("type",1));
    }
    public void two(View view){
        startActivity(new Intent(this,SplashActivity.class).putExtra("type",2));
    }


}
