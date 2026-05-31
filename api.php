<?php
/* ==========================================================================
   PARTYMATCH - LIGHTWEIGHT DECENTRALIZED PHP MULTIPLAYER API
   ========================================================================== */

// Enable Cross-Origin Resource Sharing (CORS) for Render static site hosting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database JSON file path
$dbFile = __DIR__ . '/partymatch_guests.json';

// Helper function to read database safely
function readDb($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

// Helper function to write database safely with exclusive file lock
function writeDb($file, $data) {
    $content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($file, $content, LOCK_EX) !== false;
}

// Helper function to find a guest by exact combination of name and nick
function findGuest($guests, $name, $nick) {
    $searchName = mb_strtolower(trim($name), 'UTF-8');
    $searchNick = mb_strtolower(trim($nick), 'UTF-8');
    
    foreach ($guests as $g) {
        if (mb_strtolower(trim($g['name']), 'UTF-8') === $searchName && 
            mb_strtolower(trim($g['nick']), 'UTF-8') === $searchNick) {
            return $g;
        }
    }
    return null;
}

// Helper function to get clean input parameters (JSON body or Query Params)
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    $decoded = json_decode($rawBody, true);
    $input = is_array($decoded) ? $decoded : $_POST;
} else {
    $input = $_GET;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'check_user':
        // Check if Imię + Nick combination already exists
        $name = isset($input['name']) ? trim($input['name']) : '';
        $nick = isset($input['nick']) ? trim($input['nick']) : '';
        
        if (empty($name) || empty($nick)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Brak wymaganych parametrów (name, nick)"]);
            break;
        }
        
        $guests = readDb($dbFile);
        $existing = findGuest($guests, $name, $nick);
        
        echo json_encode([
            "status" => "success",
            "exists" => $existing !== null
        ]);
        break;
        
    case 'register':
        // Register a new guest profile
        $name = isset($input['name']) ? trim($input['name']) : '';
        $nick = isset($input['nick']) ? trim($input['nick']) : '';
        $table = isset($input['table']) ? intval($input['table']) : 1;
        $team = isset($input['team']) ? trim($input['team']) : '';
        $avatar = isset($input['avatar']) ? trim($input['avatar']) : '🤵';
        $tags = isset($input['tags']) && is_array($input['tags']) ? $input['tags'] : [];
        
        if (empty($name) || empty($nick) || empty($team)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Brak wymaganych danych rejestracyjnych"]);
            break;
        }
        
        $guests = readDb($dbFile);
        $existing = findGuest($guests, $name, $nick);
        
        if ($existing !== null) {
            // Return existing guest as recovery (no PIN required)
            echo json_encode([
                "status" => "success",
                "action" => "recovered",
                "user" => $existing
            ]);
        } else {
            // Create new guest
            $newGuest = [
                "id" => "guest_" . bin2hex(random_bytes(4)) . "_" . time(),
                "name" => $name,
                "nick" => $nick,
                "table" => $table,
                "team" => $team,
                "avatar" => $avatar,
                "tags" => $tags,
                "points" => 0,
                "last_seen" => time()
            ];
            
            $guests[] = $newGuest;
            writeDb($dbFile, $guests);
            
            echo json_encode([
                "status" => "success",
                "action" => "registered",
                "user" => $newGuest
            ]);
        }
        break;
        
    case 'restore':
        // Directly restore existing user profile by Name + Nick
        $name = isset($input['name']) ? trim($input['name']) : '';
        $nick = isset($input['nick']) ? trim($input['nick']) : '';
        
        if (empty($name) || empty($nick)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Brak parametrów name i nick"]);
            break;
        }
        
        $guests = readDb($dbFile);
        $existing = findGuest($guests, $name, $nick);
        
        if ($existing !== null) {
            echo json_encode([
                "status" => "success",
                "user" => $existing
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Nie znaleziono gracza o tych danych"]);
        }
        break;
        
    case 'get_guests':
        // Retrieve list of all joined wedding guests
        $guests = readDb($dbFile);
        
        // Return sorted list: first by points descending, second by name ascending
        usort($guests, function($a, $b) {
            if ($b['points'] !== $a['points']) {
                return $b['points'] - $a['points'];
            }
            return strcmp($a['name'], $b['name']);
        });
        
        echo json_encode($guests);
        break;
        
    case 'add_points':
        // Add points to a guest profile
        $name = isset($input['name']) ? trim($input['name']) : '';
        $nick = isset($input['nick']) ? trim($input['nick']) : '';
        $pointsToAdd = isset($input['points']) ? intval($input['points']) : 0;
        
        if (empty($name) || empty($nick) || $pointsToAdd <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Błędne parametry punktacji"]);
            break;
        }
        
        $guests = readDb($dbFile);
        $found = false;
        
        for ($i = 0; $i < count($guests); $i++) {
            if (mb_strtolower(trim($guests[$i]['name']), 'UTF-8') === mb_strtolower($name, 'UTF-8') && 
                mb_strtolower(trim($guests[$i]['nick']), 'UTF-8') === mb_strtolower($nick, 'UTF-8')) {
                $guests[$i]['points'] += $pointsToAdd;
                $guests[$i]['last_seen'] = time();
                $found = true;
                $updatedGuest = $guests[$i];
                break;
            }
        }
        
        if ($found) {
            writeDb($dbFile, $guests);
            echo json_encode([
                "status" => "success",
                "user" => $updatedGuest
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Nie znaleziono gracza w bazie"]);
        }
        break;
        
    case 'reset':
        // Clear all wedding guests database (e.g. before starting a new wedding!)
        // Simple security passcode to prevent unauthorized clears
        $passcode = isset($input['passcode']) ? trim($input['passcode']) : '';
        
        if ($passcode !== 'wesele2026') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Brak uprawnień. Podaj prawidłowe hasło weselne."]);
            break;
        }
        
        if (writeDb($dbFile, [])) {
            echo json_encode(["status" => "success", "message" => "Baza weselna została zresetowana!"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Błąd zapisu bazy danych"]);
        }
        break;
        
    default:
        // Echo API heartbeat / info
        echo json_encode([
            "status" => "active",
            "app" => "PartyMatch B2B Live API",
            "time" => time()
        ]);
        break;
}
