import sys
import math
from datetime import datetime, timedelta
from typing import List, Dict, NamedTuple
from collections import namedtuple
import numpy as np
import matplotlib.pyplot as plt

from utils import get_data
import config

plt.style.use('seaborn-pastel')

# important globals

debug = len(sys.argv) == 1
min_date = datetime.fromisoformat("2019-09-01")
max_date = datetime.fromisoformat('2019-10-01')

min_days_attendances = 5
min_school_size = 0


ignore = set(["cerp", "epod", "happy-school"])

if debug:
    print("debug mode - script will load data from files if they exist")


def parse_date(date_string):
    return datetime.fromisoformat(date_string)


attendance = get_data('attendance', debug)		# [date, school_id, students_markd]
writes = get_data('writes', debug)				# [school_id, date, writes]

list.sort(attendance, key=lambda arr: parse_date(arr['date']))

first_day = {}  # { school_id: datetime }

# region set first_day dict

for row in writes:
    school_id = row['school_id']
    date = parse_date(row['date'])
    writes = row['writes']

    if date < min_date:
        continue

    if date > max_date:
        continue

    if school_id in ignore:
        continue

    if school_id in first_day:
        existing = first_day[school_id]
        if existing > date:
            first_day[school_id] = date
    else:
        first_day[school_id] = date

# endregion

# {school_id: [{ date: datetime, students_marked: int }, ...]}
AttendanceRecord = namedtuple('AttendanceRecord', ['date', 'students_marked'])
school_attendance_records: Dict[str, List[AttendanceRecord]] = {}

# region set attendance data

gaps = []

for row in attendance:
    date = parse_date(row['date'])
    school_id = row['school_id']
    students_marked = int(row['students_marked'])

    if school_id in ignore:
        continue

    if date < min_date:
        continue

    if date > max_date:
        continue

    if date.weekday() > 5:
        continue

    if school_id in school_attendance_records:
        prev_date = school_attendance_records[school_id][-1].date
        gap = (date - prev_date).days
        if gap > 0:
            gaps.append(gap)

        # fill in the missing days with students_marked: 0, but ignoring sundays
        # and should also ignore summer time if the gap is longer than 30 and its a summer month.
        # summer month: 6, 7
        if gap > 1:
            missing_days = []
            for x in range(1, gap):
                curr: datetime.date = prev_date + timedelta(days=x)

                if gap > 30 and (curr.month == 6 or curr.month == 7):
                    continue

                if curr.weekday() > 4:
                    continue

                missing_days.append(AttendanceRecord(
                    date=curr, students_marked=0))

            school_attendance_records[school_id].extend(missing_days)

        school_attendance_records[school_id].append(
            AttendanceRecord(date, students_marked))

    else:
        school_attendance_records[school_id] = [
            AttendanceRecord(date, students_marked)]

# endregion


school_sizes = {sid: (max(arr, key=lambda item: item.students_marked).students_marked)
                for sid, arr in school_attendance_records.items()}

attendance_score_distributions = {
    sid: [item.students_marked / school_sizes[sid] for item in arr]
    for sid, arr in school_attendance_records.items()
    if len(arr) > min_days_attendances and school_sizes[sid] > min_school_size
}

Stats = namedtuple('Stats', ['mean', 'std', 'median'])
metrics = {
    sid: Stats(mean=np.mean(arr), std=np.std(arr), median=np.median(arr))
    for sid, arr in attendance_score_distributions.items()
}


def plot_school_dist(school_id: str):
    fig = plt.figure()
    (mean, std, median) = metrics[school_id]
    dist = attendance_score_distributions[school_id]

    bin_size = 0.05
    bins = [0 for k in np.arange(0.0, 1.0 + bin_size, bin_size)]

    for score in dist:
        bin_index = math.floor(score / bin_size)
        bins[bin_index] += 1

    plt.bar([x for x in np.arange(0.0, 1.0 + bin_size, bin_size)],
            bins, width=(0.8 * bin_size), align='edge')

    plt.title(school_id + " Attendance Score Distribution")
    plt.xlabel('mean: ' + str(round(mean, 2))
               + '\nstd: ' + str(round(std, 2))
               + '\nmedian: ' + str(round(median, 2))
               + '\nN: ' + str(len(dist)))
    plt.tight_layout()
    plt.savefig('charts/' + school_id + '_attendance_dist.png')
    # plt.show()
    plt.close()


def plot_school_means():

    bin_size = 0.1
    bins = [0 for k in np.arange(0.0, 1.0 + bin_size, bin_size)]

    total_schools = 0
    for sid, item in metrics.items():
        bin_index = math.floor(item.mean / bin_size)

        bins[bin_index] += 1
        total_schools += 1

    means = [x.mean for x in metrics.values()]
    mean = round(np.mean(means), 2)
    std = round(np.std(means), 2)
    median = round(np.median(means), 2)

    fig = plt.figure()
    plt.bar(
        [x for x in np.arange(0.0, 1.0 + bin_size, bin_size)],
        bins,
        width=(0.8 * bin_size),
        align='edge')
    plt.title('Distribution of Mean School Attendance Scores')
    plt.xlabel('mean: ' + str(mean)
               + '\nstd: ' + str(std)
               + '\nmedian: ' + str(median)
               + '\nN: ' + str(total_schools))
    plt.tight_layout()
    plt.savefig('charts/attendance_means_dist.png')
    # plt.show()
    plt.close()


def plot_school_days_used():

    days = []
    mean_scores = []
    stds = []

    for sid, scores in attendance_score_distributions.items():
        days.append(len(scores))
        mean_scores.append(metrics[sid].mean)
        stds.append(metrics[sid].std)

    b, m = np.polyfit(days, mean_scores, 1)
    fig = plt.figure()
    # plt.scatter(days, mean_scores)
    # plt.plot(days, [b + m * d for d in days], '-')
    plt.errorbar(days, mean_scores, yerr=stds, fmt='o')
    plt.title('Days with App vs Mean Attendance Score')
    plt.xlabel('Days With App')
    plt.ylabel('Mean Attendance Score')
    plt.tight_layout()
    plt.savefig('charts/days_vs_attendance.png')
    # plt.show()
    plt.close()


def plot_population_distribution():
    meta_scores = []
    for sid, dist in attendance_score_distributions.items():
        meta_scores.extend([x for x in dist])

    bin_size = 0.1
    bins = [0 for k in np.arange(0.0, 1.0 + bin_size, bin_size)]
    for score in meta_scores:
        bin_index = math.floor(score / bin_size)

        bins[bin_index] += 1

    mean = round(np.mean(meta_scores), 2)
    median = round(np.median(meta_scores), 2)
    std = round(np.std(meta_scores), 2)

    fig = plt.figure()
    plt.bar([x for x in np.arange(0.0, 1.0 + bin_size, bin_size)],
            bins,
            width=(0.8 * bin_size),
            align='edge')
    plt.title('Overall Attendance Score Distribution')
    plt.xlabel('mean: ' + str(mean) + '\nmedian: ' + str(median) +
               '\nstd: ' + str(std) + '\nN: ' + str(len(meta_scores)))
    plt.tight_layout()
    plt.savefig('charts/overall_attendance_score_dist.png')
    # plt.show()
    plt.close()


def plot_gaps():
    bin_size = 5
    bins = [0 for k in range(0, max(gaps) + bin_size, bin_size)]

    m_gaps = [x for x in gaps if x > 0]
    for gap in m_gaps:
        bin_index = math.floor(gap / bin_size)
        bins[bin_index] += 1

    mean = round(np.mean(m_gaps), 2)
    median = round(np.median(m_gaps), 2)
    std = round(np.std(m_gaps), 2)

    fig = plt.figure()
    plt.bar(
        [x for x in range(0, max(m_gaps) + bin_size, bin_size)],
        bins,
        width=(0.8 * bin_size),
        align='edge'
    )
    plt.title('Distribution of Gaps Between Days Attendance was Taken')
    plt.xlabel('mean: ' + str(mean) + '\nmedian: ' + str(median) + '\nstd: ' +
               str(std) + '\nN: ' + str(len(m_gaps)))
    plt.tight_layout()
    plt.savefig('charts/gaps_distribution.png')
    plt.close()


plot_school_dist('GHSAVschool')
plot_school_dist('ittehadschool')
plot_school_dist('darul-ehsan')
plot_school_dist('leadershighschool')
plot_school_means()
plot_school_days_used()

plot_population_distribution()

plot_gaps()

categories = {
    'high': 0,
    'medium': 0,
    'low': 0
}

for sid, metric in metrics.items():
    mean, std, median = metric
    if mean >= .6:
        print(sid)
        categories['high'] += 1
    elif mean >= .3:
        categories['medium'] += 1
    else:
        categories['low'] += 1

print(categories)
