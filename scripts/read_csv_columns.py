import csv
from collections import defaultdict

filename = input('Filename : ')

#read first row to have columns titles
with open(filename, newline='') as f:
  reader = csv.reader(f)
  row1 = next(reader)

columns = defaultdict(list)

firstline = True
with open(filename) as f:
    reader = csv.DictReader(f)
    for row in reader:
      if firstline:
        firstline = False
      else:
        for (k,v) in row.items():
          columns[k].append(v)

for r in row1:
  column_content = columns[r]

  #replace None by ''
  for index, item in enumerate(column_content):
    if item == None :
        column_content[index] = ''

  length_of_content = len(column_content)
  print(r + ' : ')
  print('    longest string : ' + str(len(max(column_content, key=len))))

  #calculate number of NULL
  number_null = [a for a in column_content if a == 'NULL']
  #calculate number of empty
  number_empty = [a for a in column_content if a == '']

  print('    percentage of NULL : ' + str(len(number_null)*100/length_of_content) + '%')
  print('    percentage of empty : ' + str(len(number_empty)*100/length_of_content) + '%')

print('Number of rows : ' + str(length_of_content))
