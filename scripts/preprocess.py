import csv, math, json, re
import urllib
import requests
from difflib import SequenceMatcher
from geopy import distance
from secrets import api_key

import matplotlib.pyplot as plt

max_processed = 1000

def similar(a : str, b : str) -> float:
	return SequenceMatcher(None, a, b).ratio()

manual_uc_map = {
	"GUJRAT - 1": 	"SURKH PUR",
	"GUJRAT - 2": 	"BAREELA",
	"GUJRAT - 3": 	"MARRI KHOKRAN",
	"GUJRAT - 4": 	"MOTA",
	"GUJRAT - 5": 	"TANDA",
	"GUJRAT - 6": 	"DHAMTHAL",
	"GUJRAT - 7": 	"BRAOO",
	"GUJRAT - 8": 	"KARIAN WALA",
	"GUJRAT - 9": 	"HAZARAN MUGHLAN",
	"GUJRAT - 10": 	"AGNALA",
	"GUJRAT - 11": 	"JALAL PUR SOBTIAN",
	"GUJRAT - 12": 	"DHUMMA MALKA",
	"GUJRAT - 13": 	"HAJI WALA",
	"GUJRAT - 14": 	"SANTAL",
	"GUJRAT - 15": 	"CHAK KAMALA"
}

def google_geocode(name) -> (bool, object):
	geocode_url = "https://maps.googleapis.com/maps/api/geocode/json?"
	args = {
		'key': api_key,
		'address': name,
		'region': 'pk'
	}

	result = requests.get(geocode_url + urllib.parse.urlencode(args))
	parsed = result.json()

	success = parsed['status'] == 'OK'

	if success:
		return (success, parsed['results'][0])
	else:
		print("ERROR: " + parsed)

	return (success, parsed)


def google_place(name) -> (bool, object):
	findplace_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?"
	args = {
		'key': api_key,
		'locationbias': r'point:31.582045,74.329376',
		'inputtype': 'textquery',
		'fields': 'name,formatted_address,place_id,geometry/location',
		'input': name
	}

	result = requests.get(findplace_url + urllib.parse.urlencode(args))
	parsed = result.json()
	success = parsed['status'] == 'OK'

	if success:
		return (success, parsed['candidates'][0])

	return (success, parsed)


def isValid(field: str):
	return field and field != "NA" and field != "N/A" and field != "999"

def address_builder(address: str, union_council: str, tehsil: str, school_district: str, province: str) -> str:

	splits = []
	runner = ""
	if isValid(address_normalize(address)):
		splits.append(address_normalize(address))
		runner += address_normalize(address) + " "

	cleaned_uc = " ".join(re.sub(r"[0-9]", "", union_council).split())

	if isValid(cleaned_uc) and cleaned_uc not in runner:
		splits.append(address_normalize(cleaned_uc))
		runner += address_normalize(cleaned_uc) + " "

	if isValid(tehsil) and tehsil not in runner:
		splits.append(tehsil)
		runner += tehsil + " "

	if isValid(school_district) and school_district not in runner:
		splits.append(school_district)
		runner += school_district + " "

	if isValid(province) and province not in runner:
		splits.append(province)
		runner += province

	final = ", ".join(splits) + ", PAKISTAN"

	return final

def address_normalize(address: str) -> str:
	parsed : str
	parsed = address.upper().replace(".", "")
	parsed = re.sub(r"\b(NO|NEAR|VPO|PO|VS|P/O|VILLAGE|VILL|VIL|TEHSIL|THESIL|THILL|THE|DISTT|DISTRICT|V/P|TEH|MOH|,|BESIDE|OPPOSITE|UC)\b", "", parsed)
	parsed = parsed.replace("TT SINGH", "TOBA TEK SINGH").replace("&", "")
	parsed = re.sub(r"\b(CHAJ)\b", "CHAK", parsed)
	parsed = re.sub(r"/$", "", parsed)

	parsed = ' '.join(parsed.split())

	return parsed

def remove_vowels(input: str) -> str:
	return input.replace("a", "").replace("e", "").replace("i", "").replace("o", "").replace("u", "").replace("y", "")


confidences = []

# the end goal here is to create either a csv or a json output
# where each of the repsondents now has a google lat/long/other data with some confidence
# we first go through a data cleaning cycle where we map the addresses to a known union council if possible
# this data cleaning is only providing us fallbacks. so for each school, we have an array of fallback addresses
# we keep track of which addresses we tried

def clean(address : str, union_council : str, tehsil : str, school_district : str, province : str, school_name : str) -> str:

	threshold = 0.8
	fallback_threshold = 0.7

	if not isValid(union_council) and not isValid(address):
		return ""

	parsed_uc = remove_vowels(union_council)
	# first cases meant to handle when they correctly spell it but put the UC in some other field...
	# TODO: inspect what the address looks like when this happens.
	if parsed_uc in master_uc:
		return address_builder("", union_council, tehsil, school_district, province)
	elif parsed_uc in master_tehsil:
		return address_builder("", "", union_council, school_district, province)
	elif parsed_uc in master_district:
		return address_builder("", "", "", union_council, province)
	else:
		# now we figure out the closest we can get
		p_dict = master.get(province, False)
		if not p_dict:
			return ""

		d_dict = p_dict.get(school_district, False)
		if not d_dict:
			return ""

		t_dict = d_dict.get(tehsil, False)
		if not t_dict:
			return ""

		proposed = max(t_dict.keys(), key=lambda str: similar(union_council, str))
		proposed_novowels = max(t_dict.keys(), key=lambda str: similar(parsed_uc, remove_vowels(str)))
		confidence = similar(parsed_uc, proposed_novowels)

		if confidence > threshold:
			confidences.append(confidence)
			# in this case we replace uc with the correct spelling.
			return address_builder(address, proposed, tehsil, school_district, province)
		else:
			proposed_fallback = max(t_dict.keys(), key=lambda str: similar(address, str))
			is_contained = proposed_fallback in address
			proposed_fallback_confidence = similar(proposed_fallback, address)

			if is_contained:
				proposed_fallback_confidence = 1.0

			confidences.append(proposed_fallback_confidence)
			if proposed_fallback_confidence > fallback_threshold:
				# in this case we replace the address + uc with this new correctly spelled uc
				# over_fallback_threshold += 1
				return address_builder("", proposed_fallback, tehsil, school_district, province)
			else:
				# under_fallback_threshold += 1
				# we can try some other stuff on full address here
				# but for now we should just trust our address
				# because or sample map is not comprehensive
				return ""

def compute_enrollment_meta():

	enrollment_bucket = 50
	enrollment_meta = {} # chunks of 50. so keys are 50, 100, 150

	enrollment_ranges = {
		"0 - 100": 100,
		"101 - 150": 150,
		"151 - 230": 230,
		"231 - 300": 300,
		"301+": 301
	}

	for school in lines:
		enrollment = school['total_enrolment']
		enrollment_range = school['enrolment_range']

		if isValid(enrollment):
			parsed = int(enrollment)
			chunk = math.floor(parsed / enrollment_bucket)
			enrollment_meta[chunk] = enrollment_meta.get(chunk, 0) + 1
			enrollment_count += 1

	return enrollment_meta

def compute_fee_meta():

	fee_meta = {}

	fee_ranges = {
		"Rs. 0 - 400": 400,
		"Rs. 401 - 650": 650,
		"Rs. 651 - 1050": 1050,
		"Rs. 1051 - 1500": 1500,
		"Rs. 1501+": 1501
	}

	for school in lines:
		lowest_fee = school['lowest_fee']
		highest_fee = school['highest_fee']
		monthly_fee = school['monthly_fee_collected']
		low_fee_range = school['low_fee_range']
		high_fee_range = school['high_fee_range']

		# first lets ignore fee ranges..

	return fee_meta

def map_locations():

	resolutions = 0
	failures = 0
	count = 0
	for school in lines:

		try:
			if count > max_processed:
				break

			if 'GOOGLE_LAT' in school and isValid(school['GOOGLE_LAT']):
				print("skipping")
				continue

			count += 1
			address = school['school_address'].upper()
			union_council = address_normalize(school['school_uc'])
			tehsil = school['school_tehsil'].upper()
			school_district = school['school_district'].upper()
			province = school['school_province'].upper().replace("KPK", "KHYBER PAKHTUNKHWA")
			school_name = school['school_name'].upper()

			full_addr = address_builder(address, union_council, tehsil, school_district, province)
			fallback_addr = clean(address, union_council, tehsil, school_district, province, school_name)

			success, first_result = google_geocode(full_addr)
			print("first result for: " + full_addr)
			if fallback_addr:
				print("-------------------------------------------")
				print("fallback would have been: " + fallback_addr)
				print("-------------------------------------------")

			if success:
				resolutions += 1
				candidate = first_result
				school['GOOGLE_FORMATTED'] = candidate['formatted_address']
				school['CERP_FORMATTED'] = full_addr

				geo = candidate['geometry']
				school['GOOGLE_LAT'] = geo['location']['lat']
				school['GOOGLE_LNG'] = geo['location']['lng']

				northeast_corner = (geo['viewport']['northeast']['lat'], geo['viewport']['northeast']['lng'])
				southwest_corner = (geo['viewport']['southwest']['lat'], geo['viewport']['southwest']['lng'])

				# we want area of the bound
				width = distance.distance(northeast_corner, (southwest_corner[0], northeast_corner[1])).kilometers
				height = distance.distance(northeast_corner, (northeast_corner[0], southwest_corner[1])).kilometers

				area = width*height

				school['GOOGLE_BOUNDED_AREA_KM'] = area
				school['SEARCH_SIMILARITY'] = similar( remove_vowels(full_addr.upper()), remove_vowels(candidate['formatted_address'].upper()))
				continue
			else:
				print("=====================")
				print("FAILURE ^^^")
				print("=====================")

			if not fallback_addr:
				failures += 1
				continue

			success, second_result = google_geocode(fallback_addr)
			print("second result for: " + fallback_addr)
			print(second_result)
			if success:
				resolutions += 1
				candidate = second_result
				school['GOOGLE_FORMATTED'] = candidate['formatted_address']
				school['CERP_FORMATTED'] = fallback_addr

				geo = candidate['geometry']
				school['GOOGLE_LAT'] = geo['location']['lat']
				school['GOOGLE_LNG'] = geo['location']['lng']

				northeast_corner = (geo['viewport']['northeast']['lat'], geo['viewport']['northeast']['lng'])
				southwest_corner = (geo['viewport']['southwest']['lat'], geo['viewport']['southwest']['lng'])

				# we want area of the bound
				width = distance.distance(northeast_corner, (southwest_corner[0], northeast_corner[1])).kilometers
				height = distance.distance(northeast_corner, (northeast_corner[0], southwest_corner[1])).kilometers

				area = width*height

				school['GOOGLE_BOUNDED_AREA_KM'] = area
				school['SEARCH_SIMILARITY'] = similar(remove_vowels(full_addr.upper()), remove_vowels(candidate['formatted_address'].upper()))
			else:
				failures += 1

		except:
			print("::::ERROR:::")
			failed_mappings.append(school)

	print("resolutions: " + str(resolutions))
	print("failures: " + str(failures))

#with open("geocoded.csv") as f:
with open("geocoded4.csv") as f:
	reader = csv.DictReader(f)
	lines = [l for l in reader]
	fieldnames = reader.fieldnames

with open("uc.csv") as f:
	reader = csv.DictReader(f)
	uc_lines = [l for l in reader]
	uc_fieldnames = reader.fieldnames

with open("punjab_uc.csv") as f:
	reader = csv.DictReader(f)
	punjab_uc_lines = [l for l in reader]
	punjab_uc_fieldnames = reader.fieldnames

master_uc = { remove_vowels(address_normalize(l['UC'])): address_normalize(l['UC']) for l in uc_lines }
master_district = { remove_vowels(address_normalize(l['DISTRICT'])): l['PROVINCE'].upper() for l in uc_lines }
master_tehsil = { remove_vowels(address_normalize(l['TEHSIL'])): l['PROVINCE'].upper() for l in uc_lines }

master = {} # key: province, value: { key: district, value: { key: tehsil, value: { key: union_council, value: 1 }}}
for l in uc_lines:
	province = l['PROVINCE'].upper()
	district = address_normalize(l['DISTRICT'])
	tehsil = address_normalize(l['TEHSIL'])
	uc = address_normalize(l['UC'])
	if uc in manual_uc_map:
		uc = manual_uc_map[uc]

	province_dict : dict = master.get(province, {})
	district_dict : dict = province_dict.get(district, {})
	tehsil_dict : dict = district_dict.get(tehsil, {})

	del l['wkt_geom']
	tehsil_dict[uc] = l
	district_dict[tehsil] = tehsil_dict
	province_dict[district] = district_dict
	master[province] = province_dict

del master['']

failed_mappings = []
map_locations()

with open("geocoded4.csv", "w") as f:
	writer = csv.DictWriter(f, fieldnames=['CERP_FORMATTED', 'GOOGLE_FORMATTED', 'GOOGLE_LAT', 'GOOGLE_LNG', 'GOOGLE_BOUNDED_AREA_KM', 'SEARCH_SIMILARITY', *fieldnames])
	# writer = csv.DictWriter(f, fieldnames=fieldnames)
	writer.writeheader()
	writer.writerows(lines)

# plt.hist(confidences, 20, facecolor='blue', alpha=0.5)
# plt.savefig("plot.png", format="png")


with open("failed.json", "w") as f:
	json.dump(failed_mappings, f)
