<?php
// config/redirects.php

return [
    'after_login' => [
        'A' => '/admin/dashboard',
        'C' => '/',
        'default' => '/not-found',
    ],
    
    'after_register' => [
        'A' => '/admin/profile/setup',
        'C' => '/',
        'default' => '/not-found',
    ],
    
    'after_logout' => '/',
    
    'home' => [
        'A' => '/admin/login',
        'C' => '/',
        'default' => '/not-found',
    ],
];