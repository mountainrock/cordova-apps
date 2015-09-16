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
                                    <div class="panel-heading">Reports (TODO:)</div>
                                    <div class="panel-body">
                                    <form class="form-horizontal">
					  <div class="form-group">
					    <label for="workHours" class="col-sm-2 control-label">Date Range</label>
					    <div class="col-sm-10">
					      <input type="text" class="form-control" id="workHours" placeholder="10:00-18:00">
					    </div>
					  </div>
					  					  </div>
					 
					  <div class="form-group">
					    <div class="col-sm-offset-2 col-sm-10">
					      <button type="submit" class="btn btn-success">Run</button>
					    </div>
					  </div>
				      </form>
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
        
        <link rel="stylesheet" href="<?php echo base_url(); ?>css/gps/styles.css">
</html>