import csv
from collections import defaultdict
import re

names = set()

filename = 'story.csv'

attributes_to_check = ['script', 'pencils', 'inks', 'colors']
attributes = []

not_artists = ['colour', 'black', 'white', 'red', 'artist', 'ambrose', '[as', 'illustration', ']', 'various', 'on Sheena', 'shop']
not_artists_equal = ['mone', 'illo', 'D', 'Z', 'Win', 'S', 'Quick!! Theres a gas leak in the kitchen!', 'Jr.', 'Writer S', '                     ']

with open(filename, 'r') as f:
  reader = csv.reader(f)
  attributes = next(reader)

with open(filename, 'r') as f:
  dictReader = csv.DictReader(f)
  for row in dictReader:
    for attribute in attributes_to_check:
      add = True
      if row[attribute] != "NULL" :
        x = row[attribute]
        x = re.sub("[\(\[].*?[\)\]]", "", x)
        x = x.replace('? ', '')
        x = x.replace('?', '')
        x = x.replace('  ', ' ')
        x = x.replace('\'M', 'M')
        x = x.replace('e\'', 'e')
        if x.startswith(';'):
          x = x[1:]
        if x.endswith(';'):
          x = x[:-1]

        #split different artists
        list_of_artists = x.split(';')

        for l in list_of_artists:
          if l.startswith(' '):
            l = l[1:]
          for i in range(3):
            if l.endswith(' '):
              l = l[:-1]
          l = l.replace(' as', '')
          l = l.replace(' {signed)', '')
          if l in ['', ';', ':', ',', '.', ' ']:
            add = False
          for elem in not_artists:
            if elem in l:
              add = False
          for elem in not_artists_equal:
            if elem == l:
              add = False
          if add:
            names.add(l)

names = sorted(names)


with open("artist.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['id', 'name'])
  dictWriter.writeheader()

  i = 1
  newRow = {}

  #write results
  for art in names:
    newRow.update({'id': i})
    newRow.update({'name': art})
    dictWriter.writerow(newRow)
    i += 1


