package pk.org.cerp.mischool.mischoolcompanion

import android.content.Intent
import android.net.Uri
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.telephony.SmsManager
import android.util.Log
import android.widget.Toast

const val TAG = "MISchool-Companion"

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        val intent = this.intent

        val action = intent.action
        val data = intent.data
        val dataString = intent.dataString

        //Log.i(TAG, intent.dataString)
        //Log.i(TAG, action)
        Log.d(TAG, "HELLOOOO")
        Log.d(TAG, intent.action)
        if (data != null && dataString != null) {
            Log.d(TAG, "NOT NULL")
            Log.d(TAG, dataString)
        }

        // read a list of phone numbers and messages, dispatch texts to all.
    }

    fun sendSMS(text: String, phoneNumber: String) {
        val smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null, text, null, null)

        Toast.makeText(applicationContext, "Message Sent", Toast.LENGTH_SHORT).show();
    }
}
