<?php

use App\Http\Controllers\Admin\NotesController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\TransactionsController as AdminTransactionsController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Admin\GamesController;
use App\Http\Controllers\GeneralSettingController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Frontend Site
Route::get('/', function () {
    return view('auth.login');
});

Route::get('/signup', [RegisterController::class, 'register_form'])->name('signup');
Route::get('logout', [LoginController::class, 'logout']);
Route::get('account/verify/{token}', [LoginController::class, 'verifyAccount'])->name('user.verify');

Auth::routes();
Route::group(['middleware' => ['auth']], function () {
    Route::resource('userprofile',ProfileController::class);
});
Route::group(['prefix' => 'admin','middleware'=>'auth'], function(){
    Route::get('/change_password', [DashboardController::class, 'change_password'])->name('change_password');
    Route::post('/store_change_password', [DashboardController::class, 'store_change_password'])->name('store_change_password');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::resource('roles', RoleController::class);

    //Notes
    Route::resource('notes', NotesController::class);
    Route::controller(NotesController::class)->group(function () {
        Route::get('place', 'place')->name('place.new');
        Route::post('place/store', 'placestore')->name('place.store');
        Route::get('package', 'package')->name('package.new');
        Route::post('package/store', 'packagestore')->name('package.store');

    });

    Route::resource('permission', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::get('/profile', [DashboardController::class, 'profile'])->name('profile.index');
    Route::get('/image', [DashboardController::class, 'imageList'])->name('image.index');

   });

// Route::group(['prefix'=>'user','middleware'=>['auth','role:user']],function(){

//     Route::get('/dashboard', function () { return view('user.dashboard');})->middleware(['auth', 'verified'])->name('user.dashboard');
//     Route::get('/profile', [\App\Http\Controllers\user\ProfileController::class, 'edit'])->name('user.profile.edit');
//     Route::patch('/profile', [\App\Http\Controllers\user\ProfileController::class, 'update'])->name('user.profile.update');
//     Route::delete('/profile', [\App\Http\Controllers\user\ProfileController::class, 'destroy'])->name('user.profile.destroy');
//     Route::get('user/change_password', [\App\Http\Controllers\user\DashboardController::class, 'change_password'])->name('user.change_password');
//     Route::post('user/change-password', [\App\Http\Controllers\user\DashboardController::class,'changPasswordStore'])->name('user.change.password');
//     Route::get('jokes/list', [\App\Http\Controllers\user\DashboardController::class, 'user_joke'])->name('user.jokes');
//     Route::get('user/jokes/{id}', [\App\Http\Controllers\user\DashboardController::class, 'show'])->name('user.jokes.details');
//     Route::get('mark-joke-as-read/{id}', [\App\Http\Controllers\user\DashboardController::class, 'markAsRead'])->name('mark-joke-as-read');
//     Route::get('/purchase-package/create', [\App\Http\Controllers\user\DashboardController::class,'purchasePackageCreate'])->name('user.purchase.package.create');
//     Route::post('/purchase-package', [\App\Http\Controllers\user\DashboardController::class, 'purchasePackage'])->name('user.purchase.package');
//     Route::post('/stripe', [\App\Http\Controllers\user\SubscriptionController::class, 'stripePost'])->name('stripe.post');

// });

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
