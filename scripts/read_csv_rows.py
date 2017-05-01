import csv
from collections import defaultdict
import os

columns = defaultdict(list)

for filename in os.listdir():
  if filename.endswith(".csv"): 

    print('####################')
    print(filename)

    length_of_content = 0
    attributes = []

    with open(filename, 'r') as f:
      reader = csv.reader(f)
      attributes = next(reader)

    with open(filename, 'r') as f:
      dictReader = csv.DictReader(f)
      for row in dictReader:
        for attribute in attributes:
          columns[attribute].append(row[attribute])

    #print results
    for attribute in attributes:
      column_content = columns[attribute]
      length_of_content = len(column_content)
      print(attribute + ' : ')
      print('    longest string : ' + str(len(max(column_content, key=len))))

      #calculate number of NULL
      number_null = [a for a in column_content if a == 'NULL']

      print('    percentage of NULL : ' + str(len(number_null)*100/length_of_content) + '%')

    print('Number of rows : ' + str(length_of_content))
