import csv
import re
import os

#ONLY ONE TRUE AT THE TIME !!!
PUT_TO_NULL = False
CLEAN_DATES = False # /!\ replace 9570, 9510 and 9680
CLEAN_INCORRECT_ROWS = False



#filename = input('Enter the filename : ')

for filename in os.listdir():
	if filename.endswith(".csv"): 
		print(filename)

		attributes = []
		lineNb = 0

		with open(filename, 'r') as f:
			reader = csv.reader(f)
			attributes = next(reader)

		name, extention = filename.split('.');
		emptyValues = ["null", "", "[nn]", "?", "[none]", "none", "[undated]", "[no date]", "[No date]", "[?]", 
		"[Unknown]", "[none given]", "[none listed]", "no date", "Unknown", "[None]", "None [Premium]", "None", "nessuno", 
		"0?", "N/A", "[aucun]", "[NONE]", "[ohne]", "[none] (see notes)"]


		with open(filename, 'r') as f, open(name + "_new." + extention, "w") as new_file:
			dictReader = csv.DictReader(f)
			dictWriter = csv.DictWriter(new_file, attributes)
			dictWriter.writeheader()
			for row in dictReader:
				newRow = {}

				#replace by null

				if PUT_TO_NULL :
					for attribute in attributes:
						if row[attribute] == None or row[attribute] in emptyValues:
							newRow.update({attribute: "NULL"})
						else:
							newRow.update({attribute: row[attribute]})
					dictWriter.writerow(newRow)


				#clean dates

				if CLEAN_DATES :
					for attribute in attributes:
						if attribute in ['year_began', 'year_ended', 'publication_date', 'on_sale_date']:
							test = row[attribute]
							if test == "0":
								test = "NULL"
							if test != "NULL":
								date = re.search(r'\d\d\d\d', test)
								if date == None :
									date = re.search(r'\d\d\d', test)
									if date == None:
										date = 'NULL'
									else:
										if date.group() == '957':
											date = '1' + str(date.group())
										elif date.group() == '951':
											date = '1' + str(date.group())
										elif date.group() == '968':
											date = '1' + str(date.group())
										else:
											date = str(date.group()) + '0'
									newRow.update({attribute: date})
									print(str(row[attribute]) + ' - ' + str(newRow[attribute]))
								else :
									date = date.group()
									newRow.update({attribute: date})
							else:
								newRow.update({attribute: test})
						else:
							newRow.update({attribute: row[attribute]})
					dictWriter.writerow(newRow)



				#delete rows where a not null attribute is null
				not_null_attributes = {
					'series.csv' : ['name', 'year_began', 'first_issue_id', 'last_issue_id'],
					'story.csv' : ['issue_id', 'type_id']
				}


				if CLEAN_INCORRECT_ROWS and filename in not_null_attributes :
					write_row = True
					for attribute in not_null_attributes[filename]:
						if row[attribute] == "NULL":
							write_row = False
							lineNb += 1
					if write_row:
						dictWriter.writerow(row)

			if CLEAN_INCORRECT_ROWS :
				print(lineNb)

