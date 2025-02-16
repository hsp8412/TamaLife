#include <LiquidCrystal.h>

// LCD pins: RS=7, E=6, D4=5, D5=4, D6=3, D7=2
LiquidCrystal lcd(7, 6, 5, 4, 3, 2);

// RGB LED pins
const int redPin   = 9;
const int greenPin = 10;
const int bluePin  = 11;

// Indicator LED (e.g., built-in LED on pin 13)
const int indicatorLED = 13;

// Storage for serial input
String inputString = "";    
bool stringComplete = false;

// Current HP and mood
int currentHP = 0;
String currentMood = "";

// Helper: set RGB color (0-255)
void setColor(byte r, byte g, byte b) {
  analogWrite(redPin,   r);
  analogWrite(greenPin, g);
  analogWrite(bluePin,  b);
}

// Decide LED color based on HP
void updateLEDColor(int hp) {
  if (hp < 33) {
    setColor(255, 0, 0);   // Red
  } else if (hp < 66) {
    setColor(255, 255, 0); // Yellow
  } else {
    setColor(0, 255, 0);   // Green
  }
}

void setup() {
  // Start serial and LCD
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Awaiting data...");
  
  // Set up RGB LED pins
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  setColor(0, 0, 0); // Turn off LED initially
  
  // Set up the indicator LED
  pinMode(indicatorLED, OUTPUT);
  digitalWrite(indicatorLED, LOW);
  
  // Debug message
  Serial.println("Arduino is ready.");
}

void loop() {
  while (Serial.available() > 0) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }

  if (stringComplete) {
    digitalWrite(indicatorLED, HIGH);
    
    // Trim whitespace and newlines
    inputString.trim();
    
    // Parse data
    parseInputAndUpdate(inputString);
    
    // Reset for next message
    inputString = "";
    stringComplete = false;
    
    delay(500);
    digitalWrite(indicatorLED, LOW);
  }
}

void parseInputAndUpdate(const String& data) {
  lcd.clear();
  lcd.setCursor(0, 0);
  
  int commaIndex = data.indexOf(',');
  if (commaIndex == -1) {
    currentHP = data.toInt();
    currentMood = "Unknown";
  } else {
    String hpString = data.substring(0, commaIndex);
    String moodString = data.substring(commaIndex + 1);
    moodString.trim(); // Remove any leftover whitespace/newlines
    
    currentHP = hpString.toInt();
    currentMood = moodString;
  }

  // Update hardware
  updateLEDColor(currentHP);
  lcd.print("HP: ");
  lcd.print(currentHP);
  lcd.setCursor(0, 1);
  lcd.print("Mood: ");
  lcd.print(currentMood);
}
