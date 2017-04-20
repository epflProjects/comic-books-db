import csv
from collections import defaultdict
import re

names = set()

filename = 'story.csv'

attributes_to_check = ['characters']
attributes = []

not_characters = ['colour', 'black', 'white', 'red', 'character', 'ambrose', '[as', 'illustration', ']', 'various', 'on Sheena', 'shop', 'cover title']
not_characters_equal = ['en', 'd', 'intro', 'y', 'death)', 'not used', 'Inside front cover features a full page house ad for Rangers Of Freedom Comics #1', '', '']

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

        #split different characters
        list_of_characters = x.split(';')

        for l in list_of_characters:
          if l.startswith(' '):
            l = l[1:]
          for i in range(3):
            if l.endswith(' '):
              l = l[:-1]
          if l.endswith(')'):
            l = l[:-1]

          l = l.replace(' as', '')
          l = l.replace(' {signed)', '')
          l = l.replace('w/ ', '')
          l = l.replace('vs ', '')
          l = l.replace('vs. ', '')
          l = l.replace('unnamed ', '')
          l = l.replace('unknown ', '')
          l = l.replace('Unnamed ', '')
          l = l.replace('Unknown ', '')
          l = l.replace('un-named ', '')
          l = l.replace('intro:  ', '')
          l = l.replace(' )', '')
          l = l.replace('introduction)', '')
          l = l.replace('Villains: ', '')
          l = l.replace('Villain: ', '')
          l = l.replace('VILLAINS: ', '')
          l = l.replace('VILLAIN: ', '')
          l = l.replace('V: ', '')
          l = l.replace(' un-named in the story', '')
          l = l.replace(' appears on cover only', '')
          l = l.replace(' last appearance but continues Jungle Jo a few months later .', '')
          l = l.replace(' 3 un-named members of the Minute Men of America', '')
          l = l.replace('I: ', '')
          l = l.replace('I:', '')
          l = l.replace('GUEST: ', '')
          l = l.replace('GUEST STAR: ', '')
          l = l.replace('GUEST STARS: ', '')
          l = l.replace('GS: ', '')
          l = l.replace('GA: ', '')
          l = l.replace(' Marius', 'Marius')
          
          if l in ['', ';', ':', ',', '.', ' ']:
            add = False
          for elem in not_characters:
            if elem in l:
              add = False
          for elem in not_characters_equal:
            if elem == l:
              add = False
          if add:
            names.add(l)

names = sorted(names)

with open("character.csv", "w") as new_file:
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

