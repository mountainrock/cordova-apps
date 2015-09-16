<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class User extends CI_Controller {

	public function __construct() {
	        parent::__construct();
       	        header('Access-Control-Allow-Origin: *');
	        $this->load->model("Gps_model", "gps", TRUE);
                $this->load->model("User_model", "user", TRUE);
	        $this->load->database();
	        $this->load->helper(array('form', 'url', 'date', 'cookie'));
	        $this->load->library('session');
	        $this->load->helper('url');
	        $this->load->library('form_validation');
	        date_default_timezone_set('asia/kolkata');
       }
	
		
	public function showManageUsers()
	{
		
		$this->load->view('common/panels');
		$this->load->view('user/manage_users');
	}
	
	public function getUsersSelectDropDownByCustomerId(){
		$customerId = $_REQUEST['customerId'];
		$isJson = isset($_REQUEST['getAsJson']);
		$users = $this->loadUsersByCustomerId($customerId); 
                if($isJson ==true){
		  echo json_encode($users);
                  exit;
                }
		
		echo "<option value=-1>Select User...</option>";
		foreach ($users as $row){
		
		    $edit = base_url().'index.php/User/editUser';
		    $delete = base_url().'index.php/User/deleteUser';
		    echo "<option value=\"$row->userId\">$row->userName</option>";		     
		}
        	
        }
        
        protected function loadUsersByCustomerId($customerId){
      
		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rows']) ? $_POST['rows'] : 50;
		$sidx = isset($_POST['sidx']) ? $_POST['sidx'] : 'userName';
		$sord = isset($_POST['sord']) ? $_POST['sord'] : '';
		$start = $limit * $page - $limit;
		$start = ($start < 0) ? 0 : $start;
		
		if (!$sidx)
			$sidx = 1;
			
		$count = $this->db->count_all_results('user');
		if ($count > 0) {
			$total_pages = ceil($count / $limit);
		} else {
			$total_pages = 0;
		}
		
		if ($page > $total_pages)
			$page = $total_pages;
		
		$where = "customerId ='".$customerId ."'";
		$users = $this->user->getAllUsers($start, $limit, $sidx, $sord, $where);
		return $users;
        }
        
        public function loadUnmappedDevices(){
		
		$customerId = $_REQUEST['customerId'];
		$devices= $this->gps->getAllUnmappedDevices($customerId); 
		
		foreach ($devices as $row){
		   echo "<tr>
                         <td class='deviceId'>$row->deviceId</td>
                        </tr>";
	             
	        }
        }
        
	public function loadUsers(){
		
		$customerId = $_REQUEST['customerId'];
		$users = $this->loadUsersByCustomerId($customerId); 
		
		foreach ($users as $row){
	            $edit = base_url().'index.php/User/editUser';
	            $delete = base_url().'index.php/User/deleteUser';
	            echo "<tr>
                        <td>$row->userName</td>
                        <td>$row->deviceId</td>
                        <td>$row->phoneNumber</td>
                        <td>$row->created</td>
                        <td><a href='$edit' data-id='$row->userId' class='btnedit' title='edit'><i class='glyphicon glyphicon-pencil' title='edit'></i></a>&nbsp;&nbsp;&nbsp;&nbsp; 
                            <a href='$delete' data-id='$row->userId' class='btndelete' title='delete'><i class='glyphicon glyphicon-remove'></i></a></td>    
	                </tr>";
	             
	        }
        }
        
       
         public function createUser(){
            $this->form_validation->set_rules('userName', 'User Name', 'required');
            $this->form_validation->set_rules('deviceId', 'deviceId', 'required');
            $this->form_validation->set_rules('phoneNumber', 'Phone Number', 'required|numeric|max_length[15]|min_length[5]');
            if ($this->form_validation->run() == FALSE){
               echo'<div class="alert alert-danger">'.validation_errors().'</div>';
               exit;
            }
            else{
                $this->user->createUser();
            }
        }
         
        public function editUser(){
            $id =  $this->uri->segment(3);
            $this->db->where('userId',$id);
            $data['users'] = $this->db->get('user');
            $data['id'] = $id;
            $this->load->view('user/editUser', $data);
            }
             
        public function updateUser(){
		$res['error']="";
		$res['success']="";
		$this->form_validation->set_rules('userName', 'User Name', 'required');
		$this->form_validation->set_rules('deviceId', 'deviceId', 'required');
		$this->form_validation->set_rules('phoneNumber', 'Phone Number', 'required|numeric|max_length[15]|min_length[5]');
		if ($this->form_validation->run() == FALSE){
			$res['error']='<div class="alert alert-danger">'.validation_errors().'</div>';    
		}           
		else{
			$data = array('userName'=>  $this->input->post('userName'),
					'deviceId'=>$this->input->post('deviceId'),
					'phoneNumber'=>$this->input->post('phoneNumber'));
			$id= $this->input->post('userId');
			$this->user->updateUser($id, $data);
			$res['success'] = '<div class="alert alert-success">Updated Successfully</div>';
		}
		header('Content-Type: application/json');
		echo json_encode($res);
		exit;
        }
 
 
        public function deleteUser(){
            $id =  $this->input->POST('id');
            $this->user->deleteUser($id);
            echo'<div class="alert alert-success">One record deleted Successfully</div>';
            exit;
        }
	
	
	
	
}