<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receptionist extends Model
{
    use HasFactory;
    protected $guarded=[];

    public function tax_payer()
    {
        return $this->hasMany(\App\Models\TaxPayer::class,'receptionist_id','id');
    }
    
    public function diligenceverification()
    {
        return $this->hasMany(\App\Models\DiligenceVerification::class,'receptionist_id','id');
    }
    
    public function internalaudit()
    {
        return $this->hasMany(\App\Models\InternalAudit::class,'receptionist_id','id');
    }
    
    public function irsstatus()
    {
        return $this->hasMany(\App\Models\IrsStatus::class,'receptionist_id','id');
    }
    
    public function paymentmethod()
    {
        return $this->hasMany(\App\Models\PaymentMethod::class,'receptionist_id','id');
    }
    
    public function refferals()
    {
        return $this->hasMany(\App\Models\Refferal::class,'receptionist_id','id');
    }
    public function refundDispersements()
    {
        return $this->hasMany(\App\Models\RefundDispersement::class,'receptionist_id','id');
    }
    public function refundInvoices()
    {
        return $this->hasMany(\App\Models\RefundInvoice::class,'receptionist_id','id');
    }
}
