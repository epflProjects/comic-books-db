import csv
import re


###### ISSUE ######

issue_reprint_dictionary = {}

with open("issue_reprint.csv", 'r') as f:
	dictReader = csv.DictReader(f)
	for row in dictReader:
		issue_reprint_dictionary[row['target_issue_id']] = row['origin_issue_id']

attributes = []
count = 0

with open("issue.csv", 'r') as f:
	reader = csv.reader(f)
	attributes = next(reader)

with open("issue.csv", 'r') as f, open("issue_new.csv", "w") as new_file:
	dictReader = csv.DictReader(f)
	attributes.append('reprint_origin_id')
	dictWriter = csv.DictWriter(new_file, attributes)
	dictWriter.writeheader()
	for row in dictReader:
		newRow = row
		if row['id'] in issue_reprint_dictionary:
			newRow.update({'reprint_origin_id': issue_reprint_dictionary[row['id']]})
			count += 1
		else :
			newRow.update({'reprint_origin_id': "NULL"})
		dictWriter.writerow(newRow)


print('number of issue reprints found :' + str(count))





###### STORY ######

story_reprint_dictionary = {}

attributes = []
count = 0

with open("story_reprint.csv", 'r') as f:
	dictReader = csv.DictReader(f)
	for row in dictReader:
		story_reprint_dictionary[row['target_id']] = row['origin_id']



with open("story.csv", 'r') as f:
	reader = csv.reader(f)
	attributes = next(reader)

with open("story.csv", 'r') as f, open("story_new.csv", "w") as new_file:
	dictReader = csv.DictReader(f)
	attributes.append('reprint_origin_id')
	for att in ['script', 'pencils', 'inks', 'colors', 'characters']:
		attributes.remove(att)
	dictWriter = csv.DictWriter(new_file, attributes)
	dictWriter.writeheader()
	for row in dictReader:
		newRow = {}
		for att in attributes:
			if att != 'reprint_origin_id':
				newRow.update({att: row[att]})
		if row['id'] in story_reprint_dictionary:
			newRow.update({'reprint_origin_id': story_reprint_dictionary[row['id']]})
			count += 1
		else :
			newRow.update({'reprint_origin_id': "NULL"})
		dictWriter.writerow(newRow)


print('number of stors reprints found :' + str(count))

