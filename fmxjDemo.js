//accompanying js file for fmxj demo html file.
//dependencies: fmxj.js. fmxj.css




//define PHP relay info if using it, otherwise set to null
//var relay = null;
//Credentials are not being passed here, but are hardcoded into the PHP file.
//If running your own authentication routine in JS you can add u an p properties to this object
//They will be sent via POST to your PHP page, which will use them to authenticate to FMS
//This is the SeedCode Test Server so be kind to it!!
var relay = {"php":"fmxjRelay.php","server":"sc-fms13-fms.fmsdb.com","protocol":"https","port":"443"};
//var relay = {"php":"fmxjRelay.php","server":"192.168.1.10"};


//***************FUNCTIONS*********************

function updateJSONLoop(resultElementID, requests, increment, sort){
	var sourceLoop = [];
	var max = increment;
	var skip = 0;
	var num = 0;
	var total = 0;
	var message = "";
	var indent = 4; //JSON indent
	var q = "";
	var start = new Date().getTime();
	var split = new Date().getTime();
	//callback functions for writing download.
	function writeDownload(n){
		document.getElementById(resultElementID).innerHTML += "<span class=\"resultHeader\">" + n + " bytes downloaded</span>\n" ;
	} ;
	function writeResult(js,utc){
		var dlc = utc-split
		split = new Date().getTime();
		ms = split - start;
		var cc = split-utc;
		sourceLoop = sourceLoop.concat(js);
		total = sourceLoop.length;
		num = js.length;
		if (num===max) { 
			//maximum records returned, which meanse we have more to get(probably)
			//increment skip and run again
			skip = skip + max;
			var q = fmxj.findRecordsURL("Events","Events", requests, sort, max, skip);
			fmxj.postQueryFMS(q,writeResult,null,relay) ;
		};
				
		//first time through we write our results
		if (total===max) {
			var displayJSON = JSON.stringify(sourceLoop.slice(0,max), null, indent );
			message = "<span class=\"resultHeader\">" + num + " FileMaker records downloaded in " + 
			dlc + " milliseconds.</span>\n" + "<span class=\"resultHeader\">converted to JS objects in " + 
			cc + " milliseconds.</span>\n" + "<span class=\"resultHeader\">Displaying the first " + max + 
			" \"stringified\" objects in " + (split-start) + " total milliseconds.</span>\n"
			document.getElementById(resultElementID).innerHTML = message + "\n\n" + displayJSON ;
		}
		else if (num!==max) { //write final result
			var displayJSON = JSON.stringify(sourceLoop.slice(0,max), null, indent );
			message += "<span class=\"resultHeader\">" + num + " records downloaded in " + 
			dlc + " milliseconds.</span>\n" + "<span class=\"resultHeader\">converted to JS objects in " + 
			cc + " milliseconds.</span>\n";
			document.getElementById(resultElementID).innerHTML = message + "<span class=\"resultHeader\">Complete! " +
			total + " total records in " + (split-start) + " total milliseconds.</span>\n\n" + displayJSON ;
		}
		else { //update progress message
			var displayJSON = JSON.stringify(sourceLoop.slice(0,max), null, indent );
			message += "<span class=\"resultHeader\">" + num + " more records downloaded in " + 
			dlc + " milliseconds.</span>\n" + "<span class=\"resultHeader\">converted to JS objects in " + 
			cc + " milliseconds.</span>\n";
			document.getElementById(resultElementID).innerHTML = message + "\n\n" + displayJSON ;
		}
	}; //end writeResult
	var q = fmxj.findRecordsURL("Events","Events", requests , sort , max , skip  );
	//clear values
	document.getElementById(resultElementID).innerHTML = "<span class=\"resultHeader\">POST: " + q + "</span>\n\n";
	fmxj.postQueryFMS(q, writeResult, writeDownload, relay);
};

function createMessage(js, utc, start, num){
	var end = new Date().getTime();
	var dlc = utc - start;
	var cc = end - utc;
	var tt = end - start;
	var total = js.length;
	if(!total){total = 1};
	if(!num){var num= total};
	var message = "<span class=\"resultHeader\">" + total + 
	" FileMaker records downloaded in " + dlc + " milliseconds</span>\n" +
	"<span class=\"resultHeader\">" +  
	"FMPXMLRESULT converted to JS objects in " + cc + " milliseconds</span>\n" +
	"<span class=\"resultHeader\">Displaying the first " + num + " \"stringified\" objects.</span>\n" +
	"<span class=\"resultHeader\">" + (end - start) + " total milliseconds.</span>\n\n";
	return message;
	
};

function createDisplay(js, utc, start, num){
	var indent = 4; // JSON indent
	var display = JSON.stringify(js.slice(0,num), null, indent);
	var message = createMessage(js,utc,start,num);
	return message+display ;
};

function updateElement(id, value, append){
	if(append){document.getElementById(id).innerHTML += value;}
	else{document.getElementById(id).innerHTML = value;}
};

function editQuery(source){
	var firstRecord = source[0];
	var recid = firstRecord["-recid"];
	var recordStatus = firstRecord["Status"] ;
	var recordModId = firstRecord["-modid"] ;
	//create edit object and requests array
	var edit = {"-recid":recid};
	var requests = [edit];
	//toggle status
	if ( recordStatus == "Open" ) {var newStatus = "Closed" } else {var newStatus = "Open" } ;
	edit["Status"] = newStatus ;
	edit["-modid"] = recordModId ;
	return fmxj.editRecordURL( "Events" , "Events" , edit ) ;
};

//***************Load Sidebar*********************

updateElement("sb",'<ul style="margin-top:0px;"><li class="sidebaritem"><a href="../index.html">Home</a></li><li class="sidebaritem">Query Functions<ul><li class="smallitem"><a href="../examples/findRecords.html">findRecordsURL()</a></li><li class="smallitem"><a href="../examples/editRecord.html">editRecordURL()</a></li><li class="smallitem"><a href="../examples/deleteRecord.html">deleteRecordURL()</a></li><li class="smallitem"><a href="../examples/layoutInfo.html">layoutInfoURL()</a></li></ul></li><li class="sidebaritem">Server Functions<ul><li class="smallitem" id="pql"><a href="../examples/postQuery.html">postQueryFMS()</a></li></ul></li><li class="sidebaritem">Object Functions<ul><li class="smallitem"><a href="../examples/filterObjects.html">filterObjects()</a></li><li class="smallitem"><a href="../examples/sortObjects.html">sortObjects()</a></li><li class="smallitem"><a href="../examples/nestObjects.html">nestObjects()</a></li></ul></li></ul>');

//***************SAMPLE DATA*********************

//each object in the array represents a find request
//standard calendar view requests
var requests = 
		[
			{"DateStart":"<=2/28/2014", "DateEnd":">=2/1/2014"},
			{"DateStart":"2/1/2014...2/28/2014"}
		] ;
		
// flgging the -omit property of a request with 1 designates it as an omit request.
var requestsOmit = 
		[
			{"DateStart":"<=2/28/2014","DateEnd":">=2/21/2014"},
			{"DateStart":"2/1/2014...2/28/2014"},
			{"Resource":"Example B","-omit":1}
		] ;

// object for new record. Don't specify -recid property.
var newRecord =
	    {
	      	"DateEnd": "02/25/2014",
	      	"DateStart": "02/25/2014",
	      	"Description": "test",
	     	"Status": "Open",
	     	"Summary": "test summary ubi"
	    };
		
//global filter Object display value
var filterObj =
	 	[
			{"id":"E4B04F12-E006-4928-A1E0-0E86EDF5641C"},
			{"id":"463BBEA9-404B-4979-8CC0-6F8F60EB0154"},
			{"id":"8CDA64C4-643D-4A64-9336-83BEF07F0CF4"}
		];
		
//global sort Object display value
var sortObjectJs =
	 	{
		"property1" : "DateStart",
		"order1" : "descend",
		"type1" : "date",
	 	"property2" : "Resource",
		"order2" : "ascend",
		"type2" : "string" 
   	 	};
					
var sortObject =	
		{
			"field1" : "DateStart" ,
			"order1" : "descend" ,
			"field2" : "id" ,
			"order2" : "ascend"
		} ;
		
//end sample data