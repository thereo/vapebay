<?php

use Illuminate\Support\Facades\Route;

// The Laravel app is a thin shell around the Filament admin panel. Root URL
// should land directly on the Filament login page.
Route::redirect('/', '/admin/login');
