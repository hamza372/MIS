package pk.org.cerp.mischool.mischoolcompanion

import android.app.IntentService
import android.app.Service
import android.content.Intent
import android.net.Uri
import android.os.IBinder
import android.telephony.SmsManager
import android.util.Log
import android.widget.Toast
import java.lang.Exception

class SMSDispatcherService : IntentService(SMSDispatcherService::class.simpleName) {


    override fun onHandleIntent(intent: Intent?) {

        try {

        } catch(e : Exception) {
            Log.d(TAG, e.message)
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

}