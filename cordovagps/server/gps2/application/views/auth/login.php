<!DOCTYPE html>
<html>
<head>
<?php
$page="Login";
include('./application/views/common/common-header.php');
?>

</head>
<body>
<body  class="login-page" style="color:black; background:#043752;">
<div class="container">
    <main id="content" class="widget-login-container" role="main">
        <div class="row">
            <div class="col-lg-4 col-sm-6 col-xs-10 col-lg-offset-4 col-sm-offset-3 col-xs-offset-1">
                <h2 class="widget-login-logo animated fadeInUp">
                      <span style="color: rgb(253, 207, 183);">Super</span><span style="color:rgb(228, 184, 71)"> GPS</span>
                </h2>
                <section class="widget widget-login animated fadeInUp">
                    <header>
                        <h3>Login</h3>
                    </header>
                    <div class="widget-body">
                        <p class="widget-login-info">
                          
                        </p>
                        <div class="login-form mt-lg">
                            <div class="alert alert-danger alert-sm" hidden="" id="showerror">
                                                         
                            </div>
                            <form id="loginForm">
	                            <div class="form-group">
	                                <input type="text" class="form-control" id="exampleInputEmail1" name="userName" placeholder="Username" value="Sandeep">
	                            </div>
	                            <div class="form-group">
	                                <input class="form-control" id="pswd" type="password" placeholder="Password" name="password" value="sandeep">
	                            </div>
	                            
	                            <div class="clearfix">
	                                <div class="btn-toolbar pull-right">
	                                <!--<button type="button" class="btn btn-default btn-sm">Create an Account</button>-->
	                                <button type="button"  class="btn btn-primary  btn-sm" id="logintodashboard"><span class="glyphicon"></span> Login To Dashboard</button>
	                                </div>
	                            </div>
                            </form>
                           
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
    <footer class="page-footer">
        2015 &copy; Bri8. All Right Reserved.<br>
    </footer>
</div>


</body>
<!--[if !IE]> -->
	<script src="<?php echo base_url(); ?>js/jquery_2.1.js"></script>
<!-- <![endif]-->

<!--[if IE]>
	<script src="<?php echo base_url(); ?>js/jquery.1.11.1.min.js"></script>
<![endif]-->




<!-- page specific js -->
<script>
    var url ='<?php echo base_url();?>';
    $(document).keypress(function (e) {
       // alert(e.which);
        if (e.which == 13) {
            $('#logintodashboard').click();
        } 
    });

    $('#logintodashboard').click(function () {
     $.post(url + "index.php/Auth/doLogin",  $( "#loginForm" ).serialize(), function (data) {           
           	if(data=="OK"){
           	 window.location = url + "index.php/Gps/showMap";
           	}else{
	            $('#showerror').html(data);
	            $('#showerror').show();
	        }
	    }).fail(function(d) {
	    	    $('#showerror').html(d.responseTxt);
	    	     $('#showerror').show();
	  });
	  
    });
    
        function goBack() {
            window.history.back()
        }
        </script>
        
</html>