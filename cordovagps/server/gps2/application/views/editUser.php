<div class="well">
    <div class="errorresponse">
         
    </div>
    <form class="form" id="frmupdate" role="form" action="<?php echo base_url() ?>index.php/Gps/updateUser" method="POST">
    <?php foreach($users->result() as $row):?>
                         
                            <div class="form-group">
			                    <label class="sr-only" for="exampleInputEmail2">User name</label>
			                    <input type="text" name="userName" class="form-control" id="exampleInputEmail2" placeholder="User name" value="<?php echo $row->userName?>">
			                </div>
			                <div class="form-group">
			                    
			                        <label class="sr-only" for="deviceId">Device Id</label>
			                        <input class="form-control" name="deviceId" type="text" placeholder="Device Id" value="<?php echo $row->deviceId?>">
			                    
			                </div>
			                <div class="form-group">
			                    <label class="sr-only" for="examplePhone">Phone Number</label>
			                    <input type="text" class="form-control" name="phoneNumber" id="examplePhone" placeholder="Phone Number" value="<?php echo $row->phoneNumber?>">
			                </div>
			                
			                <div class="form-group">
			                <input type="hidden" name="userId" value="<?php echo $row->userId ?>"/>
			                    <input type="submit" class="btn btn-success" id="exampleInputPassword2" value="submit">
			                </div>
        <?php endforeach;?>
                        </form>
                    </div>
</div>
 
<script>
$(document).ready(function (){
    $("#frmupdate").submit(function(e){
        e.preventDefault();
        $.ajax({
            url:'<?php echo base_url() ?>index.php/Gps/updateUser',
            type:'POST',
            dataType:'json',
            data: $("#frmupdate").serialize()
        }).done(function (data){
            window.mydata = data;
                if(mydata['error'] !=""){
                    $(".errorresponse").html(mydata['error']);
                }
                else{
                $(".errorresponse").text('');
                $('#frmupdate')[0].reset();
                $("#response").html(mydata['success']);
                 
                $.colorbox.close();
                $("#response").html(mydata['success']);
                }
        });
    });    
});
 
     
</script>
</body>
</html>