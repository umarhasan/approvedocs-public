<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\HomeController;
use App\Http\Controllers\API\ForgotPasswordController;
use App\Http\Controllers\API\CodeCheckController;
use App\Http\Controllers\API\SettingsController;
use App\Http\Controllers\API\ResetPasswordController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


Route::post('register', [RegisterController::class, 'register']);
Route::any('login', [RegisterController::class, 'login'])->name('apilogin');



Route::get('location', [homeController::class, 'location']);

    Route::group(['middleware' => ['auth:api','auth:sanctum'], 'prefix' => 'auth'], function () {
    // Route::resource('products', ProductController::class);
    
    Route::get('logout', [homeController::class, 'logout']);
    Route::post('change-password', [homeController::class, 'change_password']);
    Route::post('profile-update', [homeController::class, 'profile']);
    
    Route::post('notes', [homeController::class, 'Notes']);
	Route::post('notes/{id}', [homeController::class, 'NotesUpdate']);
    
    Route::post('trip', [homeController::class, 'Trip']);
    //list    
    Route::get('notes/index', [homeController::class, 'NotesIndex']);
    Route::get('trip/index/{user_id}', [homeController::class, 'TripIndex']);
	Route::post('preferences', [homeController::class, 'Preferences']);
    
    
    Route::post('places', [homeController::class, 'LocationCategory']);
	Route::post('places/update/{id}', [homeController::class, 'LocationCategoryUpdate']);
	Route::get('places/list', [homeController::class, 'PlaceCategoryList']);
	Route::get('/review_detail/{id}',[homeController::class,'ReviewDetail']);	
    Route::post('wishlist', [homeController::class, 'WishListStore']);
	Route::get('wishlist/fetch', [homeController::class, 'WishList']);
	Route::post('wishlist/delete', [homeController::class, 'WishListDelete']);	
	
		
    Route::get('/product', function () {
        return 'welcome';
    });
});


Route::post('password/email',  ForgotPasswordController::class);
Route::post('password/code/check', CodeCheckController::class);
Route::post('password/reset', [ResetPasswordController::class,'update_password']);