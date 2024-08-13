<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use Auth;
use App\Models\User;
use App\Models\Receptionist;
use App\Models\Image;
use App\Models\Document;
use App\Models\Signature;
use App\Models\Notes;
use App\Models\Place;
use App\Models\Locations;
use App\Models\preferences_to_user;
use App\Models\WishList;
use HasApiTokens;
use Validator;
use Hash;
use Illuminate\Support\Facades\Route;
use Stevebauman\Location\Facades\Location;
use GuzzleHttp\Client;
use Laravel\Ui\Presets\React;
use Illuminate\Validation\Rule;

class HomeController extends BaseController
{
    public function logout(Request $request)
    {
        // Auth::logout();
        $user = Auth::user()->token();
        $user->revoke();
        return $this->sendResponse('Success.', ['success'=>'Logout Successfully']);

    }

     public function change_password(Request $request)
    {
        try
        {
      $validator = Validator::make($request->all(),[
          'current_password' => 'required',
          'new_password' => 'required|same:confirm_password',
          'confirm_password' => 'required',
      ]);
      if($validator->fails()){
         return $this->sendError($validator->errors()->first());
        }
        $user = Auth::user();

      if (!Hash::check($request->current_password,$user->password)) {
        return $this->sendError('error', 'current password is Invalid');
      }
      $user->password = Hash::make($request->new_password);
      $user->save();
      return $this->sendResponse('message', 'Password changed successfully !');
    }
    catch(\Eception $e)
    {
            return $this->sendError($e->getMessage());
    }
    }


    public function profile(Request $request)
    {

        try
        {
            $user = User::findOrFail(Auth::id());
            $validator = Validator::make($request->all(),[
                'name' =>'required|string',
                // 'last_name' =>'required|string',
               'image' => 'image|mimes:jpeg,png,jpg,bmp,gif,svg|max:2048',
            ]);
            
            if($validator->fails())
            {
                return $this->sendError($validator->errors()->first());
            }

            $profile = $user->image;
			if($request->hasFile('image'))
			{
				$file = request()->file('image');
				$fileName = md5($file->getClientOriginalName() . time()) . "PayMefirst." . $file->getClientOriginalExtension();
				$file->move('uploads/users/', $fileName);
				$profile = asset('uploads/users/'.$fileName);
			}

            $user->first_name = $request->first_name;
            $user->last_name = $request->last_name;
            $user->name = $request->name;
            // $user->designation = $request->designation;
            $user->image = $profile;
            $user->save();
            return response()->json(['success'=>true,'message'=>'Profile Updated Successfully','user_info'=>$user]);
        }
        catch(\Eception $e)
        {
                return $this->sendError($e->getMessage());
        }
    }
    // Create Notes
    public function Notes(Request $request){

	try{

         $validator = Validator::make($request->all(),[
             'image' => 'nullable|image|mimes:jpeg,png,jpg,bmp,gif,svg|max:2048',
         ]);

         if($validator->fails())
         {
             return $this->sendError($validator->errors()->first());
         }

         if($request->hasFile('image'))
         {
             $image = request()->file('image');
             $fileName = md5($image->getClientOriginalName() . time()) . "PayMefirst." . $image->getClientOriginalExtension();
             $image->move('uploads/storage/notes/', $fileName);
             $notes = asset('uploads/storage/notes/'.$fileName);
         }

         $storage = new Notes();
         $storage->title = $request->title;
         $storage->place_id = $request->place_id;
         $storage->description = $request->description;
         $storage->image = isset($notes) ? $notes : '';
         $storage->save();

         return response()->json(['success'=>true,'message'=>'Notes Create Successfully']);
         }
         catch(\Exception $e)
         {
                 return $this->sendError($e->getMessage());
         }
     }
     // Update Notes
	public function NotesUpdate(Request $request, $id)
{
		    try {
        $validator = Validator::make($request->all(), [
            'image' => 'image|mimes:jpeg,png,jpg,bmp,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->sendError($validator->errors()->first());
        }

        $note = Notes::findOrFail($id);

        // Handle image update if a new image is provided
        if($request->hasFile('image'))
         {
             $image = request()->file('image');
             $fileName = md5($image->getClientOriginalName() . time()) . "PayMefirst." . $image->getClientOriginalExtension();
             $image->move('uploads/storage/notes/', $fileName);
             $notes = asset('uploads/storage/notes/'.$fileName);
         }

        $note->title = $request->input('title');
        $note->place_id = $request->input('place_id');
        $note->description = $request->input('description');

        $note->save();

        return response()->json(['success' => true, 'message' => 'Notes updated successfully']);
    } catch (\Exception $e) {
        return $this->sendError($e->getMessage());
    }
}
    // Image Form
    public function Trip(Request $request){
        try{

         $validator = Validator::make($request->all(),[
             'image' => 'nullable|string',
         ]);

         if($validator->fails())
         {
             return $this->sendError($validator->errors()->first());
         }

         /*if($request->hasFile('image'))
         {
             $image = request()->file('image');
             $fileName = md5($image->getClientOriginalName() . time()) . "PayMefirst." . $image->getClientOriginalExtension();
             $image->move('uploads/storage/trip/', $fileName);
             $trip = asset('uploads/storage/trip/'.$fileName);
         }*/
 		 //$base64Data = substr($request->input('base64_data'), 0, 10000);
         $storage = new Place();
         $storage->title = $request->title;
		 $storage->user_id = $request->user_id;
         $storage->notes = $request->notes;
         $storage->image = $request->input('image');
         $storage->save();

         return response()->json(['success'=>true,'message'=>'Trip Create Successfully']);
         }
         catch(\Exception $e)
         {
                 return $this->sendError($e->getMessage());
         }
     }

    public function NotesIndex(Request $request){
        try{

            if(isset($request->place_id)){
                $notes = Notes::where('place_id',$request->place_id)->get();
            }else{
                $notes = Notes::get();
            }

            return response()->json(['success'=>true,'message'=>'Notes List Successfully','notes' => $notes]);
        }
        catch(\Exception $e)
        {
                return $this->sendError($e->getMessage());
        }
    }

    public function TripIndex($user_id){
		//print_r($id);die;
        try{

			$trip = Place::with('notes')->where('user_id',$user_id)->get();

        //     foreach($document as $doc){

        //     $data[] = [
        //         'id' => $doc['id'],
        //         'user_id' => $doc['user_id'],
        //         'uri' => asset('/').$doc['document'],
        //     ];
        // }
            return response()->json(['success'=>true,'message'=>'Trip List Successfully','Trip' => $trip]);
        }
        catch(\Exception $e)
        {
                return $this->sendError($e->getMessage());
        }
    }

public function LocationCategory(Request $request)
    {
        try
        {

            $validator = Validator::make($request->all(),[
                 'name' => 'required|string|unique:locations', // Replace 'your_table_name' with the actual table name
                 ]);

            if($validator->fails())
            {
                return $this->sendError($validator->errors()->first());
            }
            $placecategory = new Locations();
            $placecategory->name = $request->name;
            $placecategory->save();
            return response()->json(['success'=>true,'message'=>'Place Category Create Successfully','Place'=>$placecategory]);
        }
        catch(\Exception $e)
        {
                return $this->sendError($e->getMessage());
        }
    }

		//Places update
		public function LocationCategoryUpdate(Request $request, $id)
{
		    try {
				$placecategoryUpdate = Locations::findOrFail($id);
				$placecategoryUpdate->name = $request->input('name');
				$placecategoryUpdate->save();
			return response()->json(['success' => true, 'message' => 'Place updated successfully']);
			} catch (\Exception $e) {
				return $this->sendError($e->getMessage());
			}
}

    public function PlaceCategoryList(){
        try{

            $placeCategory = Locations::get();
            return response()->json(['success'=>true,'message'=>'Place List Successfully','Place_Category' => $placeCategory]);
        }
        catch(\Exception $e)
        {
                return $this->sendError($e->getMessage());
        }
    }


	 public function Preferences(Request $request)
     {
		   try {
             $validator = Validator::make($request->all(), [
                 'preferences' => 'required',

             ]);

             if ($validator->fails()) {
                 return $this->sendError($validator->errors()->first());
             }

             $user = Auth::user();
		     $user->preferences()->delete();

             foreach ($request->preferences as $preference) {
                 $pre = new preferences_to_user();
                 $pre->user_id = Auth::user()->id;
                 $pre->preferences = $preference;
                 $pre->save();
             }

     		$user = User::with(['preferences' => function ($query) {
				$query->select('preferences', 'user_id'); // Replace 'user_id' with the actual foreign key column name
			}])->where('id', Auth::user()->id)->first();
        // }
             return response()->json(['success' => true, 'message' => 'Preferences Created Successfully','user' => $user]);
         } catch (\Exception $e) {
             return $this->sendError($e->getMessage());
         }
     }


   public function Location(Request $request) {


        $latitude = $request->latitude;//'24.8757813';
        $longitude = $request->longitude;//'67.0697325';

        $location = Location::get($latitude, $longitude);

        // Retrieve nearby points of interest using Google Maps Places API
        $client = new Client();
        $apiKey = 'AIzaSyDqnUWO38RJMjRlwsY1imxqB1WI8ZWsU3M';
        $interest = request()->place;
        // return $interest;
        $data = [];
        if(isset($interest))
        {
        foreach($interest as $key => $s)
        {
            $response = $client->get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', [
                'query' => [
                    'location' => $latitude . ',' . $longitude,
                    'radius' => 5000, // Radius in meters (adjust as needed)
                    'keyword' => $s, // User-specified interest (e.g., "food", "sports")
                    'key' => $apiKey,
                ],
            ]);
            $places = json_decode($response->getBody(), true)['results'];
            foreach ($places as $place) {

                // Skip places without reviews
                if (!isset($place['rating']) || !isset($place['user_ratings_total']) || $place['user_ratings_total'] === 0) {
                    continue;
                }
                $photoUrl = '';
                if (isset($place['photos']) && count($place['photos']) > 0) {
                    $photoReference = $place['photos'][0]['photo_reference'];
                    $photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=$photoReference&key=$apiKey";
                }

                $data[] = [
                    'id' => $place['place_id'],
                    'name' => $place['name'],
                    'address' => $place['vicinity'],
                    'types' => $place['types'],
                    'rating' => $place['rating'],
                    'totalRatings' => $place['user_ratings_total'],
                    'openNow' => isset($place['opening_hours']['open_now']) ? ($place['opening_hours']['open_now'] ? 'Yes' : 'No') : 'Unknown',
                    'image' => $photoUrl,
                    'latitude' => $place['geometry']['location']['lat'],
                    'longitude' => $place['geometry']['location']['lng'],
                ];
            }
        }
        }
        else
        {
            $response = $client->get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', [
                'query' => [
                    'location' => $latitude . ',' . $longitude,
                    'radius' => 5000, // Radius in meters (adjust as needed)
                   // 'keyword' => , // User-specified interest (e.g., "food", "sports")
                    'key' => $apiKey,
                ],
            ]);
            $places = json_decode($response->getBody(), true)['results'];
            foreach ($places as $place) {

                // Skip places without reviews
                if (!isset($place['rating']) || !isset($place['user_ratings_total']) || $place['user_ratings_total'] === 0) {
                    continue;
                }
                $photoUrl = '';
                if (isset($place['photos']) && count($place['photos']) > 0) {
                    $photoReference = $place['photos'][0]['photo_reference'];
                    $photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=$photoReference&key=$apiKey";
                }

                $data[] = [
                    'id' => $place['place_id'],
                    'name' => $place['name'],
                    'address' => $place['vicinity'],
                    'types' => $place['types'],
                    'rating' => $place['rating'],
                    'totalRatings' => $place['user_ratings_total'],
                    'openNow' => isset($place['opening_hours']['open_now']) ? ($place['opening_hours']['open_now'] ? 'Yes' : 'No') : 'Unknown',
                    'image' => $photoUrl,
                    'latitude' => $place['geometry']['location']['lat'],
                    'longitude' => $place['geometry']['location']['lng'],
                ];
            }
        }


        // Parse the response and extract the relevant information


     	return response()->json(['places'=>$data]);


}

	public function ReviewDetail($id){
    $apiKey = 'AIzaSyDqnUWO38RJMjRlwsY1imxqB1WI8ZWsU3M';
        $allReviews = [];
        //ChIJufOkkI0-sz4Rd2cC0SWIHy8

        $placeId = $id;
        $allReviews = [];

        // Create a GuzzleHTTP client
        $client = new Client();

        // Make an initial request to the Google Maps Places API - Place Details
        $response = $client->get('https://maps.googleapis.com/maps/api/place/details/json', [
            'query' => [
                'place_id' => $placeId,
                'fields' => 'name,formatted_address,rating,reviews,international_phone_number,website,current_opening_hours',
                'key' => $apiKey,
            ],
        ]);

        // Parse the initial response and extract the relevant information
    return $placeDetails = json_decode($response->getBody(), true)['result'];
}

	public function WishListStore(Request $request)
	{
        // print_r($request->all());die;
		try{
		    
			$validator = Validator::make($request->all(), [
		'place_id' => ['required',
			Rule::unique('wish_lists', 'place_id')->where(function ($query) {
					// Yahan aap apni custom condition define kar sakte hain.
					$query->where('user_id', auth()->id()); // For example, check for uniqueness among the current user's wish lists.
				}),
			],
			], [
				'place_id.unique' => 'The Place is already added to your wishlist.', // Custom error message for unique validation
			]);

             if ($validator->fails()) {
                 return $this->sendError($validator->errors()->first());
             }

            $data = new WishList();
			$data->user_id = $request->user_id;
       		$data->place_id = $request->place_id;
       		$data->sub_category = $request->sub_category;
            $data->name = $request->name;
            $data->address = $request->address;
            $data->types = implode(',', $request->types);
            $data->rating = $request->rating;
            $data->totalRatings = $request->totalRatings;
            $data->openNow = $request->openNow;
            $data->image = $request->image;
            $data->latitude = $request->latitude;
            $data->longitude = $request->longitude;
			$data->save();


		 return response()->json(['success'=>true,'message'=>'Wishlist item stored successfully']);
         }
         catch(\Eception $e)
         {
                 return $this->sendError($e->getMessage());
         }
	}

	public function WishList(){

	try{
			$id = Auth::user()->id;
			$wishlist = null;
			$wish = WishList::where('user_id',$id)->get();

			foreach($wish as $data){

             $wishlist[] = [
                 'id' => $data['place_id'],
                 'name' => $data['name'],
				 'address' => $data['address'],
 				 'sub_category' => $data['sub_category'],
				 'types' => $data['types'],
				 'rating' => $data['rating'],
				 'totalRatings' => $data['totalRatings'],
				 'openNow' => $data['openNow'],
				 'image' => $data['image'],
                 'latitude' => $data['latitude'],
				 'longitude' => $data['longitude'],
            ];
         }
            return response()->json(['success'=>true,'message'=>'Wish List Successfully','wish_list' => $wishlist]);
        }
        catch(\Exception $e)
        {
                return $this->sendError($e->getMessage());
        }
	}
	
	
	//public function WishListDelete($id){
		//$deletedCount = WishList::where('id', $id)->delete();
       // return response()->json(['success' => true, 'message' => 'Wish List Successfully Deleted']);
   	//}
		public function WishListDelete(Request $request) {
				$validator = Validator::make($request->all(), [
					'ids' => 'required|array',
					'ids.*' => 'string|distinct',
				]);

				if ($validator->fails()) {
					return response()->json(['success' => false, 'message' => $validator->errors()->first()]);
				}
				$ids = $request->input('ids');
				if (empty($ids)) {
					return response()->json(['success' => false, 'message' => 'No IDs provided for deletion']);
				}
				foreach ($ids as $id) {
					$deletedCount = WishList::where('place_id', $id)->delete();
				}
				return response()->json(['success' => true, 'message' => 'Wish List Successfully Deleted']);
		}
}
