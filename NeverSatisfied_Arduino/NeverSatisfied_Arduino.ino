// Adafruit IO Subscription Example
//
// Adafruit invests time and resources providing this open source code.
// Please support Adafruit and open source hardware by purchasing
// products from Adafruit!
//
// Written by Todd Treece for Adafruit Industries
// Copyright (c) 2016 Adafruit Industries
// Licensed under the MIT license.
//
// All text above must be included in any redistribution.

/************************** Configuration ***********************************/

// edit the config.h tab and enter your Adafruit IO credentials
// and any additional configuration needed for WiFi, cellular,
// or ethernet clients.
#include "config.h"
#include <Arduino.h>
#include <Encoder.h>
#include "BasicStepperDriver.h"
Encoder myEnc(15, 14);
float oldPosition  = 0;

int angle = 0;

// Motor steps per revolution. Most steppers are 200 steps or 1.8 degrees/step
#define MOTOR_STEPS 200
#define RPM 120
#define MICROSTEPS 1

// All the wires needed for full functionality
#define DIR 12
#define STEP 13
#define ENABLE 16


int x = 0;
int oldvaleur = 0;

// set up the 'counter' feed
AdafruitIO_Feed *counter2 = io.feed("pot-test");
AdafruitIO_Feed *counter = io.feed("enc-test");

BasicStepperDriver stepper(MOTOR_STEPS, DIR, STEP, ENABLE);

//Uncomment line to use enable/disable functionality
//BasicStepperDriver stepper(MOTOR_STEPS, DIR, STEP, ENABLE);

void setup() {
  stepper.begin(RPM, MICROSTEPS);
  stepper.disable();
  Serial.begin(9600);

  // start the serial connection

  // wait for serial monitor to open
  while (! Serial);

  Serial.print("Connecting to Adafruit IO");

  // connect to io.adafruit.com
  io.connect();

  // set up a message handler for the count feed.
  // the handleMessage function (defined below)
  // will be called whenever a message is
  // received from adafruit io.
  counter->onMessage(handleMessage);

  // wait for a connection
  while (io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  // we are connected
  Serial.println();
  Serial.println(io.statusText());

}

void loop() {

  // io.run(); is required for all sketches.
  // it should always be present at the top of your loop
  // function. it keeps the client connected to
  // io.adafruit.com, and processes any incoming data.
  io.run();
  monitor(x);
  long newPosition = myEnc.read();
  Serial.print("newPosition - old -> ");
  Serial.println((newPosition - oldPosition));
  if (newPosition != oldPosition) {
    angle +=  int(((newPosition - oldPosition) / 8135 * 360) * -1);
    oldPosition = newPosition;
  } else {
    if (angle != 0) {
      counter2->save(angle);
      Serial.print("sending -> ");
      Serial.println(angle);
      Serial.println( "stepper number -> " +  String(newPosition - oldPosition));

      angle = 0;
    }
  }
}

// this function is called whenever a 'counter' message
// is received from Adafruit IO. it was attached to
// the counter feed in the setup() function above.
void handleMessage(AdafruitIO_Data *data) {

  Serial.print("received <- ");
  Serial.println(data->value());

  int valeur = data->toInt();
  Serial.println(valeur);
  stepper.enable();
  stepper.rotate(valeur);
//  delay(1000);
  stepper.rotate(valeur);
  stepper.disable();


}

void monitor(int &valeur) {          //pass val by reference: &val
  if (Serial.available()) {
    valeur = Serial.parseInt();    //or parsefloat
    if (oldvaleur != valeur) {
      Serial.println(valeur);
      stepper.enable();
      stepper.rotate(-valeur);
      oldvaleur = valeur;
      stepper.disable();

    }
  }
}
