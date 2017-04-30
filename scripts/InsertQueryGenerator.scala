import scala.io.Source
import scala.collection.mutable._

//Note, even though its scala, this file is a script, not a code to be compiled.
//to run it simply type "scala InsertQueryGenerator.scala" (followed of course by the args you want)
//usage : args 1 == filename of the csv file to parse, 
//		  args 2 == filename of the create query table file

/*object InsertQueryGenerator {
	def main(args: Array[String]): Unit = {
		
		/*if(args.length < 2){
			println("[ERROR] this program expect two arguments : \n"+
				"\tFirst the filnamne of the csv file to parse"+
				"\tSecond the filename of the create query table file")
			return
		}

		val fileAndExtensions = args(0).split('.')
		if(fileAndExtensions.length != 2 || fileAndExtensions(1) != "csv"){
			println("[ERROR] wrong format fot the csv filename arg")
			return
		}

		val tableNameCSV = args(0).split('.')(0)
		val tableAttributes = TableAttributeParser(Source.fromFile(args(1)).getLines(), tableNameCSV)
		tableAttributes match {
			case None => return
			case Some(t) => 
				val preambule = "INSERT INTO" + t.getName + "\n"	
		}*/

	}
}*/

//Debugging the table parser
val tables = TableAttributeParser.tableExtractor(Source.fromFile(args(0)).getLines()) 
tables map println


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