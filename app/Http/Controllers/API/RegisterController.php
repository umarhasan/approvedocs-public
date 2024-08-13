<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Validator;
use Hash;

class RegisterController extends BaseController
{
    public function register(Request $request)
    {
		try
		{
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);
   
        if($validator->fails()){
             return $this->sendError($validator->errors()->first());    
        }
   
        $input = $request->except(['_token','c_password'],$request->all());
        if(isset($input)){

            $input['password'] = Hash::make($request['password']);
            $user = User::create($input);
            $success['token'] =  $user->createToken('MyApp')->plainTextToken;
            $success['user_details'] =  $user;
			$preferences = $user->preferences;
            
        }
        return $this->sendResponse($success, 'User register successfully.');
		}
		catch(\Eception $e)
		{
				return $this->sendError($e->getMessage());
		} 		
    }

    
    public function login(Request $request)
    {
        if(!empty($request->all()))
        {
            $validator = Validator::make($request->all(), [
                'email' => 'required|exists:users',
                'password' => 'required',
            ]);
            if ($validator->fails()) 
            {    
				 return $this->sendError($validator->errors()->first());  
            }    
            
            if(Auth::attempt(['email' => $request->email, 'password' => $request->password])){ 
                // $user = Auth::user(); 
                // $success['token'] =  $user->createToken('MyApp')-> accessToken; 
               
                $user = Auth::user(); 
                $success['token'] =  $user->createToken('MyApp')->plainTextToken; 
                $success['user_info'] =  $user;
				$preferences = $user->preferences;

                return $this->sendResponse($success, 'User login successfully.');
            } 
            else{ 
                return $this->sendError('Unauthorised.', ['error'=> 'Password is Incorrect']);
            } 
        }
        else
        { 
            return $this->sendError('Unauthorised.', ['error'=>'Unauthorised']);
        } 
    }
    
    public function adminlogin(Request $request)
    {
            return view('auth.login');
    }
    
}
