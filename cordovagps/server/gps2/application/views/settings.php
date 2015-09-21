  <div class="content-wrap">
            <!-- main page content. the place to put widgets in. usually consists of .row > .col-md-* > .widget.  -->
           <main id="content" class="content" role="main">
		   <!--ol class="breadcrumb">
		      <li>YOU ARE HERE</li>
		      <li class="active">Settings</li>
		      </ol-->
		   <div class="row">
		      <div class="col-md-12">
		            <?php //echo print_r($settings);?>
		            
		            <div class="panel panel-primary">
		               <div class="panel-heading">Settings</div>
		               <div class="panel-body">
                                  <div id="response"></div>
		                  <form id="frmSaveSettings" class="form-horizontal" method="post" action="<?php echo base_url() ?>index.php/Setting/saveSettings">
   		                      <input type="hidden" class="form-control" name="customerId" id="customerId" value="<?php echo $this->session->userdata('customerId') ?>">
		                    
		                     
		                     <div class="form-group">
		                       	<table>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Server URL</label></td>
							<td width="90%" align="left"><input id="serverUrl" name="serverUrl" type="text" value="<?php echo $settings['serverUrl'];?>" style="width:70%"/></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Task Server URL</label></td>
							<td width="90%" align="left"><input id="taskServerUrl" name="taskServerUrl" type="text" value="<?php echo $settings['taskServerUrl'];?>" style="width:70%"/></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">APK Update URL</label></td>
							<td width="90%" align="left"><input id="apkServerUrl" name="apkServerUrl" type="text" value="<?php echo $settings['apkServerUrl'];?>" style="width:70%"/></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Customer Id</label></td>
							<td width="90%" align="left"><input id="customerId" name="customerId" type="text" value="<?php echo $this->session->userdata('customerId') ?>" disabled /></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap ><label class="bold">Gps max age(seconds)</label></td>
							<td width="90%" align="left"><input id="gpsMaxAge" name="gpsMaxAge" type="text" value="<?php echo $settings['gpsMaxAge'];?>"/></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap ><label class="bold">Gps accuracy(mtrs)</label></td>
							<td width="70%" align="left"><input id="gpsAccuracy" name="gpsAccuracy" type="text" value="<?php echo $settings['gpsAccuracy'];?>"/>eg: 10,100,1000</td>
							<td width="20%" align="left" nowrap></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Gps distance filter(mtrs)</label></td>
							<td width="70%" align="left"><input id="gpsDistanceFilter" name="gpsDistanceFilter" type="text" value="<?php echo $settings['gpsDistanceFilter'];?>"/>eg: 10,20,etc</td>
							<td width="20%" align="left" nowrap></td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left"><label class="bold">GPS toggle button enabled</label></td>
							<td width="90%" align="left">
								<select id="locationToggle" name="locationToggle" >
					                        <option value="false" <?php if($settings['locationToggle'] == "false") echo " selected ";?>>Off</option>
					                        <option value="true" <?php if($settings['locationToggle'] == "true") echo " selected ";?>>On</option>
					                    </select>
					               </td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Debug</label></td>
							<td width="90%" align="left">
								<select id="debug" name="debug">
					                        <option value="false" <?php if($settings['debug'] == "false") echo " selected ";?>>Off</option>
					                        <option value="true" <?php if($settings['debug'] == "true") echo " selected ";?>>On</option>
					                    </select>
					                  </td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Auto startup</label></td>
							<td width="90%" align="left">
							    <select name="autostart" id="autostart" >
					                        <option value="false" <?php if($settings['autostart'] == "false") echo " selected ";?>>Off</option>
					                        <option value="true" <?php if($settings['autostart'] == "true") echo " selected ";?>>On</option>
					                    </select>
					                 </td>
						</tr>
						<tr><td colspan="4">&nbsp;</td></tr>
						<tr>
							<td width="5%">&nbsp;</td>
							<td align="left" nowrap><label class="bold">Auto start GPS</label></td>
							<td width="90%" align="left">
							    <select name="autoTurnOnGps" id="autoTurnOnGps" >
					                        <option value="false" <?php if($settings['autoTurnOnGps'] == "false") echo " selected ";?>>Off</option>
					                        <option value="true" <?php if($settings['autoTurnOnGps'] == "true") echo " selected ";?>>On</option>
					                    </select>
					                 </td>
						</tr>
					</table>
		                     </div>
		                     
		                      <div class="form-group">
		                       
		                      
		                           <div class="table-responsive">
		                              <table class="table table-bordered table-striped table-condensed cf" >
		                               <tr>
		                              	    <td width="5%">&nbsp;</td>
		                                    <td colspan=4 align=left> <label for="workHours" class="bold">Work hours</label></td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td style="width:10%">Mon :</td>
		                                    <td style="width:10%"> <input type="text" name="mon" id="mon" class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td style="width:50%">
		                                       <div class="flat-slider slider-range" id="slider-mon" ></div>
		                                    </td>
		                                    
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Tue :</td>
		                                    <td> <input type="text" name="tue" id="tue" class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-tue" ></div>
		                                    </td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Wed :</td>
		                                    <td> <input type="text" name="wed" id="wed" class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-wed" ></div>
		                                    </td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Thu :</td>
		                                    <td> <input type="text" name="thu" id="thu" class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-thu"  ></div>
		                                    </td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Fri :</td>
		                                    <td> <input type="text" name="fri" id="fri"  class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-fri"  ></div>
		                                    </td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Sat :</td>
		                                    <td> <input type="text" name="sat" id="sat"  class="sliderText" value="9:30 AM - 6:00 PM"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-sat"  ></div>
		                                    </td>
		                                 </tr>
		                                 <tr>
		                                    <td width="5%">&nbsp;</td>
		                                    <td>Sun :</td>
		                                    <td> <input type="text" name="sun" id="sun" class="sliderText" value="-"/></td>
		                                    <td>
		                                       <div class="flat-slider slider-range" id="slider-sun" ></div>
		                                    </td>
		                                 </tr>
		                              </table>
		                           </div> <!-- table -->
		                        
		                     </div>  <!-- form-group-->
		                     
		                     <div class="form-group">
		                        <div class="col-sm-offset-2 col-sm-10">
		                           <button type="submit" class="btn btn-success">Save</button>
		                        </div>
		                     </div>
		                     
		                  </form> <!-- form-horizontal-->
		               </div> <!-- panel-body" -->
		            </div><!-- panel -->
		         
		      </div> <!-- col-md-12-->
		   </div> <!-- row -->
		  
		</main>
        </div> <!-- content-wrap -->
        <!-- The Loader. Is shown when pjax happens -->
        <div id="loader" class="loader-wrap hiding hide">
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

<!-- custom -->
  <script src="<?php echo base_url(); ?>js/jquery-ui-1.11.2.js"></script>
  <link rel="stylesheet" href="<?php echo base_url(); ?>css/jquery-ui-1.11.css">

<script>
$(document).ready(function (){

        var workHours ='<?php echo $settings['workHours'];?>';
        var workHoursAr = workHours.split(",");
        var weekDays=["mon","tue","wed","thu","fri","sat","sun"];

	for(i=0;i<weekDays.length;i++){    
        	$('#'+weekDays[i] ).val(workHoursAr[i]);
        }
        
	$(".slider-range").slider({
	    range: true,
	    min: 0,
	    max: 1440,
	    step: 15,
	    values: [600, 1080],
	    slide: function (e, ui) {
	        var hours1 = Math.floor(ui.values[0] / 60);
	        var minutes1 = ui.values[0] - (hours1 * 60);
	
	        var hours2 = Math.floor(ui.values[1] / 60);
	        var minutes2 = ui.values[1] - (hours2 * 60);
	       
		var idInput= $(this).attr("id");
		idInput = idInput.split("-")[1];
	
	        $('#'+idInput ).val( formatAMPM( hours1 , minutes1) + ' - ' + formatAMPM( hours2, minutes2) );
	    }
	});

	// save data
	        $("#frmSaveSettings").submit(function (e){
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
	                
	                
	            });
	        });
	        
});

function formatAMPM(hours, minutes) {
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


</script>
</html>