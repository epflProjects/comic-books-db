import csv
import re
import os

filename = 'story.csv'

attributes = ['id', 'title', 'feature', 'issue_id', 'letters', 'editing', 'genre', 'synopsis', 'reprint_notes', 'notes', 'type_id']

name, extention = filename.split('.');

with open(filename, 'r') as f, open(name + "_new." + extention, "w") as new_file:
	dictReader = csv.DictReader(f)
	dictWriter = csv.DictWriter(new_file, attributes)
	dictWriter.writeheader()
	for row in dictReader:
		newRow = {}
		for attribute in attributes:
			newRow.update({attribute: row[attribute]})
		dictWriter.writerow(newRow)