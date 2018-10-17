package pk.org.cerp.mischool.mischoolcompanion

import android.app.Activity
import android.app.PendingIntent.getActivity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.telephony.SmsManager
import android.util.Log
import android.widget.Toast
import com.beust.klaxon.Klaxon
import java.lang.Exception
import java.util.jar.Manifest

const val TAG = "MISchool-Companion"
const val MY_PERMISSIONS_SEND_SMS = 1

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        val intent = this.intent

        val data = intent.data
        val dataString = intent.dataString

        permissions()

        Log.d(TAG, "HELLOOOO")
        Log.d(TAG, intent.action)
        if (data != null && dataString != null) {
            Log.d(TAG, "NOT NULL")
            Log.d(TAG, dataString)

            val json_string = java.net.URLDecoder.decode(dataString.split("=")[1], "UTF-8")
            Log.d(TAG, json_string)

            val parsed : SMSPayload? = Klaxon().parse(json_string)

            for(p in parsed?.messages.orEmpty()) {
                Log.d(TAG, "send " + p.text + " to " + p.number)
                sendSMS(p.text, p.number)
            }

            if(parsed?.return_link != null) {
                val intent = Intent(Intent.ACTION_VIEW)
                intent.data = Uri.parse(parsed.return_link)
                startActivity(intent)
            }


        }

        // read a list of phone numbers and messages, dispatch texts to all.
    }

    fun permissions() {


        if(ContextCompat.checkSelfPermission(this@MainActivity, android.Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            // no permission granted
            ActivityCompat.requestPermissions(this@MainActivity, arrayOf(android.Manifest.permission.SEND_SMS), MY_PERMISSIONS_SEND_SMS)

        }
        else {
            Log.d(TAG, "Permissions are granted...")
        }
    }
    fun sendSMS(text: String, phoneNumber: String) {
        try {

            // check permission first


            val smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, text, null, null)

            Toast.makeText(applicationContext, "Message Sent", Toast.LENGTH_SHORT).show()
        } catch( e: Exception) {
            Log.d(TAG, e.message)
        }

    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        when(requestCode) {
            MY_PERMISSIONS_SEND_SMS -> {
                if((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    Log.d(TAG, "PERMISSION GRANTED IN HERE");
                }
            }
        }
    }
}
