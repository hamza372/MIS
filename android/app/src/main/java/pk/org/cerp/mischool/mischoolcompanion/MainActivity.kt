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


        val intent = getIntent()

        val action = intent.getAction()
        val data = intent.getData()

        Log.i(TAG, intent.dataString)
        Log.i(TAG, action)

        
    }

    fun sendSMS(text: String, phoneNumber: String) {
        val smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null, text, null, null)

        Toast.makeText(applicationContext, "Message Sent", Toast.LENGTH_SHORT).show();
    }
}
