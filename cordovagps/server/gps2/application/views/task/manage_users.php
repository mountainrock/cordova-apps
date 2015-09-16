   <?php
	  $userName= $this->session->userdata('userName');
	  $customerId = $this->session->userdata('customerId');
    ?> 
  
<div class="content-wrap">
            <!-- main page content. the place to put widgets in. usually consists of .row > .col-md-* > .widget.  -->
            <main id="content" class="content" role="main">
                <!--ol class="breadcrumb">
                    <li>YOU ARE HERE</li>
                    <li class="active">Users</li>
                </ol-->
               
        
               
                 <!-- test-->
                 <div class="row clear_fix">
			    <div class="col-md-12">
			 
			        <div id="response"></div>
			 
			        
			 	
			 	<div class="panel panel-primary">
			 		<div class="panel-heading"><h4 class="panel-title">Mapped users</h4></div>
			 		<div class="panel-body">
					        <table class="table table-bordered">
					            <thead><tr><th>User name</th><th>Device Id</th><th>Phone Number</th><th>created</th><th>Action</th></tr></thead>
					            <tbody id="fillUserGrid">
					             
					            </tbody>
					            <tfoot></tfoot>
					        </table>
				        </div>
					<div class="panel-footer">
					   <form class="form-inline" role="form" id="frmadd" action="<?php echo base_url() ?>index.php/User/createUser" method="POST">
				                <div class="form-group">
				                    <label class="sr-only" for="exampleInputEmail2">User name</label>
				                    <input type="text" name="userName" class="form-control" id="exampleInputEmail2" placeholder="User name">
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
				                    <input type="submit" class="btn btn-success" id="exampleInputPassword2" value="Add User">
				                </div>
				            </form>
					</div>
			        </div>
			        
			 	<div  class="panel panel-primary">
				 	<div class="panel-heading"><h4  class="panel-title">Unmapped devices</h4></div>
				 	<div class="panel-body">
				 	 <table class="table table-bordered">
				            <thead><tr><th>Device Id</th></tr></thead>
				            <tbody id="fillUnmappedDeviceGrid">
				             
				            </tbody>
				            <tfoot></tfoot>
				        </table>
				        </div>
			 	</div>
			 
			    </div>
			</div>

            </main>
        </div>
        <!-- The Loader. Is shown when pjax happens -->
        <div class="loader-wrap hiding hide">
            <i class="fa fa-circle-o-notch fa-spin-fast"></i>
        </div>

      
    </body>
    
     <!-- common libraries. required for every page-->
    
        
	<!--[if !IE]> -->
		<script src="<?php echo base_url(); ?>js/jquery_2.1.js"></script>
	<!-- <![endif]-->
	
	<!--[if IE]>
		<script src="<?php echo base_url(); ?>js/jquery.1.11.1.min.js"></script>
	<![endif]-->
     
        <script src="<?php echo base_url(); ?>js/jquery-pjax/jquery.pjax.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/collapse.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/button.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/tooltip.js"></script>
        <script src="<?php echo base_url(); ?>js/bootstrap-sass/vendor/assets/javascripts/bootstrap/alert.js"></script>
        <script src="<?php echo base_url(); ?>js/jQuery-slimScroll/jquery.slimscroll.min.js"></script>
        <script src="<?php echo base_url(); ?>js/widgster/widgster.js"></script>
        <!--[if !IE]> -->
        <script src="<?php echo base_url(); ?>js/pace.js/pace.min.js"></script>
        <!-- <![endif]-->
        <script src="<?php echo base_url(); ?>js/jquery-touchswipe/jquery.touchSwipe.js"></script>
        
        
         <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery.colorbox/1.4.33/jquery.colorbox-min.js"></script>
     	<link href="http://cdnjs.cloudflare.com/ajax/libs/jquery.colorbox/1.4.33/example1/colorbox.min.css" rel="stylesheet"/>
   	<link rel="stylesheet" href="<?php echo base_url(); ?>css/gps/styles.css">
   	
         <!-- common app js -->
        <script src="<?php echo base_url(); ?>js/settings.js"></script>
        <script src="<?php echo base_url(); ?>js/app.js"></script>
        
        <script>
	$(document).ready(function (){
	    	//fill data
	    	var btnedit='';
	   	 var btndelete = '';
	        fillUserGrid();
	        
	        // add data
	        $("#frmadd").submit(function (e){
	            e.preventDefault();
	            $("#loader").show();
	            var url = $(this).attr('action');
	            var data = $(this).serialize();
	            $.ajax({
	                url:url,
	                type:'POST',
	                data:data
	            }).done(function (data){
	                $("#response").html(data);
	                $("#loader").hide();
	                fillUserGrid();
	                
	            });
	        });
	     
	     
	    function fillUnmappedDeviceGrid(){
	    
	      $("#loader").show();
	        $.ajax({
	            url:'<?php echo base_url() ?>index.php/User/loadUnmappedDevices?customerId='+customerId,
	            type:'GET'
	        }).done(function (data){
	            $("#fillUnmappedDeviceGrid").html(data);
	            $("#loader").hide();
	             //bind events
		    $( ".deviceId" ).bind( "click", function( event ) {
			   	$('#deviceIdAdd').val($(this).text());
			  });
	        });
	    } 
	    
	    function fillUserGrid(){
	        $("#loader").show();
	        $.ajax({
	            url:'<?php echo base_url() ?>index.php/User/loadUsers?customerId='+customerId,
	            type:'GET'
	        }).done(function (data){
	            $("#fillUserGrid").html(data);
	            $("#loader").hide();
	            btnedit = $("#fillUserGrid .btnedit");
	            btndelete = $("#fillUserGrid .btndelete");
	            var deleteurl = btndelete.attr('href');
	            var editurl = btnedit.attr('href');
	            //delete record
	            btndelete.on('click', function (e){
	                e.preventDefault();
	                var deleteid = $(this).data('id');
	                if(confirm("are you sure")){
	                    $("#loader").show();
	                    $.ajax({
		                    url:deleteurl,
		                    type:'POST' ,
		                    data:'id='+deleteid
		                    }).done(function (data){
		                    $("#response").html(data);
		                    $("#loader").hide();
		                    fillUserGrid();
	                    });
	                }
	            });
	             
	            //edit record
	            btnedit.on('click', function (e){
		                e.preventDefault();
		                var editid = $(this).data('id');
		                $.colorbox({
		                href:"<?php echo base_url()?>index.php/User/editUser/"+editid,
		                top:50,
		                width:500,
		                onClosed:function() {fillUserGrid();}
	                });
	            });
	             
	        });
	        fillUnmappedDeviceGrid();
	    }
	    
	   
	   
	     
	});
</script>
</html>