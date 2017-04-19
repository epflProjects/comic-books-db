import csv
import re

######################################################FUNCTIONS#########################################################

def get_artists(string) :
  not_artists = ['colour', 'black', 'white', 'red', 'artist', 'ambrose', '[as', 'illustration', ']', 'various', 'on Sheena', 'shop']
  not_artists_equal = ['mone', 'illo', 'D', 'Z', 'Win', 'S', 'Quick!! Theres a gas leak in the kitchen!', 'Jr.', 'Writer S', '                     ']

  names = set()
  add = True
  string = re.sub("[\(\[].*?[\)\]]", "", string)
  string = string.replace('? ', '')
  string = string.replace('?', '')
  string = string.replace('  ', ' ')
  string = string.replace('\'M', 'M')
  string = string.replace('e\'', 'e')
  if string.startswith(';'):
    string = string[1:]
  if string.endswith(';'):
    string = string[:-1]

  #split different artists
  list_of_artists = string.split(';')

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
  return names



def get_characters(string) :
  not_characters = ['colour', 'black', 'white', 'red', 'character', 'ambrose', '[as', 'illustration', ']', 'various', 'on Sheena', 'shop', 'cover title']
  not_characters_equal = ['en', 'd', 'intro', 'y', 'death)', 'not used', 'Inside front cover features a full page house ad for Rangers Of Freedom Comics #1', '', '']

  names = set()
  add = True

  string = re.sub("[\(\[].*?[\)\]]", "", string)
  string = string.replace('? ', '')
  string = string.replace('?', '')
  string = string.replace('  ', ' ')
  string = string.replace('\'M', 'M')
  string = string.replace('e\'', 'e')
  if string.startswith(';'):
    string = string[1:]
  if string.endswith(';'):
    string = string[:-1]

  #split different characters
  list_of_characters = string.split(';')

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
  return names




########################################################################################################################


artists_dictionary = {}

characters_dictionary = {}

with open("artist.csv", 'r') as f:
  dictReader = csv.DictReader(f)
  for row in dictReader:
    artists_dictionary[row['name']] = row['id']




with open("story.csv", 'r') as f, open("script.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['story_id', 'artist_id'])
  dictWriter.writeheader()
  dictReader = csv.DictReader(f)

  newRow = {}

  #write results
  for row in dictReader:
    row_id = row['id']
    row_string = row['script']
    if row_string != "NULL":
      artist_names = get_artists(row_string)
      for artist_name in artist_names:
        newRow.update({'story_id': row_id})
        newRow.update({'artist_id': artists_dictionary[artist_name]})
        dictWriter.writerow(newRow)



with open("story.csv", 'r') as f, open("pencils.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['story_id', 'artist_id'])
  dictWriter.writeheader()
  dictReader = csv.DictReader(f)

  newRow = {}

  #write results
  for row in dictReader:
    row_id = row['id']
    row_string = row['pencils']
    if row_string != "NULL":
      artist_names = get_artists(row_string)
      for artist_name in artist_names:
        newRow.update({'story_id': row_id})
        newRow.update({'artist_id': artists_dictionary[artist_name]})
        dictWriter.writerow(newRow)



with open("story.csv", 'r') as f, open("inks.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['story_id', 'artist_id'])
  dictWriter.writeheader()
  dictReader = csv.DictReader(f)

  newRow = {}

  #write results
  for row in dictReader:
    row_id = row['id']
    row_string = row['inks']
    if row_string != "NULL":
      artist_names = get_artists(row_string)
      for artist_name in artist_names:
        newRow.update({'story_id': row_id})
        newRow.update({'artist_id': artists_dictionary[artist_name]})
        dictWriter.writerow(newRow)



with open("story.csv", 'r') as f, open("colors.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['story_id', 'artist_id'])
  dictWriter.writeheader()
  dictReader = csv.DictReader(f)

  newRow = {}

  #write results
  for row in dictReader:
    row_id = row['id']
    row_string = row['colors']
    if row_string != "NULL":
      artist_names = get_artists(row_string)
      for artist_name in artist_names:
        newRow.update({'story_id': row_id})
        newRow.update({'artist_id': artists_dictionary[artist_name]})
        dictWriter.writerow(newRow)


with open("character.csv", 'r') as f:
  dictReader = csv.DictReader(f)
  for row in dictReader:
    characters_dictionary[row['name']] = row['id']


with open("story.csv", 'r') as f, open("characters.csv", "w") as new_file:
  dictWriter = csv.DictWriter(new_file, ['story_id', 'character_id'])
  dictWriter.writeheader()
  dictReader = csv.DictReader(f)

  newRow = {}

  #write results
  for row in dictReader:
    row_id = row['id']
    row_string = row['characters']
    if row_string != "NULL":
      character_names = get_characters(row_string)
      for character_name in character_names:
        newRow.update({'story_id': row_id})
        newRow.update({'character_id': characters_dictionary[character_name]})
        dictWriter.writerow(newRow)




