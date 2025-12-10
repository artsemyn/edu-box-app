#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ================= WIFI STATION CONFIG =================
const char* wifi_ssid = "enumatechz";
const char* wifi_pass = "3numaTechn0l0gy";

// ================= WIFI AP CONFIG (Fallback) =================
const char* ap_ssid = "ESP8266_Matrix";
const char* ap_pass = "12345678";

// ================= FIREBASE CONFIG =================
#define FIREBASE_API_KEY "AIzaSyB0eqSeeQumIH6nJPY_1DxeWiqiY0Ro2Cs"
#define FIREBASE_DATABASE_URL "https://edubox-led-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_USER_EMAIL "led@controller.com"
#define FIREBASE_USER_PASSWORD "ledmatrix123"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// =============== PIN SHIFT REGISTER =============
#define PIN_DS     13
#define PIN_SH_CP  12
#define PIN_ST_CP  14

// =============== MATRIX 6x6 ======================
int matrix[6][6];
int anim = 0;
unsigned long lastFrame = 0;
int stepFrame = 0;

// =============== FIREBASE STATUS ===================
bool firebaseReady = false;
unsigned long lastFirebaseCheck = 0;

// ================= CUSTOM PATTERN ===================
int customPattern[6][6] = {0};
bool hasCustomPattern = false;

// ================= WEB SERVER ======================
ESP8266WebServer server(80);

// ================= HTML PAGE ===================
const char webpage[] PROGMEM = R"====(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Matrix 6×6 Animation</title>

<style>
body{
    font-family:Arial;
    text-align:center;
    padding:20px;
    background:#f8f8f8;
}
#matrix-container{
    width:260px;
    height:260px;
    margin:auto;
    display:grid;
    grid-template-columns:repeat(6,1fr);
    grid-gap:6px;
}
.cell{
    width:100%;
    padding-bottom:100%;
    background:#ccc;
    border-radius:6px;
    transition:0.2s;
}
.cell.active{
    background:#00cc44;
    box-shadow:0 0 10px #00cc44;
}
button{
    padding:10px 20px;
    margin:6px;
    border:none;
    background:#0077ff;
    color:white;
    font-size:16px;
    border-radius:6px;
}
button:hover{
   background:#0059cc;
}
h2{
    margin-bottom:10px;
    color:#333;
}
</style>
</head>
<body>

<h2>Matrix 6×6 Animation</h2>

<div id="matrix-container"></div>

<br>
<button onclick="setAnim(1)">Diagonal Bounce</button>
<button onclick="setAnim(2)">Box Rotate</button>
<button onclick="setAnim(3)">Wave</button>
<button onclick="setAnim(4)">Heartbeat</button>
<button onclick="setAnim(5)">Checker</button>
<br>
<button onclick="setAnim(6)">Spiral</button>
<button onclick="setAnim(7)">Rain</button>
<button onclick="setAnim(8)">Cross</button>
<button onclick="setAnim(9)">Border Chase</button>
<button onclick="setAnim(10)">Blink All</button>

<script>
function renderMatrix(data){
    let cont = document.getElementById("matrix-container");
    cont.innerHTML="";

    for(let i=0;i<6;i++){
        for(let j=0;j<6;j++){
            let box=document.createElement("div");
            box.classList.add("cell");
            if(data[i][j]==1) box.classList.add("active");
            cont.appendChild(box);
        }
    }
}

async function loadData(){
    let res = await fetch("/matrix.json");
    let json = await res.json();
    renderMatrix(json.matrix);
}

async function setAnim(a){
    await fetch("/set?anim=" + a);
}

setInterval(loadData, 200);
loadData();

</script>
</body>
</html>
)====";

// =================================================
// =============  FUNGSI MENGIRIM JSON ============
// =================================================
void handleMatrixJSON() {
  String json = "{ \"matrix\": [";
  for (int i = 0; i < 6; i++) {
    json += "[";
    for (int j = 0; j < 6; j++) {
      json += String(matrix[i][j]);
      if (j < 5) json += ",";
    }
    json += "]";
    if (i < 5) json += ",";
  }
  json += "] }";

  server.send(200, "application/json", json);
}

// ================= HTML ==================
void handleRoot() {
  server.send_P(200, "text/html", webpage);
}

// ================== SET ANIMATION ==================
void handleSetAnim() {
  if (server.hasArg("anim")) {
    anim = server.arg("anim").toInt();
    stepFrame = 0;
  }
  server.send(200, "text/plain", "OK");
}

// ================= SHIFT REGISTER - DIFFERENT VERSIONS ================

// VERSION 1: Original (kirim dari [5][5] ke [0][0] - backwards)
void shiftOutMatrix_V1() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int i=5;i>=0;i--){
    for(int j=5;j>=0;j--){
      digitalWrite(PIN_DS, matrix[i][j]);
      digitalWrite(PIN_SH_CP, HIGH);
      digitalWrite(PIN_SH_CP, LOW);
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// VERSION 2: Forward order (kirim dari [0][0] ke [5][5])
void shiftOutMatrix_V2() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int i=0;i<6;i++){
    for(int j=0;j<6;j++){
      digitalWrite(PIN_DS, matrix[i][j]);
      digitalWrite(PIN_SH_CP, HIGH);
      digitalWrite(PIN_SH_CP, LOW);
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// VERSION 3: Column-first order (kirim per kolom, bukan per baris)
void shiftOutMatrix_V3() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int j=5;j>=0;j--){
    for(int i=5;i>=0;i--){
      digitalWrite(PIN_DS, matrix[i][j]);
      digitalWrite(PIN_SH_CP, HIGH);
      digitalWrite(PIN_SH_CP, LOW);
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// VERSION 4: Column-first forward
void shiftOutMatrix_V4() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int j=0;j<6;j++){
    for(int i=0;i<6;i++){
      digitalWrite(PIN_DS, matrix[i][j]);
      digitalWrite(PIN_SH_CP, HIGH);
      digitalWrite(PIN_SH_CP, LOW);
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// VERSION 5: Snake pattern (zigzag per baris)
void shiftOutMatrix_V5() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int i=5;i>=0;i--){
    if(i % 2 == 0){
      // Even rows: forward
      for(int j=0;j<6;j++){
        digitalWrite(PIN_DS, matrix[i][j]);
        digitalWrite(PIN_SH_CP, HIGH);
        digitalWrite(PIN_SH_CP, LOW);
      }
    } else {
      // Odd rows: backward
      for(int j=5;j>=0;j--){
        digitalWrite(PIN_DS, matrix[i][j]);
        digitalWrite(PIN_SH_CP, HIGH);
        digitalWrite(PIN_SH_CP, LOW);
      }
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// VERSION 6: Snake pattern column-wise
void shiftOutMatrix_V6() {
  digitalWrite(PIN_ST_CP, LOW);
  for(int j=5;j>=0;j--){
    if(j % 2 == 0){
      // Even columns: forward
      for(int i=0;i<6;i++){
        digitalWrite(PIN_DS, matrix[i][j]);
        digitalWrite(PIN_SH_CP, HIGH);
        digitalWrite(PIN_SH_CP, LOW);
      }
    } else {
      // Odd columns: backward
      for(int i=5;i>=0;i--){
        digitalWrite(PIN_DS, matrix[i][j]);
        digitalWrite(PIN_SH_CP, HIGH);
        digitalWrite(PIN_SH_CP, LOW);
      }
    }
  }
  digitalWrite(PIN_ST_CP, HIGH);
}

// Active version selector
int shiftOutVersion = 1;  // Change this to test different versions (1-6)

// Change shift version remotely
void setShiftOutVersion(int version) {
  if(version >= 1 && version <= 6) {
    shiftOutVersion = version;
    Serial.print("ShiftOut version changed to: V");
    Serial.println(shiftOutVersion);
  }
}

void shiftOutMatrix() {
  switch(shiftOutVersion) {
    case 1: shiftOutMatrix_V1(); break;
    case 2: shiftOutMatrix_V2(); break;
    case 3: shiftOutMatrix_V3(); break;
    case 4: shiftOutMatrix_V4(); break;
    case 5: shiftOutMatrix_V5(); break;
    case 6: shiftOutMatrix_V6(); break;
    default: shiftOutMatrix_V1(); break;
  }
}

// =================================================
//                   ANIMASI
// =================================================

void clearMatrix(){
  for(int i=0;i<6;i++)
    for(int j=0;j<6;j++)
      matrix[i][j]=0;
}

void animDiagonalBounce(){
  clearMatrix();
  int pos = stepFrame % 10;
  int x;
  if (pos < 5) {
    x = pos;  // maju 0->4
  } else {
    x = 9 - pos;  // mundur 4->0
  }
  matrix[x][x] = 1; // bouncing diagonal
  matrix[x][5-x] = 1; // bouncing diagonal terbalik
}

void animBoxRotate(){
  clearMatrix();
  int s = stepFrame % 4;
  for(int i=0;i<6;i++){
    matrix[s][i] = 1;
    matrix[5-s][i] = 1;
    matrix[i][s] = 1;
    matrix[i][5-s] = 1;
  }
}

void animWave(){
  clearMatrix();
  // Gelombang horizontal dari atas ke bawah
  int offset = stepFrame % 12;
  for(int row=0; row<6; row++){
    int wave = (row + offset) % 12;
    if(wave < 6) {
      matrix[row][wave] = 1;
    }
  }
}

// ---------- HEARTBEAT FIXED ----------
void animHeartBeat(){
  clearMatrix();

  int heartBig[6][6] = {
    {0,1,1,1,1,0},
    {1,1,1,1,1,1},
    {1,1,1,1,1,1},
    {1,1,1,1,1,1},
    {0,1,1,1,1,0},
    {0,0,1,1,0,0},
  };

  int heartSmall[6][6] = {
    {0,0,0,0,0,0},
    {0,1,1,1,1,0},
    {0,1,1,1,1,0},
    {0,1,1,1,1,0},
    {0,0,1,1,0,0},
    {0,0,0,0,0,0},
  };

  int phase = stepFrame % 6;
  bool big = (phase < 3);

  for(int i=0;i<6;i++){
    for(int j=0;j<6;j++){
      matrix[i][j] = big ? heartBig[i][j] : heartSmall[i][j];
    }
  }
}

// ---------- CHECKER ----------
void animCheckerBlink(){
  for(int i=0;i<6;i++){
    for(int j=0;j<6;j++){
      matrix[i][j] = ((i+j+stepFrame)%2==0);
    }
  }
}

// ---------- SPIRAL ----------
void animSpiral(){
  clearMatrix();
  int spiralOrder[36][2] = {
    {0,0},{0,1},{0,2},{0,3},{0,4},{0,5},
    {1,5},{2,5},{3,5},{4,5},{5,5},
    {5,4},{5,3},{5,2},{5,1},{5,0},
    {4,0},{3,0},{2,0},{1,0},
    {1,1},{1,2},{1,3},{1,4},
    {2,4},{3,4},{4,4},
    {4,3},{4,2},{4,1},
    {3,1},{2,1},
    {2,2},{2,3},
    {3,3},{3,2}
  };

  int pos = stepFrame % 36;
  for(int i=0; i<=pos && i<36; i++){
    if(i >= pos-3 && i <= pos) { // trail effect
      matrix[spiralOrder[i][0]][spiralOrder[i][1]] = 1;
    }
  }
}

// ---------- RAIN ----------
void animRain(){
  clearMatrix();
  for(int col=0; col<6; col++){
    int drop = (stepFrame + col*2) % 8;
    if(drop < 6) {
      matrix[drop][col] = 1;
    }
  }
}

// ---------- CROSS EXPAND ----------
void animCrossExpand(){
  clearMatrix();
  int size = stepFrame % 4;

  // vertical line
  for(int i=0; i<6; i++){
    matrix[i][3] = 1;
  }

  // horizontal line
  for(int j=0; j<6; j++){
    matrix[2][j] = 1;
  }

  // expanding corners
  if(size > 0){
    matrix[0][0] = 1; matrix[0][5] = 1;
    matrix[5][0] = 1; matrix[5][5] = 1;
  }
  if(size > 1){
    matrix[1][1] = 1; matrix[1][4] = 1;
    matrix[4][1] = 1; matrix[4][4] = 1;
  }
  if(size > 2){
    matrix[2][2] = 1; matrix[2][3] = 1;
    matrix[3][2] = 1; matrix[3][3] = 1;
  }
}

// ---------- BORDER CHASE ----------
void animBorderChase(){
  clearMatrix();
  int pos = stepFrame % 20;

  int borderPos[20][2] = {
    {0,0},{0,1},{0,2},{0,3},{0,4},{0,5},
    {1,5},{2,5},{3,5},{4,5},{5,5},
    {5,4},{5,3},{5,2},{5,1},{5,0},
    {4,0},{3,0},{2,0},{1,0}
  };

  for(int i=0; i<3; i++){
    int idx = (pos + i*7) % 20;
    matrix[borderPos[idx][0]][borderPos[idx][1]] = 1;
  }
}

// ---------- BLINK ALL ----------
void animBlinkAll(){
  int on = (stepFrame % 2 == 0);
  for(int i=0; i<6; i++){
    for(int j=0; j<6; j++){
      matrix[i][j] = on;
    }
  }
}

// ---------- CUSTOM PATTERN ----------
void animCustomPattern(){
  for(int i=0; i<6; i++){
    for(int j=0; j<6; j++){
      matrix[i][j] = customPattern[i][j];
    }
  }
}

// ---------- LED MAPPING TEST ----------
void animLEDTest(){
  clearMatrix();
  // Light up one LED at a time to help with mapping
  int totalLEDs = 36;
  int currentLED = (stepFrame / 3) % totalLEDs; // Change every 3 frames (slower)

  int row = currentLED / 6;
  int col = currentLED % 6;

  matrix[row][col] = 1;

  // Print current position to Serial for debugging
  static int lastLED = -1;
  if (currentLED != lastLED) {
    Serial.print("Testing LED - Row: ");
    Serial.print(row);
    Serial.print(", Col: ");
    Serial.println(col);
    lastLED = currentLED;
  }
}

// ---------- ROW TEST ----------
void animRowTest(){
  clearMatrix();
  // Light up one full row at a time
  int currentRow = (stepFrame / 5) % 6; // Change every 5 frames

  for(int j=0; j<6; j++){
    matrix[currentRow][j] = 1;
  }

  static int lastRow = -1;
  if (currentRow != lastRow) {
    Serial.print("Testing Row: ");
    Serial.println(currentRow);
    lastRow = currentRow;
  }
}

// ---------- COLUMN TEST ----------
void animColumnTest(){
  clearMatrix();
  // Light up one full column at a time
  int currentCol = (stepFrame / 5) % 6; // Change every 5 frames

  for(int i=0; i<6; i++){
    matrix[i][currentCol] = 1;
  }

  static int lastCol = -1;
  if (currentCol != lastCol) {
    Serial.print("Testing Column: ");
    Serial.println(currentCol);
    lastCol = currentCol;
  }
}

// ================= MAIN ANIMATOR ==================
void playAnimation(){
  if(millis() - lastFrame < 150) return;
  lastFrame = millis();
  stepFrame++;

  switch(anim){
    case 1: animDiagonalBounce(); break;
    case 2: animBoxRotate(); break;
    case 3: animWave(); break;
    case 4: animHeartBeat(); break;
    case 5: animCheckerBlink(); break;
    case 6: animSpiral(); break;
    case 7: animRain(); break;
    case 8: animCrossExpand(); break;
    case 9: animBorderChase(); break;
    case 10: animBlinkAll(); break;
    case 11: animCustomPattern(); break;  // Custom pattern mode
    case 12: animLEDTest(); break;  // LED mapping test mode
    case 13: animRowTest(); break;  // Row test mode
    case 14: animColumnTest(); break;  // Column test mode
  }
}

// =================================================
//              FIREBASE LISTENER
// =================================================
void checkFirebaseAnimation() {
  if (!firebaseReady) return;

  // Check every 500ms to avoid too many requests
  if (millis() - lastFirebaseCheck < 500) return;
  lastFirebaseCheck = millis();

  // Read animation value
  if (Firebase.RTDB.getInt(&fbdo, "/ledMatrix/animation")) {
    if (fbdo.dataType() == "int") {
      int newAnim = fbdo.intData();
      if (newAnim != anim && newAnim >= 0 && newAnim <= 14) {
        anim = newAnim;
        stepFrame = 0;
        Serial.print("Animation changed via Firebase: ");
        Serial.println(anim);

        // If custom pattern mode, load the pattern
        if (anim == 11) {
          loadCustomPattern();
        }
      }
    }
  } else {
    Serial.println("Firebase read failed: " + fbdo.errorReason());
  }

  // Read shiftOut version
  if (Firebase.RTDB.getInt(&fbdo, "/ledMatrix/shiftVersion")) {
    if (fbdo.dataType() == "int") {
      int newVersion = fbdo.intData();
      if (newVersion != shiftOutVersion) {
        setShiftOutVersion(newVersion);
      }
    }
  }
}

// Load custom pattern from Firebase
void loadCustomPattern() {
  Serial.println("Loading custom pattern from Firebase...");

  if (Firebase.RTDB.getJSON(&fbdo, "/ledMatrix/customPattern")) {
    if (fbdo.dataType() == "json") {
      FirebaseJson &json = fbdo.jsonObject();
      FirebaseJsonData result;

      // Parse the 2D array
      for (int i = 0; i < 6; i++) {
        String path = String(i);
        if (json.get(result, path)) {
          FirebaseJsonArray arr;
          result.get<FirebaseJsonArray>(arr);

          for (int j = 0; j < 6; j++) {
            FirebaseJsonData value;
            arr.get(value, j);
            customPattern[i][j] = value.intValue;
          }
        }
      }

      hasCustomPattern = true;
      Serial.println("Custom pattern loaded successfully!");
    }
  } else {
    Serial.println("Failed to load custom pattern: " + fbdo.errorReason());
  }
}

// =================================================
//                       SETUP
// =================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ESP8266 LED Matrix with Firebase ===");

  pinMode(PIN_DS, OUTPUT);
  pinMode(PIN_SH_CP, OUTPUT);
  pinMode(PIN_ST_CP, OUTPUT);

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(wifi_ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid, wifi_pass);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed! Starting AP mode as fallback...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_pass);
    Serial.print("AP IP Address: ");
    Serial.println(WiFi.softAPIP());
  }

  // Start Web Server
  server.on("/", handleRoot);
  server.on("/matrix.json", handleMatrixJSON);
  server.on("/set", handleSetAnim);
  server.begin();
  Serial.println("Web server started");

  // Configure Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DATABASE_URL;

  // Set user credentials for authentication
  auth.user.email = FIREBASE_USER_EMAIL;
  auth.user.password = FIREBASE_USER_PASSWORD;

  // Token status callback
  config.token_status_callback = tokenStatusCallback;

  // Initialize Firebase
  Serial.println("Initializing Firebase...");

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Authenticating with Firebase...");
  unsigned long fbStart = millis();
  while (!Firebase.ready() && millis() - fbStart < 15000) {
    delay(100);
    Serial.print(".");
  }

  if (Firebase.ready()) {
    firebaseReady = true;
    Serial.println("\nFirebase Ready!");

    // Set initial value in database
    if (Firebase.RTDB.setInt(&fbdo, "/ledMatrix/animation", anim)) {
      Serial.println("Initial animation value set in Firebase");
    } else {
      Serial.println("Failed to set initial value: " + fbdo.errorReason());
    }
  } else {
    Serial.println("\nFirebase connection failed!");
    Serial.println("Check your Firebase credentials.");
  }

  clearMatrix();
  Serial.println("Setup complete!");
}

// =================================================
//                        LOOP
// =================================================
void loop() {
  server.handleClient();
  checkFirebaseAnimation();  // Check for Firebase updates
  playAnimation();
  shiftOutMatrix();
}