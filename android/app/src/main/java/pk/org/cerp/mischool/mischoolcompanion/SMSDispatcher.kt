package pk.org.cerp.mischool.mischoolcompanion

import android.telephony.SmsManager
import com.evernote.android.job.Job
import com.evernote.android.job.JobCreator
import com.evernote.android.job.JobRequest
import com.evernote.android.job.util.support.PersistableBundleCompat

class SMSDispatcher : JobCreator {

    override fun create(tag: String): Job? {

        return when(tag) {
            SMSJob.TAG -> SMSJob()
            else -> null
        }
    }
}

class SMSJob : Job() {

    companion object {
        val TAG = "SMS_JOB"

        fun scheduleJob() = {

            JobRequest.Builder(TAG)
                    .setPeriodic(60000)
                    .setUpdateCurrent(true)
                    .build()
                    .schedule()
        }
    }

    override fun onRunJob(params: Params): Result {
        // do job

        val smsargs = params.extras

        return Result.SUCCESS
    }

}

