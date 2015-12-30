var task ={
    intervalID : null,
	orders : new Array(),
	tableDetail : new Object(),
	showTaskDetails: function() {
		//jQuery.mobile.changePage(jQuery('#taskDetailsPage'));
	},
	getTasks : function() {  
		   app.showMessage("Getting tasks. Please wait...");
	       var isConnected = app.checkConnection();
	       if(isConnected == false){
	    	   app.showMessage("No internet connection available to load tasks");
	    	   return;
	       }
	       var taskUrlPath=  app.taskServerUrl + "/Requests.php?action=getInvoices&deviceId="+ device.uuid+"&userName="+app.userName;
	       app.showMessage("getTasks :"+taskUrlPath);
			$.ajax(taskUrlPath, {
				cache: false,
	            contentType : "application/json",
	            type: 'GET',
	            timeout: DEFAULT_TIMEOUT_SECS,
	            success: function(data) {
	            	app.showMessage("Loadind tasks --"+ data); //should call loadTasks() callback
	            	loadTasks(data);
	            },
				error: function (xhr, status, errorThrown) {
					console.log("error status: " + xhr.status);
					console.log("errorThrown: " + errorThrown);
					var errmsg = "";
					if(errorThrown!=null && errorThrown!=undefined){
						errmsg =errorThrown.message;
					}
					app.showMessage("Error xhr.status: " + xhr.status+", status :"+ status + "<br/>errorThrown: " + errmsg);
				}
	        });		
	   },
	  stopAutoRefresh: function(){
		  clearInterval(task.intervalID);
	  },
	  restartInterval: function() {
	        clearInterval(task.intervalID);
	        task.intervalID = setInterval(task.getTasks, 60 * 1000);          
	   },
	  loadInvoice: function(taskId){
			 app.showPage('takeOrderPage');
			 $("#response,#showerror").hide();
		     var taskViewUrlPath= app.taskServerUrl + "/Requests.php?action=getOrder&deviceId="+ device.uuid +"&invoiceNo="+ taskId ;
		     console.log("loadInvoice :"+taskViewUrlPath);
				$.ajax(taskViewUrlPath,
						{
							contentType : "application/json",
				            type: 'GET',
				            timeout: DEFAULT_TIMEOUT_SECS,
				            success: function(data) {
				              app.showMessage("Load invoice status: "+data); //should call loadRoutes() callback
				              task.reloadOrders(data.invoiceDetails);
							  var tableDetail = data.invoiceHeader;
								$("#table").val(tableDetail.cafeTableName);
								$("#cafeTableID").val(tableDetail.cafeTableID);
								$("#baristaCode").val(tableDetail.baristaCode);
								$("#barista").val(tableDetail.salesMan);
								$('#invoiceNoTxt').text(tableDetail.invoiceNo);
							  $(".hideOnViewItem").hide();
				            },
							error: function (xhr, status, errorThrown) {
								console.log("error status: " + xhr.status);
								console.log("errorThrown: " + errorThrown);
								app.showMessage("error status: " + xhr.status + "<br/>errorThrown: " + errorThrown);
							}
		      });	
			  
		},
	  reloadOrders: function(orders){
				   var products="";
				   var totalAmount = 0; 
				   var totalQty = 0; 
				   var totalItems = orders.length; 
				   for(i=0;i<orders.length; i++){
				     products = products + "<tr>"
					 					+ "<td>"+orders[i].index+"</td>"
									    + "<td>"+orders[i].productDesc+"</td>"
									    + "<td>"+orders[i].otherDesc+"</td>"
									    + "<td>"+orders[i].qty+" x "+orders[i].price+"</td>"
									    + "<td>"+orders[i].total+"</td>"
										+ "<td><span class='icon hideOnViewItem' onclick='task.deleteItem("+orders[i].index+")'><span class='glyphicon glyphicon-trash'></span></span></td>"
									    + "</tr>";
					  totalAmount = totalAmount + eval(orders[i].total);
					  totalQty = totalQty + eval(orders[i].qty);
				   }
				   $("#totalQty").text(totalQty);
				   $("#totalAmount").text(totalAmount);
				   $("#totalItems").text(totalItems);
				   $("#productBody").html(products);
				
		  },
		 updateLineTotal: function(){
		  			var qty = eval($("#qty").val());
					var price = eval($("#price").val());
					$("#total").val(qty * price);
		  },
		  addOrder : function(){
			  		if(app.checkLicenseValid() ==false){
						return;
					}
					var orderObject = new Object();
					var index = task.orders.length;
					var isValid = validator.element( "#product" );
					isValid = isValid && validator.element( "#productNo" );
					if($("#productNo").val() =='' ){
					   alert("Invalid product selected. Product doesnt exist in database");	
					   isValid = false;
					}
					if(!isValid){
					  return;
					}
					orderObject.productNo = $("#productNo").val();
					orderObject.productCode = $("#productCode").val();
					orderObject.productDesc = $("#product").val();
					orderObject.otherDesc = $("#otherDesc").val();
					orderObject.price = $("#price").val();
					orderObject.qty = $("#qty").val();
					orderObject.total = $("#total").val();
					orderObject.index = index + 1;
					
					task.orders.push(orderObject);
					$("#productNo,#productCode,#product,#otherDesc,#price,#qty,#total").val("");
					task.reloadOrders(task.orders);  
		  
		  },
		  deleteItem : function(idx){
					for(i=0;i<task.orders.length;i++){
						if(task.orders[i].index == idx){
							task.orders.splice(i, 1);
						}
					}
					for(i=0;i<task.orders.length;i++){
						task.orders[i].index= i+1;
					}
					task.reloadOrders(task.orders);
		  },
		  confirmOrder : function(){
					var tableDetail = task.tableDetail;
					var isValid = validator.element( "#table" );
					isValid = isValid && validator.element( "#barista" );
					if(!isValid){
					  return;
					}
					if(task.orders ==null || task.orders.length ==0){
						
					   $('#showerror').html("Please enter an order!");
					   $('#showerror').show();
					   return;
					}
					
					tableDetail.tableName = $("#table").val();
					tableDetail.cafeTableID = $("#cafeTableID").val();
					tableDetail.baristaCode = $("#baristaCode").val();
					tableDetail.barista = $("#barista").val();
					tableDetail.totalQty = $("#totalQty").text();
					tableDetail.totalAmount = $("#totalAmount").text();
					tableDetail.totalItems = $("#totalItems").text();
					tableDetail.invoiceNo = $("#invoiceNo").val();
					
					//submit json instead of form serialization
					$.post(app.taskServerUrl + "/Requests.php?action=takeOrder&deviceId="+ device.uuid,  
							JSON.stringify({"orders": task.orders, "tableDetail" : tableDetail}), 
							'json'
					).success(function (data) {
								if(data.status!=null && data.status.indexOf("success")>0){
									task.loadInvoice(data.id);
									$('#response').html(data.status);
									$('#invoiceNoTxt').text(data.id);
									$('#response').show(); $("#showerror").hide();
									task.orders = new Array();
								}else{
									$('#showerror').html(data.responseText);
									$('#showerror').show(); $("#response").hide();
								}
								$('body').animate({scrollTop: 10}, 500);
					}).fail(function(data) {
							$('#showerror').html(data.responseText);
							 $('#showerror').show(); $("#response").hide();
							$('body').animate({scrollTop: 10}, 500);
					});
		  }


};

function loadTasks(json) { 
  //alert(json);
  $("#taskTable tr.task").remove();
  var i=0;
  if(json==null || json.recordCount ==0){
	  app.showMessage("No tasks found");
	  return;
  }else if(json.error!=null){
	  app.showMessage(json.error);
	  return;
  }
 
  app.showMessage("Loading tasks");
  $(json.invoices).each(function(key, value){
	  var taskId = $(this).attr('InvoiceNo');
	  var phoneNo = $(this).attr('ContactNo');
	  var row = "";
	  if(i++%2==0){
		  row ="<tr class='task oddRow'>";
	  }else{
		  row ="<tr class='task'>";
	  }
      row = row	+
				"<td valign='top'><span class='taskdetails' > <a href='#' id='loadInvoice' class='loadInvoice' onclick ='task.loadInvoice(" + taskId + ")' ><b>"+$(this).attr('CafeTableName')+"</b></a></span></td>"+
				"<td valign='top'><span class='taskdetails' > <a href='#'  onclick ='task.loadInvoice(" + taskId + ")' ><b>"+$(this).attr('InvoiceNo')+"</b></a></span></td>"+
				"<td valign='top'><span class='taskdetails' >"+$(this).attr('InvoiceDate')+"</span></td>"+ 
				"<td valign='top'><span class='taskdetails' >"+$(this).attr('TotalQty')+"</span></td>"+ 
				"<td valign='top'><span class='taskdetails' >"+$(this).attr('InvoiceAmount')+"</span></td>"
							 "</tr>";
      $("#taskTable").append(row);
      $(".updateTask").change();
  });
  
  app.showMessage("Found "+ json.invoiceCount + " invoice(s) ");
}

function td(obj, attrId){
	var str = $(obj).attr(attrId);
	return "<td valign='top'>"+str+"</td>";
}