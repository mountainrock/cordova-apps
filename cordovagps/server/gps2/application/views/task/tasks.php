   <?php
	  $userName= $this->session->userdata('userName');
	  $customerId = $this->session->userdata('customerId');
    ?> 
 <div class="content-wrap">
            <!-- main page content. the place to put widgets in. usually consists of .row > .col-md-* > .widget.  -->
            <main id="content" class="content" role="main">
                <!--ol class="breadcrumb">
                    <li>YOU ARE HERE</li>
                    <li class="active">Settings</li>
                </ol-->
     
                <div class="row">
                    <div class="col-md-12">
                       
                                <div class="form-horizontal" role="form" id="reset">
                                    <div class="panel panel-primary"> 
                                  	    <div class="panel-heading">Tasks (TODO:)</div>
	                                    <div class="panel-body">
		                                    <form class="col-lg-12">
		                                    	    <div class="form-group">
						             <label>Task</label>
						              <input type="text" class="autocomplete autocompleteTask form-control input-lg" title="Select task" placeholder="Select task">
						           
						            </div>
						            <div class="form-group">
						             <label>Employee</label>
						              <input type="text" class="autocomplete autocompleteUser form-control input-lg" title="Select user" placeholder="Select user">
						             </div>
						            
						            <div class="form-group">
						              <span class="input-group-btn"><button class="btn btn-success" type="button">Assign</button></span>
						            </div>
					          </form>
				     	 </div>
				      </div>
				      
				      <div class="panel panel-primary"> 
                                  	    <div class="panel-heading">Assigned</div>
	                                    <div class="panel-body">
					        <table class="table table-bordered">
					            <thead><tr><th>Task</th><th>Assigned To</th><th>Assigned by</th><th>created</th><th>Action</th></tr></thead>
					            <tbody id="taskAssignedGrid">
					             
					            </tbody>
					            <tfoot></tfoot>
					        </table>
				       	   </div>
				       	   <div class="panel-footer">
						  
					   </div>  
				     	 
				      </div>

                                          <div class="panel panel-primary"> 
                                  	    <div class="panel-heading">Unassigned tasks</div>
	                                    <div class="panel-body">
					        <table class="table table-bordered">
					            <thead><tr><th>Task</th><th>Created by</th><th>created</th><th>Action</th></tr></thead>
					            <tbody id="taskUnAssignedGrid">
					             
					            </tbody>
					            <tfoot></tfoot>
					        </table>
				       	   </div>
                                           <div class="panel-footer">
                                               <div class="form-group">
				                     <form class="form-inline" role="form" id="frmadd" action="<?php echo base_url() ?>index.php/User/createUser" method="POST">
					                <div class="form-group">
					                    <label class="sr-only" for="taskName">Task description</label>
					                    <input type="text" name="taskName" class="form-control" id="taskName" placeholder="Task name">
					                </div>
					                <div class="form-group">
					                       <label class="sr-only" for="deviceId">Device Id</label>
					                        <input class="form-control" name="deviceId" id="deviceIdAdd" type="text" placeholder="Device Id" >
					                    
		
					                </div>
					                <div class="form-group">
					                    <label class="sr-only" for="examplePhone">Phone Number</label>
					                    <input type="text" class="form-control" name="phoneNumber" id="examplePhone" placeholder="Phone Number">
					                </div>
					                
					                <div class="form-group">
					                    <input type="hidden" class="form-control" name="customerId" id="customerId" value="<?php echo $customerId;?>">
					                   <input type="submit" class="btn btn-success" id="addTask" value="Add Task">
					                </div>
					            </form>
				                    
				                </div>
                                           </div>
				     	 
				      </div>
                                </div>
                            
                    </div></div>

            </main>
        </div>
        <!-- The Loader. Is shown when pjax happens -->
        <div class="loader-wrap hiding hide">
            <i class="fa fa-circle-o-notch fa-spin-fast"></i>
        </div>

      
    </body>
    
        <!-- common libraries. required for every page-->
     	<script src="<?php echo base_url(); ?>js/jquery_2.1.js"></script>
        <script src="<?php echo base_url(); ?>js/jquery-pjax/jquery.pjax.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/collapse.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/button.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/tooltip.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/alert.js"></script>
        <script src="<?php echo base_url(); ?>js/jQuery-slimScroll/jquery.slimscroll.min.js"></script>
        <script src="<?php echo base_url(); ?>js/widgster/widgster.js"></script>
        <script src="<?php echo base_url(); ?>js/pace.js/pace.min.js"></script>
        <script src="<?php echo base_url(); ?>js/jquery-touchswipe/jquery.touchSwipe.js"></script>
        
         <!-- common app js -->
        <script src="<?php echo base_url(); ?>js/settings.js"></script>
        <script src="<?php echo base_url(); ?>js/app.js"></script>

        <script src="<?php echo base_url(); ?>js/jquery-ui-1.11.2.js"></script>
        <link rel="stylesheet" href="<?php echo base_url(); ?>css/gps/styles.css">

<script>

$(function() {
  var cacheUsers = new Array(); cacheUsersMap= new Array();
  var cacheTasks = new Array(); cacheTasksMap= new Array();

  //load users cache
  $.getJSON( baseurl + "index.php/Gps/getUsersSelectDropDownByCustomerId?customerId="+customerId+"&getAsJson=true", function( data, status, xhr ) {
          for(var i in data){
              var id = data[i].userId;
              var name = data[i].userName;
              cacheUsersMap[name]=id;
              cacheUsers.push(name);
          }
          
    });
  //load task cache
  $.getJSON( baseurl + "index.php/Gps/getUsersSelectDropDownByCustomerId?customerId="+customerId+"&getAsJson=true", function( data, status, xhr ) {
          
          for(var i in data){
              var id = data[i].userId;
              var name = data[i].userName;
              cacheTasksMap[name]=id;
              cacheTasks.push(name);
          }
   });

  $(".autocompleteTask").autocomplete({
      minLength: 0,
      source: cacheTasks
  });


  $(".autocompleteUser").autocomplete({
       minLength: 0,
      source:  cacheUsers
  });
});
</script>
        
        
</html>