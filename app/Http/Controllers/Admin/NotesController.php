<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notes;
use App\Models\Packages;
use App\Models\Place;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // dd('a');
        $notes = Notes::orderby("created_at", "desc")->get();
        $places = Place::all();
        return view('admin.notes.notes', compact('notes', 'places'));
    }
    public function place()
    {
        // dd('a');
        // $notes = Notes::orderby("created_at","desc")->get();
        $places = Place::orderby("created_at","desc")->get();
        return view('admin.notes.places', compact('places'));
    }
    public function package()
    {
        // dd('a');
        // $notes = Notes::orderby("created_at","desc")->get();
        $package = Packages::orderby("created_at","desc")->get();
        return view('admin.notes.package', compact('package'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // return $request;
        DB::beginTransaction();
        try {

            $validator = Validator::make($request->all(), [
                'image' => 'nullable|image|mimes:jpeg,png,jpg,bmp,gif,svg|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->sendError($validator->errors()->first());
            }

            if ($request->hasFile('image')) {
                $image = request()->file('image');
                $fileName = md5($image->getClientOriginalName() . time()) . "PayMefirst." . $image->getClientOriginalExtension();
                $image->move('uploads/storage/notes/', $fileName);
                $notes = asset('uploads/storage/notes/' . $fileName);
            }

            $storage = new Notes();
            $storage->title = $request->title;
            $storage->place_id = $request->place_id;
            $storage->description = $request->description;
            $storage->image = isset($notes) ? $notes : '';
            $storage->save();
            DB::commit();
            return redirect()->back()->with('success', 'Notes Created Successfully');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withInput()->withErrors(['error' => 'Notes creation failed. Please try again.']);
        }
    }
    public function placestore(Request $request)
    {
        // return $request;
        DB::beginTransaction();
        try {

            $validator = Validator::make($request->all(), [
                'image' => 'nullable|image|mimes:jpeg,png,jpg,bmp,gif,svg|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->sendError($validator->errors()->first());
            }


            $storage = new Place();
            $storage->title = $request->title;
            $storage->user_id = auth()->user()->id;
            if ($request->hasFile('image')) {
                $image = request()->file('image');
                $fileName = md5($image->getClientOriginalName() . time()) . "PayMefirst." . $image->getClientOriginalExtension();
                $image->move('uploads/storage/trip/', $fileName);
                $trip = asset('uploads/storage/trip/' . $fileName);
                $storage->image = $trip;
            }
            $storage->notes = $request->notes;

            $storage->save();
            DB::commit();
            return redirect()->back()->with('success', 'Place Created Successfully');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withInput()->withErrors(['error' => 'Place creation failed. Please try again.']);
        }
    }
    public function packagestore(Request $request)
    {
        // return $request;
        try {
            DB::beginTransaction();

            $validatedData = $request->validate([
                'price' => 'required|numeric',
                'description' => 'required',
                'type' => 'required',
            ]);

            Packages::create([
                'price' => $validatedData['price'],
                'description' => $validatedData['description'],
                'type' => $validatedData['type'],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Package created successfully');
        } catch (\Exception $e) {
            DB::rollback();

            \Log::error($e);

            return redirect()->back()->with('error', 'An error occurred while creating the Package'.$e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
