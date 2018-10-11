package pk.org.cerp.mischool.mischoolcompanion

import android.support.v7.app.AppCompatActivity
import android.os.Bundle

private static final String TAG = "MISchool-Companion";

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Intent intent = getIntent();
        String action = intent.getAction();
        Uri data = intent.getData();

        Log.i(TAG, intent);
        Log.i(TAG, action);
        Log.i(TAG, data);
    }
}
