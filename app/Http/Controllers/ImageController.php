<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\Response;

class ImageController extends Controller
{
    /**
     * Serve image file from storage/app/public
     * Falls back to box emoji if file not found
     */
    public function serve($path)
    {
        // Sanitize path to prevent directory traversal
        $path = str_replace('..', '', $path);
        $path = ltrim($path, '/');

        // Try to get file from public storage disk
        if (Storage::disk('public')->exists($path)) {
            $file = Storage::disk('public')->path($path);
            
            // Verify file exists before serving
            if (File::exists($file)) {
                return response()->file($file);
            }
        }

        // If file not found, return a 1x1 transparent GIF as fallback
        // This prevents broken image icons and allows emoji fallback in CSS
        return response(
            base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
            200,
            [
                'Content-Type' => 'image/gif',
                'Cache-Control' => 'public, max-age=3600',
            ]
        );
    }
}
