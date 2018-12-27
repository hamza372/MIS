package pk.org.cerp.mischool.mischoolcompanion

import android.content.Context
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
import com.evernote.android.job.JobManager
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import kotlin.Exception

const val TAG = "MISchool-Companion"
const val MY_PERMISSIONS_SEND_SMS = 1

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        JobManager.create(this).addJobCreator(SMSDispatcher())

        val intent = this.intent

        val data = intent.data
        val dataString = intent.dataString

        permissions()

        Log.d(TAG, "HELLOOOO")
        Log.d(TAG, intent.action)

        if(data == null || dataString == null) {
            return
        }

        Log.d(TAG, dataString)

        val json_string = java.net.URLDecoder.decode(dataString.split("=")[1], "UTF-8")
        Log.d(TAG, json_string)

        val parsed : SMSPayload? = Klaxon().parse(json_string)

        if(parsed == null) {
            return
        }

        // open file, append messages and quit
        // task which runs every minute

        try {
            appendMessagesToFile(parsed.messages)
        }
        catch(e : Exception){
            Log.e(TAG, e.message)
            Log.e(TAG, e.toString())
        }


        // this logic should be happening inside the task.
        // it means we need to save the queued up messages somewhere to be accessed by the
        // worker later
        /*
        val history = sentMessages()
        val last_min_messages = history.first
        val last_15_min_messages = history.second

        val num_messages = parsed.messages.size

        val max_per_minute = 25

        when {
            last_min_messages > max_per_minute -> null // do nothing, wait another minute.
            (last_min_messages + num_messages) < max_per_minute -> sendAllSMS(parsed.messages) // fire the messages off immediately.
            (last_15_min_messages + num_messages) in 30..199 -> null // we don't need to worry about the pta rule, so fire off max per minute this round.
            (num_messages + last_15_min_messages) > 200 -> null // fire the messages off at a rate that cares about the pta limit (200 / 15 min) 12 per minute...
        }
        */


        /*
        val intent = Intent(Intent.ACTION_VIEW)
        intent.data = Uri.parse(parsed.return_link)
        startActivity(intent)
        */

        finish()

    }

    fun appendMessagesToFile( messages : List<SMSItem>) {

        // first read the file as json

        Log.d(TAG, "appending messages to file.....")

        val path = filesDir
        val file = File(path, "pending_messages.json")

        Log.d(TAG, file.absolutePath)

        var content : String? = null

        if(file.exists()) {
            val bytes = file.readBytes()
            content = String(bytes)
            Log.d(TAG,"content of pending messages is $content")
        }

        val new_list = if(content == null) {
            messages
        } else {
            val parsed = Klaxon().parseArray<SMSItem>(content)

            parsed.orEmpty() + messages
        }

        Log.d(TAG, "new list is $new_list")

        // now write to file...

        val res = Klaxon().toJsonString(new_list)
        file.writeBytes(res.toByteArray())

        Log.d(TAG, "DONE writing stupid shit")

    }

    fun sentMessages() : Pair<Int, Int> {

        val unixTime = System.currentTimeMillis()

        try {

            val min_time = unixTime - (15 * 60 * 1000)
            val cursor = contentResolver.query(
                    Uri.parse("content://sms/sent"),
                    arrayOf("date"),
                    "date > $min_time",
                    null,
                    null
            )


            return if (cursor.moveToFirst()) {
                var messages_past_minute = 0
                var messages_past_15_min = 0

                do {

                    val date = cursor.getLong(cursor.getColumnIndex("date"))
                    val diff = (unixTime - date) / 1000L

                    if(diff <= 60) messages_past_minute++

                    messages_past_15_min++


                } while (cursor.moveToNext())

                return Pair(messages_past_minute, messages_past_15_min)
            } else {
                Log.d(TAG, "couldnt move to first...")
                return Pair(0, 0)
            }

        }
        catch(e : Exception) {
            Log.e(TAG, e.message)
            return Pair(0, 0)
        }

    }

    fun permissions() {


        if(ContextCompat.checkSelfPermission(this@MainActivity, android.Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED ||
           ContextCompat.checkSelfPermission(this@MainActivity, android.Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED ) {
          // ContextCompat.checkSelfPermission(this@MainActivity, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            // no permission granted
            ActivityCompat.requestPermissions(this@MainActivity, arrayOf(android.Manifest.permission.SEND_SMS, android.Manifest.permission.READ_SMS), MY_PERMISSIONS_SEND_SMS)

        }
        else {
            Log.d(TAG, "Permissions are granted...")
        }
    }

    fun sendAllSMS(messages : List<SMSItem>) {
        for(p in messages) {
            Log.d(TAG, "send " + p.text + " to " + p.number)
            sendSMS(p.text, p.number)
            Thread.sleep(100)
        }

        Toast.makeText(applicationContext, messages.size.toString() + " messages Sent", Toast.LENGTH_SHORT).show()

    }

    fun sendSMS(text: String, phoneNumber: String) {
        try {

            // check permission first
            val smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, text, null, null)

            //Toast.makeText(applicationContext, "Message Sent", Toast.LENGTH_SHORT).show()
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
