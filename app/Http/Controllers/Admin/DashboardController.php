<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Auth;
use Hash;
use Validator;
use App\Models\User;
use App\Models\Image;
use App\Models\Document;
use App\Models\Signature;
use Session;
use Stripe;

class DashboardController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware(['auth','verified']);
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $data['image'] = Image::all()->count();
        $data['document'] = Document::all()->count();
        $data['signature'] = Signature::all()->count();
        $data['users'] = User::all()->count();
        return view('admin.dashboard',$data);
    }
    
    public function profile()
    {
        return view('admin.profile');
    }
    
    public function update(Request $request)
    {
        $id = Auth::user()->id;
        $this->validate($request, [
            'name' => 'required',
            'phone' => 'required',
        ]);
    
        $input = $request->all();
    
        $user = User::find($id);
        $user->update($input);

        session::flash('success','Record Updated Successfully');
        return redirect()->back();

    }

    public function change_password()
    {
        return view('auth.change-password');
    }
    public function store_change_password(Request $request)
    {
        $user = Auth::user();
        $userPassword = $user->password;

        $validator =Validator::make($request->all(),[
          'oldpassword' => 'required',
          'newpassword' => 'required|same:password_confirmation|min:6',
          'password_confirmation' => 'required',
        ]);

        if(Hash::check($request->oldpassword, $userPassword)) 
        {
            return back()->with(['error'=>'Old password not match']);
        }

        $user->password = Hash::make($request->newpassword);
        $user->save();

        return redirect()->back()->with("success","Password changed successfully !");
    }

    public function imageList(){
        $img = Image::with('users')->get();
        return view('admin.image',compact('img'));
    }
    

    public function documentList(){
        $doc = Document::with('users')->get();
        return view('admin.document',compact('doc'));
    }
    
    public function document_view($id){

        $doc = Document::with('users')->where('id',$id)->first();
        return view('admin.document-view',compact('doc'));
    }

    public function signatureList(){
        $sign = Signature::with('users')->get();
        return view('admin.signature',compact('sign'));
    }
    
    
}

   

