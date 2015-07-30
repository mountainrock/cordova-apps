<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Grid extends CI_Controller {

	public function __construct() {
	    parent::__construct();
	    $this->load->helper("form");
	    $this->load->database();
	    $this->load->model("GridAction_model");
	}
	
	public function loadUserData() {
	
	    $page = isset($_POST['page']) ? $_POST['page'] : 1;
	    $limit = isset($_POST['rows']) ? $_POST['rows'] : 10;
	    $sidx = isset($_POST['sidx']) ? $_POST['sidx'] : 'userName';
	    $sord = isset($_POST['sord']) ? $_POST['sord'] : '';
	    $start = $limit * $page - $limit;
	    $start = ($start < 0) ? 0 : $start;
	
	    $where = "";
	    $searchField = isset($_POST['searchField']) ? $_POST['searchField'] : false;
	    $searchOper = isset($_POST['searchOper']) ? $_POST['searchOper'] : false;
	    $searchString = isset($_POST['searchString']) ? $_POST['searchString'] : false;
	
	    if (isset($_POST['_search'])  && $_POST['_search'] == 'true') {
	        $ops = array(
	            'eq' => '=',
	            'ne' => '<>',
	            'lt' => '<',
	            'le' => '<=',
	            'gt' => '>',
	            'ge' => '>=',
	            'bw' => 'LIKE',
	            'bn' => 'NOT LIKE',
	            'in' => 'LIKE',
	            'ni' => 'NOT LIKE',
	            'ew' => 'LIKE',
	            'en' => 'NOT LIKE',
	            'cn' => 'LIKE',
	            'nc' => 'NOT LIKE'
	        );
	        foreach ($ops as $key => $value) {
	            if ($searchOper == $key) {
	                $ops = $value;
	            }
	        }
	        if ($searchOper == 'eq')
	            $searchString = $searchString;
	        if ($searchOper == 'bw' || $searchOper == 'bn')
	            $searchString .= '%';
	        if ($searchOper == 'ew' || $searchOper == 'en')
	            $searchString = '%' . $searchString;
	        if ($searchOper == 'cn' || $searchOper == 'nc' || $searchOper == 'in' || $searchOper == 'ni')
	            $searchString = '%' . $searchString . '%';
	
	        $where = "$searchField $ops '$searchString' ";
	    }
	
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
	
	    $query = $this->GridAction_model->getAllUsers($start, $limit, $sidx, $sord, $where);
	
	    $responce = new stdClass;
	
	    $responce->page = $page;
	    $responce->total = $total_pages;
	    $responce->records = $count;
	    $i = 0;
	
	    foreach ($query as $row) {
	        $responce->rows[$i]['id'] = $row->userId;
	        $responce->rows[$i]['cell'] = array($row->userId, $row->userName, $row->deviceId, $row->password);
	        $i++;
	    }
	    echo json_encode($responce);
	}
	
	public function crudUser() {
	
	    $oper = $this->input->post('oper');
	    $id = $this->input->post('id');
	    $userId = $this->input->post('userId');
	    $userName = $this->input->post('userName');
	    $deviceId= $this->input->post('deviceId');
	    $password= $this->input->post('password');
	
	    switch ($oper) {
	        case 'add':
	            $data = array( 'userName' => $userName, 'deviceId' => $deviceId, 'password' => $password);
	            $this->GridAction_model->insert_user($data);
	            break;
	        case 'edit':
	            $data = array('DesignationId' => $DesignationId, 'DesignationName' => $DesignationName, 'deviceId' => $deviceId, 'password' => $password);
	            $this->GridAction_model->update_user($userId, $data);
	            break;
	        case 'del':
	            $this->GridAction_model->delete_user($userId);
	            break;
	    }
	} 

} 