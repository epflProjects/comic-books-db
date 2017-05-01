#!/bin/bash
FILES=../data/*
TABLE_QUERY=../create_commands.sql
for f in $FILES
do
  echo "Processing $f file..."
  ./InsertQueryGenerator.scala $f $TABLE_QUERY
done