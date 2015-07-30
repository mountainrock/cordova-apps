<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Gps extends CI_Controller {

	public function __construct() {
        parent::__construct();
        $this->load->model("Gps_model", "gps", TRUE);
        $this->load->database();
        $this->load->helper(array('form', 'url', 'date', 'cookie'));
        $this->load->library('session');
        $this->load->helper('url');
         $this->load->library('form_validation');
                   date_default_timezone_set('asia/kolkata');
    }

	public function login()
	{
		$this->load->view('login');
	}

	public function doLogin()
	{
		$this->form_validation->set_rules('userName', 'User Name', 'required');
           	$this->form_validation->set_rules('password', 'password', 'required');
              	$this->form_validation->set_rules('customerId', 'customerId', 'required');
              	if ($this->form_validation->run() == FALSE){
                   echo validation_errors();
	           exit;
        	}

		$userName=   $_REQUEST['userName'];
		$password=   $_REQUEST['password'];
		$customerId=   $_REQUEST['customerId'];
		$user1= $this->gps->loginUser($userName,$password, $customerId);

            	if($user1!=null){
            		$this->session->set_userdata("userName", $user1[0]->userName);
			$this->session->set_userdata("customerId", $user1[0]->customerId);

			echo "OK";

		}else{
			echo 'Invalid username or password or customerId';
		}
		exit;
	}

	function logout(){
		$this->session->sess_destroy();
		$this->load->view('login');
	}

	public function showManageUsers()
	{

		$this->load->view('panels');
		$this->load->view('manage_users');
	}

	public function getUsersSelectDropDownByCustomerId(){
		$customerId = $_REQUEST['customerId'];
		$users = $this->loadUsersByCustomerId($customerId);
		echo "<option value=-1>Select User...</option>";
		foreach ($users as $row){

		    $edit = base_url().'index.php/Gps/editUser';
		    $delete = base_url().'index.php/Gps/deleteUser';
		    echo "<option value='$row->userId'>$row->userName</option>";
		}

        }

        protected function loadUsersByCustomerId($customerId){

		$page = isset($_POST['page']) ? $_POST['page'] : 1;
		$limit = isset($_POST['rows']) ? $_POST['rows'] : 10;
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
		$users = $this->gps->getAllUsers($start, $limit, $sidx, $sord, $where);
		return $users;
        }

	public function loadUsers(){

		$customerId = $_REQUEST['customerId'];
		$users = $this->loadUsersByCustomerId($customerId);

		foreach ($users as $row){

	            $edit = base_url().'index.php/Gps/editUser';
	            $delete = base_url().'index.php/Gps/deleteUser';
	            echo "<tr>
                        <td>$row->userName</td>
                        <td>$row->deviceId</td>
                        <td>$row->phoneNumber</td>
                        <td>$row->created</td>
                        <td><a href='$edit' data-id='$row->userId' class='btnedit' title='edit'><i class='glyphicon glyphicon-pencil' title='edit'></i></a>&nbsp;&nbsp;&nbsp;&nbsp; <a href='$delete' data-id='$row->userId' class='btndelete' title='delete'><i class='glyphicon glyphicon-remove'></i></a></td>
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
                $this->gps->createUser();
            }
        }

        public function editUser(){
            $id =  $this->uri->segment(3);
            $this->db->where('userId',$id);
            $data['users'] = $this->db->get('user');
            $data['id'] = $id;
            $this->load->view('editUser', $data);
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
			$this->gps->updateUser($id, $data);
			$res['success'] = '<div class="alert alert-success">Updated Successfully</div>';
		}
		header('Content-Type: application/json');
		echo json_encode($res);
		exit;
        }


        public function deleteUser(){
            $id =  $this->input->POST('id');
            $this->gps->deleteUser($id);
            echo'<div class="alert alert-success">One record deleted Successfully</div>';
            exit;
        }



//GPS
	public function showMap()
	{
		$this->load->view('panels');
		$this->load->view('displaymap');
	}

	public function showSettings()
	{
		$this->load->view('panels');
		$this->load->view('settings');
	}

	public function getRoutesForUser(){
		if(isset($_REQUEST['userId'])){
	       		 $routes = $this->gps->getRoutesForUser($_REQUEST['userId']);
	        }else if(isset($_REQUEST['deviceId'])){
	        	$routes = $this->gps->getRoutesForDevice($_REQUEST['deviceId']);
	        }
	        $res['success']="";
	        $locations= array();
		foreach ($routes as $row){
		    array_push($locations,$row);
		}
		$res['locations']= $locations;
		header('Content-Type: application/json');
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadRoutes(".json_encode($res).")";
		}else{
		    echo json_encode($res);
		}
	}

	public function getRoutesForMapBySession(){
		$sessionid = $_REQUEST['sessionId'];
		$routes = $this->gps->getRouteForMapbySession($sessionid);

	        $res['success']="";
	        $locations= array();
		foreach ($routes as $row){
		    array_push($locations,$row);
		}
		$res['locations']= $locations;
		header('Content-Type: application/json');
		if (isset($_REQUEST['jsonpCallback']) || isset($_REQUEST['callback'])){
		    echo "loadRoutes(".json_encode($res).")";
		}else{
		    echo json_encode($res);
		}
	}



	public function createGpsLocation(){
		$this->gps->createGpsLocation();
		$date = new DateTime();
		echo $date->format('U = Y-m-d H:i:s') . "";
	}
}