<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ResetCodePassword;
use Validator;

class ResetPasswordController extends Controller
{
    public function update_password(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users',
            'password' => 'required',
            'confirm_password' => 'required|same:password',
        ]);
   
        if($validator->fails()){
            return response()->json(['success'=>false,'error'=>$validator->errors()->first()]);    
        }

        $user = User::firstWhere('email', $request->email);
        $user->password = \Hash::make($request->password);
        $user->save();
        // $password = \Hash::make($request->new_password);
        
        // dd($user);
        // delete current code 
        ResetCodePassword::Where('code', $request->email)->delete();

        return response(['message' =>'password has been successfully reset'], 200);
    }
}
