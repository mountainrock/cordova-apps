  <div class="content-wrap">
            <!-- main page content. the place to put widgets in. usually consists of .row > .col-md-* > .widget.  -->
            <main id="content" class="content" role="main">
                <ol class="breadcrumb">
                    <li>YOU ARE HERE</li>
                    <li class="active">Users</li>
                </ol>
               
        
                <div class="row">				
						<div class="beta-products-list">
							<h4>New users</h4>
							<div class="beta-products-details">
	                                                  <table id="gridUser"> </table>

					 			<div id="pager"> </div>
					
					
					
						</div> <!-- .beta-products-list -->
	
	                                
                    
                 </div>

            </main>
        </div>
        <!-- The Loader. Is shown when pjax happens -->
        <div class="loader-wrap hiding hide">
            <i class="fa fa-circle-o-notch fa-spin-fast"></i>
        </div>

      
    </body>
    
     <!-- common libraries. required for every page-->
     	<script src="<?php echo base_url(); ?>js/jquery_2.1.js"></script>
     	<script src="<?php echo base_url(); ?>js/jqgrid/jquery.browser.js"></script>
     	<script src="<?php echo base_url(); ?>js/jqgrid/jquery.jqGrid.min.js"></script>
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
        
        <link type="text/css" href="<?php echo base_url()?>js/jqgrid/ui.jqgrid.css" rel="stylesheet" />
        <link type="text/css" href="<?php echo base_url()?>js/jqgrid/theme/jquery.ui.all.min.css" rel="stylesheet" />

        
					<script>
					
					        $(document).ready(function () {
					
					    jQuery("#gridUser").jqGrid({
					        url:'<?php echo base_url(); ?>index.php/Grid/loadUserData',                
					        mtype : "post",              //Ajax request type. It also could be GET
					        datatype: "json",            //supported formats XML, JSON or Arrray
					        colNames:['UserID','UserName','deviceId','password'],       //Grid column headings
					        colModel:[
					            {name:'UserId',index:'userId', width:100, align:"left", editable:true, editrules:{required:true}},
					            {name:'userName',index:'userName', width:150, align:"left",editable:true,editrules:{required:true}},
					            {name:'deviceId',index:'deviceId', width:100, align:"left", sortable:false, editable:true,editrules:{required:true}},
					            {name:'password',index:'password', width:100, align:"right",editable:true,editrules:{required:true}, 
					                edittype:'select', editoptions:{value:"1:Active;0:InActive"}
					            }
					        ],
					        rownumbers: true,
					        rowNum:10,
					        width: 750,
					        height: "100%",
					        rowList:[10,20,30],
					        pager: jQuery('#pager'),
					        sortname: 'userName',
					        autowidth: true,
					        viewrecords: true,            
					        gridview: true,  
					        ondblClickRow: function(id){              
					            $("#gridUser").editGridRow(id, {closeAfterEdit:true,mtype:'POST'});                
					        },
					        sortorder: "desc",       
					        editurl: '<?php echo base_url() ?>grid_action/crudUser', //URL Process CRUD
					        multiselect: false,
					        caption:"List Of Users"
					    }).navGrid('#pager',
					    {view:true,edit:true,add:true,del:true},
					    {closeOnEscape:true},
					    {closeOnEscape:true},
					    {closeOnEscape:true},
					    {closeOnEscape:true},
					    {
					        closeOnEscape:true,closeAfterSearch:false,multipleSearch:false, 
					        multipleGroup:false, showQuery:false,
					        drag:true,showOnLoad:false,sopt:['cn'],resize:false,
					        caption:'Search Record', Find:'Search', 
					        Reset:'Reset Search'
					    }
					);        
					
					});
						
				</script>
</html>