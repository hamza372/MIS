import json
from flask import Flask, request

app = Flask(__name__)

schools = {}
with open("schools.json") as f:
	schools = json.load(f)

@app.route("/")
def ok():
	return "hello", 200

@app.route("/school/<school_id>")
def school(school_id):

	school = schools[school_id]
	print("hello")

	return json.dumps({"id": school_id, **school}), 200, {"content-type": "application/json", "Access-Control-Allow-Origin": "*"}


app.run(debug=True, host="0.0.0.0")