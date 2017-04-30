#!/usr/bin/env scala

import scala.io.Source
import java.io._
import scala.collection.mutable._

/*Note, even though its scala, this file is a script, not a code to be compiled.
 *		Thanks to shebang magic, you just need to give this script executable rights
 *		("chmod a+x InsertQueryGenerator.scala" in your terminal) and then you can execute it
 *		as any shell scripts you would use. (if too lazy to give exec rights, 
 *		use scala command utilitary instead.)
 * usage : args 1 == filename of the csv file to parse, 
 *		   args 2 == filename of the create query table file
 */

if(args.length < 2){
	println("[ERROR] this program expect two arguments : \n"+
		"\t- First the filenamne of the csv file to parse\n"+
		"\t- Second the filename of the file containing \n\tthe create table queries.")
}else{
	//done to correctly get the filename (without dirs) and its extension. I use java.io because i fucking implemented it.
	val absoPaths = new File(args(0)).getAbsolutePath.split('/')
	val fileAndExtensions = absoPaths(absoPaths.length-1).split('.')
	if(fileAndExtensions.length != 2 || fileAndExtensions(1) != "csv"){
		println("[ERROR] Wrong format fot the csv filename arg")
	}else{
		//first making the directory where the SQL commands to insert data will be stocked
		val dataQueries = "../insert_queries/"
		val insertQueriesDir = new File(dataQueries)
		insertQueriesDir.mkdir()

		//then fetching the table info in its creation query
		val tableNameCSV = fileAndExtensions(0)
		val tableAttributes = TableAttributeParser(Source.fromFile(args(1)).getLines(), tableNameCSV)
		tableAttributes match {
			case None => println("[ERROR] Could not find the table you're looking for in the create table queries")
			case Some(t) => 
				//checking the csv as the correct columns name and number as the table info we fetched
				val csvLines = Source.fromFile(args(0)).getLines()
				val colNames = csvLines.next().split(',').map(_.trim)
				val attrNames = t.getAttributesName
				if(colNames.length != attrNames.length){
					println(s"[ERROR] the csv file has ${colNames.length} columns when its table declaration has ${attrNames.length}")
				}else{
					colNames.zip(attrNames).map(t => if(t._1 != t._2){
						println(s"[WARNING] The columns names don't match exactly the attribute names : found ${t._1} expected ${t._2}")
						})

					//now the checks are done, we are going to create the file, and writing to it.
					val preambule = "INSERT INTO " + t.getName + "\n"+
									t.getAttributesName.foldLeft("\t(")(
										(str, attr) => str + attr + ", "
									).dropRight(2)+ ")\nVALUES\n"
					val pw = new PrintWriter(new File(dataQueries + t.getName+ "_insert_data.sql"))
					pw.write(preambule)
					if(CSVParser(csvLines, t, pw)){
						println(s"[SUCCESS] ${t.getName} was succesfully converted into a SQL insert query")
					}else{
						println(s"[ERROR] for some reasons, ${t.getName} could not be converted. Please check the file produced and the script")
					}
					pw.close()
				}
		}
	}
}

object TableAttributeParser {
	//will give back a list of all the attributes from the table, with the first element being the table name itself.
	//the tableName given as an argument shall be the csv name (which most of time doesn't match case according the name of the tables in this file)
	def apply(lines: Iterator[String], tableName: String): Option[TableInformations] = {
		tableExtractor(lines).find(x => x.getName.toLowerCase equals tableName)
	}

	def tableExtractor(lines: Iterator[String]): List[TableInformations] = {
		val tables = new ListBuffer[TableInformations]
		val createTableStr = "CREATE TABLE "
		while(lines.hasNext){
			val currLine = lines.next()
			if(currLine.take(createTableStr.length) equals createTableStr){
				val createdTable = tableParser(lines, currLine.drop(createTableStr.length))

				createdTable match {
					case Some(t) => tables.append(t)
					case None => println("[ERROR] error in parsing a table,"+
									"an end of table was probably misdeclared "+
									"of misdetected"); return tables.toList
				}
			}
		}
		tables.toList
	}
	/**
	*	Takes the first line of a table, the iterator on the rest of the lines,
	*	And take care of parsing the line following the first as TableInformations.
	*	Return Optionnally a TableInformation constructed. 
	*	This method is not really robust entry-wise, you should always give 
	*	a coherent and well written SQL queries of creating table in entry
	*	Format of a Table  accepted (in a regex like description): 
			CREATE TABLE <tableName>(
				(<attributeName> <attributeType> <attributeNullitude>?,) *
				(<PrimaryKeyDeclaration> | <ForeignKeyDeclaration>,?) *
			);
		The first line arg should be without "CREATE TABLE "
	*/
	def tableParser(lines: Iterator[String], firstLine: String): Option[TableInformations] = {
		val tableName = firstLine.dropRight(1)
		val tabInfo = new TableInformations(tableName)
		var reachedEndOfTable = false
		while(lines.hasNext && !reachedEndOfTable){
			val currLine = lines.next()
			if(currLine.take(2) == ");") reachedEndOfTable = true
			else{	
				val elements = currLine.split(' ')
				if(elements.length >= 2){
					if(elements(0) == "CREATE"){
						//for some reason the table paser did not stop at the correct end 
						//of the table and started parsing the following table
						return None
					}
					val attrName = elements(0).drop(1)//need drop(1) to remove the first tabulation
					if(!(attrName == "PRIMARY" || attrName == "FOREIGN" || attrName == "--")){
						tabInfo.addAttribute(attrName, isNumber(elements(1)))
					}
				}	
			}
		}
		Some(tabInfo)
	}

	def isNumber(attrType: String) = attrType.take(3) match {
		case "INT"  => true
		case "BIT" => true
		case _ => false
	}
}

object CSVParser{
	//will print the data from the csv in the pw (already opened) into SQL values. 
	//the boolean returned tells if something wrong happened or not.
	def apply(lines: Iterator[String], tabInfo: TableInformations, pw: PrintWriter): Boolean = {
		val numberOrder = tabInfo.getAttributes.map(t => t._2)
		while(lines.hasNext){
			val l = lines.next()
			val elements = l.split(',').map(_.trim)
			val toPrint = elements.zip(numberOrder).foldLeft("\t(")(
					(str, t) => {
						val cleanedData = t._1.replaceAll("\"", "")
						str + (if(cleanedData == "NULL") "NULL"
						else if(t._2) cleanedData else "\""+cleanedData+"\"" ) + ", "
					}
				)
			pw.write(toPrint.dropRight(2) + (if(lines.hasNext) "),\n" else ");"))
		}
		return true
	}
}

class TableInformations(name: String){
	private var attributes: ListBuffer[(String, Boolean)] = new ListBuffer
	def addAttribute(attrName: String) = attributes.append((attrName, false))
	def addAttribute(attrName: String, isNumber: Boolean) = attributes.append((attrName, isNumber))
	def getAttributes: List[(String, Boolean)] = attributes.toList
	def getAttributesName: List[String] = getAttributes.map( t => t._1)
	def getName = name
	//for debugging purposes
	override def toString = {
		"Table : "+getName+"\n"+ getAttributes.foldLeft(new String)(
			(str,attr) => str + "\t"+attr._1+(if(attr._2)" !number!"else"")+"\n"
		)
	}

}