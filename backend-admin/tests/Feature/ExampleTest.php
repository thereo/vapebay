<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * The root URL should land the user on the Filament admin login page
     * (the Laravel app is a thin shell around Filament). The redirect
     * status is 302, not 200.
     */
    public function test_root_redirects_to_filament_login(): void
    {
        $response = $this->get('/');

        $response->assertStatus(302);
        $response->assertRedirect('/admin/login');
    }
}
