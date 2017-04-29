import scala.io.Source
import scala.collection.mutable._

//usage : args 1 == filename of the csv file to parse, 
//		  args 2 == filename of the create query table file
object InsertQueryGenerator {
	def main(args: Array[String]): Unit = {
		
		if(args.length < 2){
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
		while(lines.hasNext){
			val createTableStr = "CREATE TABLE "
			val currLine = lines.next()
			if(currLine.take(createTableStr.length) equals createTableStr){
				val createdTable = tableParser(lines, currLine)
				createdTable match {
					case Some(t) => tables.append(t)
					case None => println("[ERROR] error in parsing a table"); return Nil
				}
			}

		}
		tables.toList
	}

	def tableParser(lines: Iterator[String], firstLine: String): Option[TableInformations] = ???

}

class TableInformations(name: String){
	private var attributes: ListBuffer[(String, Boolean)] = new ListBuffer
	def addAttribute(attrName: String) = attributes.append((attrName, false))
	def addAttribute(attrName: String, isNumber: Boolean) = attributes.append((attrName, isNumber))
	def getAttributes: List[String] = attributes.toList.map( t => t._1)
	def getName = name
}