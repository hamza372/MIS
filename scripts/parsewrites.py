import json, csv, sys

fpath = sys.argv[1] if len(sys.argv) > 1 else "raw-writes.csv"

fieldnames = set()

csv.field_size_limit(sys.maxsize)

with open(fpath) as f:
	reader = csv.DictReader(f)
	lines = [l for l in reader]
	fieldnames = set(reader.fieldnames)

# try to turn each row into its own object,
# unnest the value one but namespace the field names with "value-"

formatted_lines = []

for line in lines:

	try:
		obj = json.loads(line['value'])
		path = json.loads(line['path'])

		formatted = {**line, 'path': ",".join(path)}

		if isinstance(obj, str):
			formatted_lines.append(formatted)
		elif isinstance(obj, int):
			formatted_lines.append(formatted)
		elif isinstance(obj, object):

			for k, v in obj.items():
				nk = "value-" + k
				fieldnames.add(nk)
				formatted[nk] = v

			del formatted['value']
			formatted_lines.append(formatted)

		else:
			formatted_lines.append(formatted)
	except:
		path = json.loads(line['path'])
		formatted = {**line, 'path': ",".join(path)}
		formatted_lines.append(formatted)

print(fieldnames)
with open("formatted-writes.csv", "w") as f:
	writer = csv.DictWriter(f, [x for x in fieldnames])
	writer.writeheader()
	writer.writerows(formatted_lines)
