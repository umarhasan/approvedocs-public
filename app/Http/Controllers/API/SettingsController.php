<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TaxPayer;
use App\Models\DiligenceVerification;
use App\Models\RefundDispersement;
use App\Models\PaymentMethod;
use App\Models\InternalAudit;
use App\Models\Receptionist;
use App\Models\IrsStatus;
use App\Models\RefundInvoice;
use App\Models\Refferal;
use File;

class SettingsController extends Controller
{
    public function taxpayer(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $taxpayer = TaxPayer::where('receptionist_id',$request->receptionist_id)->first();
                if($taxpayer)
                {
                    $data = $taxpayer->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Tax Payer Updated Successfully','data'=>$user ,'info'=>$taxpayer]);
                }
                else
                {
                    $data = TaxPayer::create($request->all());   
                    $user->taxpayer = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Tax Payer Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
                return $this->sendError($e->getMessage());
        }   
    }
    
    public function diligence_verification(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            $input = $request->all();
            if($user)
            {
                $diligence = DiligenceVerification::where('receptionist_id',$request->receptionist_id)->first();

                // $file = base64_decode($request['image']);
                // $safeName = str_random(10).'.'.'png';
                // $success = file_put_contents(public_path().'/uploads/'.$safeName, $file);
                // if($request->file('signature'))
                // {
                //     if(file_exists($diligence->signature))
                //         File::delete($diligence->signature);
                //     $files = $request->file('signature');
                //     $destinationPath = public_path('/uploads/diligence_verification/'); // upload path
                //     $fileName = date('YmdHis').uniqid() . "." . $files->getClientOriginalExtension();
                //     $files->move($destinationPath, $fileName);
                //  $input['signature'] = asset('/uploads/diligence_verification/'.$fileName);
                    
                // }
                if($diligence)
                {
                    $diligence->update($input);   
                    $data = $diligence;
                    return response()->json(['success'=>true,'message'=>'Diligence Verification Updated Successfully','data'=>$user ,'info'=>$data]);
                }
                else
                {
                    $data = DiligenceVerification::create($input);   
                    $user->diligence_verification = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Diligence Verification Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function refund_dispersements(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $refundd = RefundDispersement::where('receptionist_id',$request->receptionist_id)->first();
                if($refundd)
                {
                    $data = $refundd->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Refund Dispersement Updated Successfully','data'=>$user ,'info'=>$refundd]);
                }
                else
                {
                    $data = RefundDispersement::create($request->all());   
                    $user->refund_dispersement = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Refund Dispersement Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function payment_methods(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $payment = PaymentMethod::where('receptionist_id',$request->receptionist_id)->first();
                if($payment)
                {
                    $data = $payment->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Payment Method Invoice Updated Successfully','data'=>$user ,'info'=>$payment]);
                }
                else
                {
                    $data = PaymentMethod::create($request->all());   
                    $user->payment_method = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Payment Method Invoice Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }

        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function internal_audits(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $audit = InternalAudit::where('receptionist_id',$request->receptionist_id)->first();
                if($audit)
                {
                    $data = $audit->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Internal Audit Invoice Updated Successfully','data'=>$user ,'info'=>$audit]);
                }
                else
                {
                    $data = InternalAudit::create($request->all());   
                    $user->internal_audit = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Internal Audit Invoice Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function irs_status(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $status = IrsStatus::where('receptionist_id',$request->receptionist_id)->first();
                if($status)
                {
                    $data = $status->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Irs Status Invoice Updated Successfully','data'=>$user ,'info'=>$status]);
                }
                else
                {
                    $data = IrsStatus::create($request->all());   
                    $user->irs_status = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Irs Status Invoice Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function refund_invoices(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $refund = RefundInvoice::where('receptionist_id',$request->receptionist_id)->first();
                if($refund)
                {
                    $data = $refund->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Refund Invoice Updated Successfully','data'=>$user ,'info'=>$refund]);
                }
                else
                {
                    $data = RefundInvoice::create($request->all());   
                    $user->refund_invoice = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Refund Invoice Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
    
    public function refferals(Request $request)
    {
        try
        {
            $user = Receptionist::find($request->receptionist_id);
            if($user)
            {
                $refferal = Refferal::where('receptionist_id',$request->receptionist_id)->first();
                if($refferal)
                {
                    $data = $refferal->update($request->all());   
                    return response()->json(['success'=>true,'message'=>'Refferal Updated Successfully','data'=>$user , 'info'=>$refferal]);
                }
                else
                {
                    $data = Refferal::create($request->all());   
                    $user->refferal = 1;
                    $user->save();
                    return response()->json(['success'=>true,'message'=>'Refferal Created Successfully','data'=>$user ,'info'=>$data]);
                }
            }
            else
            {
                return response()->json(['error'=>true,'message'=>'First Form id is not valid']);
            }
        }
        catch(\Eception $e)
        {
            return $this->sendError($e->getMessage());
        }   
    }
}
