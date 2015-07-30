<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Gridaction_model extends CI_Model {

public function __construct() {
    $this->load->database();
}

function getAllUsers($start, $limit, $sidx, $sord, $where) {

    $this->db->select('userId,userName,deviceId,password');
    $this->db->limit($limit);
    if ($where != NULL)
        $this->db->where($where, NULL, FALSE);
    $this->db->order_by($sidx, $sord);
    $query = $this->db->get('user', $limit, $start);

    return $query->result();
}

function insert_user($data) {
    return $this->db->insert('user', $data);
}

function update_user($id, $data) {
    $this->db->where('DesignationId', $id);
    return $this->db->update('user', $data);
}

function delete_user($id) {
    $this->db->where('userId', $id);
    $this->db->delete('user');
}
}