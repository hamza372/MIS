package pk.org.cerp.mischool.mischoolcompanion

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

class SMSDispatcher(context : Context, params : WorkerParameters) : Worker(context, params) {

    override fun doWork(): Result {

        // sms manager send your queue of messages.
        return Result.success()
    }

}

