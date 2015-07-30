  <div class="content-wrap">
            <!-- main page content. the place to put widgets in. usually consists of .row > .col-md-* > .widget.  -->
            <main id="content" class="content" role="main">
                <ol class="breadcrumb">
                    <li>YOU ARE HERE</li>
                    <li class="active">GPS Tracker Map</li>
                </ol>
      
                <div class="row">
                    <div class="col-md-12">
                        <section class="widget">
                            <div class="widget-body">
                                <div> <!--  class="container-fluid" -->
				       
				        <div class="row">
				            <div class="col-sm-12" id="mapdiv">
				                <div id="map-canvas"></div>
				            </div>
				        </div>
				        <div class="row">
				            <div class="col-sm-12" id="selectdiv">
					            <span id="messages"></span><br/>
					        <select id="userSelect" tabindex="1"></select>
				                <select id="routeSelect" tabindex="1" style="width:140px"><option>No routes</option></select>
				            </div>
				        </div>
				        <div class="row">
				           
				            <div class="col-sm-3 autorefreshdiv">
				                <input type="button" id="autorefresh" value="Auto Refresh Off" tabindex="3" class="btn btn-primary">
				            </div>
				            <div class="col-sm-3 refreshdiv">
				                <input type="button" id="refresh" value="Refresh" tabindex="4" class="btn btn-primary">
				            </div>				            
				             <div class="col-sm-3 deletediv">
				                <input type="button" id="delete" value="Delete" tabindex="2" class="btn btn-primary">
				            </div>
				        </div>
				    </div>       
                            </div>
                        </section>
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
       
        <!-- map specific -->
    <script src="//maps.google.com/maps/api/js?v=3&sensor=false&libraries=adsense"></script>
    <script src="<?php echo base_url(); ?>js/maps.js"></script>
    <script src="<?php echo base_url(); ?>js/leaflet-0.7.3/leaflet.js"></script>
    <script src="<?php echo base_url(); ?>js/leaflet-plugins/google.js"></script>
    <script src="<?php echo base_url(); ?>js/leaflet-plugins/bing.js"></script>
    <link rel="stylesheet" href="<?php echo base_url(); ?>js/leaflet-0.7.3/leaflet.css">    
    <link rel="stylesheet" href="<?php echo base_url(); ?>css/gps/styles.css">
</html>
    